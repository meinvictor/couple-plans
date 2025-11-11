import ReactDOM from 'react-dom/client';
import './styles/global.css';
import App from './App';
import { messaging } from './firebase/config';
import { getToken, onMessage } from 'firebase/messaging';
import { db, setDoc, doc } from './firebase/config';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);

// Register the FCM service worker and request permission + token
async function initFCM() {
  try {
    if (!('serviceWorker' in navigator)) return;
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notifications permission not granted');
      return;
    }

    const vapidKey = process.env.REACT_APP_VAPID_KEY;
    if (!vapidKey) {
      console.warn('Missing REACT_APP_VAPID_KEY environment variable for FCM Web Push');
      return;
    }

    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
    if (token) {
      console.log('FCM token:', token);
      // Persist token for backend notifications
      const userId = 'user1'; // adjust when real auth is added
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      await setDoc(doc(db, 'fcmTokens', userId), {
        token,
        userId,
        timezone: tz,
        updatedAt: Date.now()
      }, { merge: true });
    } else {
      console.warn('Failed to get FCM token');
    }

    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      const notification = payload.notification || {};
      if (notification?.title) {
        // Best-effort simple notification while app is in foreground
        new Notification(notification.title, {
          body: notification.body || '',
          icon: '/logo192.png'
        });
      }
    });
  } catch (err) {
    console.error('FCM init error', err);
  }
}

initFCM();


