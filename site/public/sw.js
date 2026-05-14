// Service worker for the TWO admin PWA. Two responsibilities:
//   1. Receive Web Push messages and show a system notification.
//   2. Focus / open the right admin URL when the notification is tapped.
//
// Lives at /sw.js (root) so it can be scoped to /admin/. Registered
// by `PushSetup` once the staff member visits /admin/* in a browser
// that supports Service Worker.

self.addEventListener('install', () => {
  // Activate immediately on update — staff don't need to wait for a
  // full reload to get fixed push handling.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim any open admin tabs so the new SW handles their pushes.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data = {};
  try {
    data = event.data.json();
  } catch (_) {
    data = { title: 'New message', body: event.data.text() };
  }

  const title = data.title || 'New SMS';
  const body = data.body || '';
  const url = data.url || '/admin/collections/conversations';
  const tag = data.tag || 'sms-inbox';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag, // collapses repeated pushes for the same conversation
      renotify: true,
      icon: '/two-favicon-192.png',
      badge: '/two-favicon-192.png',
      data: { url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/admin/collections/conversations';

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      // Reuse an existing admin tab if one is open — feels more native.
      for (const client of allClients) {
        if (client.url.includes('/admin') && 'focus' in client) {
          client.navigate(targetUrl).catch(() => {});
          return client.focus();
        }
      }
      // Otherwise open a new window/tab.
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })(),
  );
});
