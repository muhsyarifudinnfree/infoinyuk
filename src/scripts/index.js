import 'toastify-js/src/toastify.css';
import 'leaflet/dist/leaflet.css';
import '../styles/styles.css';
import { isServiceWorkerAvailable } from './utils';
import App from './pages/app';
import { getAccessToken } from './utils/auth';
import {
  generateNavigationAuthenticated,
  generateNavigationUnauthenticated,
} from './components/templates';
import useToast from './utils/toast';
import {
  subscribe,
  unsubscribe,
  isCurrentPushSubscriptionAvailable,
} from './utils/notification-helper';
import { getAllStories } from './data/api';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector(".dropdown [role='button']"),
    navigationDrawer: document.querySelector('.dropdown-content'),
  });

  if (!isServiceWorkerAvailable()) {
    console.log('Service Worker API unsupported');
    useToast('Service Worker tidak didukung di browser ini.', 'error');
    return;
  }

  // Poll for new stories every 30 seconds when logged in
  let lastStoryId = null;
  const pollForNewStories = async () => {
    if (!getAccessToken()) return;
    try {
      const { ok, listStory } = await getAllStories();
      if (ok && listStory.length > 0) {
        const latestStoryId = listStory[0].id;
        if (lastStoryId && lastStoryId !== latestStoryId) {
          // New story detected
          if (Notification.permission === 'granted') {
            new Notification('InfoinYuk', {
              body: 'Ada informasi baru ditambahkan!',
              icon: '/images/icon512.png',
            });
          }
        }
        lastStoryId = latestStoryId;
      }
    } catch (error) {
      console.error('Error polling stories:', error);
    }
  };

  // Start polling when logged in
  if (getAccessToken()) {
    await pollForNewStories();
    setInterval(pollForNewStories, 30000); // Poll every 30 seconds
  }

  // Function to update navbar and push notification button
  const updateNavbar = async () => {
    const navigationDrawer = document.querySelector('.dropdown-content');
    const pushButton = document.querySelector('#push-subscription-button');
    if (navigationDrawer) {
      navigationDrawer.innerHTML = getAccessToken()
        ? generateNavigationAuthenticated()
        : generateNavigationUnauthenticated();
      navigationDrawer.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          navigationDrawer.classList.add('hidden');
          document
            .querySelector(".dropdown [role='button']")
            .setAttribute('aria-expanded', 'false');
        });
      });
    }
    if (pushButton) {
      if (getAccessToken()) {
        pushButton.classList.remove('hidden');
        const isSubscribed = await isCurrentPushSubscriptionAvailable();
        pushButton.innerHTML = isSubscribed
          ? '<i class="fas fa-bell-slash"></i> Unsubscribe'
          : '<i class="fas fa-bell"></i> Subscribe';
        pushButton.setAttribute(
          'aria-label',
          isSubscribed
            ? 'Berhenti berlangganan notifikasi'
            : 'Berlangganan notifikasi'
        );
        pushButton.onclick = async () => {
          try {
            if (isSubscribed) {
              await unsubscribe();
            } else {
              await subscribe();
            }
            await updateNavbar();
          } catch (error) {
            console.error('Push notification toggle error:', error);
            useToast('Gagal mengubah status notifikasi.', 'error');
          }
        };
      } else {
        pushButton.classList.add('hidden');
      }
    }
  };

  try {
    await updateNavbar();
    const initialUrl = getActiveRoute();
    if (getAccessToken() && ['/', '/login', '/register'].includes(initialUrl)) {
      useToast('Anda sudah login, dialihkan ke Home', 'info');
    }
    await app.renderPage();
  } catch (error) {
    console.error('Initial page load error:', error);
    document.querySelector('#main-content').innerHTML = `
      <div class="alert alert-error shadow-lg animate-fade-in" role="alert">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Gagal memuat halaman. Silakan coba lagi nanti.</span>
        </div>
      </div>
    `;
  }

  window.addEventListener('hashchange', async () => {
    try {
      const url = getActiveRoute();
      if (getAccessToken() && ['/', '/login', '/register'].includes(url)) {
        useToast('Anda sudah login, dialihkan ke Home', 'info');
      }
      await app.renderPage();
      await updateNavbar();
    } catch (error) {
      console.error('Page load error on hash change:', error);
    }
  });

  function getActiveRoute() {
    return window.location.hash.slice(1) || '/';
  }
});
