import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import CONFIG from './config';

// Precache assets generated by VitePWA
precacheAndRoute(self.__WB_MANIFEST);

// Cache Google Fonts (CSS and font files)
registerRoute(
  ({ url }) =>
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 30, // Cache for 30 days
      }),
    ],
  })
);

// Cache OpenStreetMap tiles
registerRoute(
  ({ url }) => url.origin === 'https://tile.openstreetmap.org',
  new StaleWhileRevalidate({
    cacheName: 'openstreetmap-tiles',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 1000,
        maxAgeSeconds: 60 * 60 * 24 * 7, // Cache for 7 days
      }),
    ],
  })
);

// Cache FontAwesome assets
registerRoute(
  ({ url }) =>
    url.origin === 'https://cdnjs.cloudflare.com' &&
    url.pathname.includes('fontawesome'),
  new CacheFirst({
    cacheName: 'fontawesome',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 30, // Cache for 30 days
      }),
    ],
  })
);

// Cache Story API (non-image requests)
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return url.origin === baseUrl.origin && request.destination !== 'image';
  },
  new StaleWhileRevalidate({
    cacheName: 'story-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24, // Cache for 1 day
      }),
    ],
  })
);

// Cache Story API images
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return url.origin === baseUrl.origin && request.destination === 'image';
  },
  new StaleWhileRevalidate({
    cacheName: 'story-api-images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7, // Cache for 7 days
      }),
    ],
  })
);

// Cache MapTiler API (tiles and geocoding)
registerRoute(
  ({ url }) => url.origin.includes('maptiler'),
  new CacheFirst({
    cacheName: 'maptiler-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 1000,
        maxAgeSeconds: 60 * 60 * 24 * 7, // Cache for 7 days
      }),
    ],
  })
);

// Handle push notifications
self.addEventListener('push', (event) => {
  let data = {
    title: 'InfoinYuk',
    body: 'Ada informasi baru!',
    url: '/#/home',
  };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (error) {
    console.error('Error parsing push data:', error);
  }

  const options = {
    body: data.body,
    icon: '/images/icon512.png',
    badge: '/images/icon512.png',
    data: { url: data.url },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options).catch((error) => {
      console.error('Error showing notification:', error);
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/#/home';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if no matching window found
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
      .catch((error) => {
        console.error('Error handling notification click:', error);
      })
  );
});
