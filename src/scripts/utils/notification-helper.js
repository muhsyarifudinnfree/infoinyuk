import { convertBase64ToUint8Array } from '.';
import CONFIG from '../config';
import {
  subscribePushNotification,
  unsubscribePushNotification,
} from '../data/api';
import useToast from './toast';

export function isNotificationAvailable() {
  return 'Notification' in window;
}

export function isNotificationGranted() {
  return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error('Notification API unsupported.');
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === 'denied') {
    useToast('Izin notifikasi ditolak.', 'error');
    return false;
  }

  if (status === 'default') {
    useToast('Izin notifikasi ditutup atau diabaikan.', 'error');
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return null;
  return await registration.pushManager.getSubscription();
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(CONFIG.SUBSCRIPTION_KEY),
  };
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) {
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    useToast('Sudah berlangganan push notification.', 'success');
    return;
  }

  console.log('Mulai berlangganan push notification...');
  const failureSubscribeMessage =
    'Langganan push notification gagal diaktifkan.';
  const successSubscribeMessage =
    'Langganan push notification berhasil diaktifkan.';

  let pushSubscription;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      useToast('Service worker tidak terdaftar.', 'error');
      return;
    }
    pushSubscription = await registration.pushManager.subscribe(
      generateSubscribeOptions()
    );
    const { endpoint, keys } = pushSubscription.toJSON();

    if (!endpoint) {
      throw new Error('Endpoint is undefined');
    }

    if (!keys || !('p256dh' in keys) || !('auth' in keys)) {
      throw new Error('Invalid keys in push subscription');
    }

    const response = await subscribePushNotification({
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    if (!response.ok) {
      console.error('subscribe: response:', response);
      useToast(failureSubscribeMessage, 'error');
      await pushSubscription.unsubscribe();
      return;
    }

    console.log('Successfully subscribed to push notifications:', endpoint);
    useToast(successSubscribeMessage, 'success');
  } catch (error) {
    console.error('subscribe: error:', error);
    useToast(failureSubscribeMessage, 'error');
    if (pushSubscription) {
      await pushSubscription.unsubscribe();
    }
  }
}

export async function unsubscribe() {
  const failureUnsubscribeMessage =
    'Langganan push notification gagal dinonaktifkan.';
  const successUnsubscribeMessage =
    'Langganan push notification berhasil dinonaktifkan.';

  try {
    const pushSubscription = await getPushSubscription();
    if (!pushSubscription) {
      useToast('Tidak ada langganan aktif untuk dihentikan.', 'info');
      console.log('No active push subscription found.');
      return;
    }

    const { endpoint, keys } = pushSubscription.toJSON();
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      throw new Error('Invalid push subscription data');
    }

    console.log('Attempting to unsubscribe endpoint:', endpoint);

    // Call the server to remove the subscription
    const response = await unsubscribePushNotification({ endpoint });
    if (!response.ok) {
      console.error('unsubscribe: API response:', response);
      useToast(failureUnsubscribeMessage, 'error');
      return;
    }

    // Attempt to unsubscribe from the browser's push manager
    let unsubscribed = false;
    for (let i = 0; i < 3; i++) {
      try {
        unsubscribed = await pushSubscription.unsubscribe();
        if (unsubscribed) break;
        console.warn(`Retry unsubscribe attempt ${i + 1}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (retryError) {
        console.warn(`Retry ${i + 1} failed:`, retryError);
      }
    }

    if (!unsubscribed) {
      console.error('unsubscribe: Failed to unsubscribe from push manager');
      useToast(failureUnsubscribeMessage, 'error');
      // Attempt to resubscribe to avoid inconsistent state (optional, depending on your API)
      await subscribePushNotification({
        endpoint,
        keys: { p256dh: keys.p256dh, auth: keys.auth },
      });
      return;
    }

    console.log('Successfully unsubscribed from push notifications.');
    useToast(successUnsubscribeMessage, 'success');

    // Force update the service worker to ensure no stale subscriptions remain
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
    }

    // Trigger UI update
    const event = new Event('subscriptionChange');
    window.dispatchEvent(event);

    // Verify subscription is removed
    const finalSubscription = await getPushSubscription();
    if (finalSubscription) {
      console.warn(
        'Subscription still exists after unsubscribe:',
        finalSubscription
      );
      useToast(failureUnsubscribeMessage, 'error');
    } else {
      console.log('Verified: No active subscription after unsubscribe.');
    }
  } catch (error) {
    console.error('unsubscribe: error:', error);
    useToast(failureUnsubscribeMessage, 'error');
  }
}
