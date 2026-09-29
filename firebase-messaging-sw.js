importScripts('https://www.gstatic.com/firebasejs/12.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBdrpHAA1f8u4Y3NcmUJvJ_4k8oa3cWMjs',
  authDomain: 'dxb-staff-wayfinder.firebaseapp.com',
  projectId: 'dxb-staff-wayfinder',
  storageBucket: 'dxb-staff-wayfinder.firebasestorage.app',
  messagingSenderId: '975115625194',
  appId: '1:975115625194:web:bd1a0f1c2a1522555c2d93'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || payload.data?.title || 'DXB Staff Wayfinder';
  const body = payload.notification?.body || payload.data?.body || 'New staff notification';
  self.registration.showNotification(title, {
    body,
    tag: payload.data?.alertId || 'dxb-wayfinder-alert',
    renotify: true,
    data: { url: payload.data?.url || './' }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification?.data?.url || './';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const client of list) {
      if ('focus' in client) { client.focus(); return; }
    }
    return clients.openWindow(url);
  }));
});

// Network-first fetch handler for PWA installability.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request));
});
