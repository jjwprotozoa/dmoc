// src/workers/service-worker.ts
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';

// Service Worker event types
interface PushEvent extends Event {
  data?: PushMessageData;
  waitUntil(promise: Promise<unknown>): void;
}

interface NotificationEvent extends Event {
  notification: Notification;
  waitUntil(promise: Promise<unknown>): void;
}

interface PushMessageData {
  json(): unknown;
  text(): string;
  arrayBuffer(): ArrayBuffer;
  blob(): Blob;
}

interface Client {
  id: string;
  type: string;
  url: string;
}

interface WindowClient extends Client {
  focused: boolean;
  visible: boolean;
  focus(): Promise<WindowClient>;
  navigate(url: string): Promise<WindowClient>;
}

interface Clients {
  openWindow(url: string): Promise<WindowClient | null>;
  matchAll(): Promise<Client[]>;
  claim(): Promise<void>;
}

declare const self: ServiceWorkerGlobalScope & {
  addEventListener: typeof addEventListener;
  registration: ServiceWorkerRegistration;
  clients: Clients;
};

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST);

// Clean up outdated caches
cleanupOutdatedCaches();

// Handle navigation requests with offline fallback
const navigationRoute = new NavigationRoute(async ({ request }) => {
  try {
    return await fetch(request);
  } catch {
    const offlineResponse = await caches.match('/offline.html');
    return offlineResponse || new Response('Offline', { status: 503 });
  }
});

registerRoute(navigationRoute);

// Cache API routes with network-first strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
  })
);

// Cache static assets with stale-while-revalidate
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// Handle push notifications (placeholder)
self.addEventListener('push', (event) => {
  const pushEvent = event as PushEvent;
  if (pushEvent.data) {
    const data = pushEvent.data.json() as { title: string; body: string };
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
    };

    pushEvent.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  const notificationEvent = event as NotificationEvent;
  notificationEvent.notification.close();

  notificationEvent.waitUntil(self.clients.openWindow('/'));
});
