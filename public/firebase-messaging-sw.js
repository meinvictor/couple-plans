self.importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js');
self.importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCjlOYmUvIPkIh2ZUKktnEyisug_siu1z0",
  authDomain: "couple-todo-306dd.firebaseapp.com",
  projectId: "couple-todo-306dd",
  storageBucket: "couple-todo-306dd.firebasestorage.app",
  messagingSenderId: "1099468628613",
  appId: "1:1099468628613:web:e2f784e37a93585700ffec",
  measurementId: "G-VKG14LWWM4"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notification = payload.notification || {};
  const title = notification.title || 'New message';
  const options = {
    body: notification.body || '',
    icon: '/logo192.png',
    data: payload.data || {}
  };
  self.registration.showNotification(title, options);
});
