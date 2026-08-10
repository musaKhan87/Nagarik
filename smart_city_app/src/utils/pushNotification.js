import api from '../api';

/**
 * Utility to convert base64 VAPID public key string to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Register Service Worker (/sw.js)
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker is not supported in this browser.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return registration;
  } catch (err) {
    console.error('Service Worker registration failed:', err);
    return null;
  }
}

/**
 * Check current push notification permission & subscription status
 */
export async function checkPushSubscriptionStatus() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { isSupported: false, isSubscribed: false, permission: 'denied' };
  }

  const permission = Notification.permission;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  return {
    isSupported: true,
    isSubscribed: !!subscription,
    permission,
    subscription
  };
}

/**
 * Subscribe logged in user to Web Push Notifications
 */
export async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications are not supported by your browser.');
  }

  // Request Notification permission from user
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was denied by user.');
  }

  // Register service worker
  let registration = await navigator.serviceWorker.getRegistration('/');
  if (!registration) {
    registration = await registerServiceWorker();
  }
  await navigator.serviceWorker.ready;

  // Get VAPID Public Key from backend API
  const res = await api.get('/notifications/vapid-public-key');
  const vapidPublicKey = res.data.publicKey;
  if (!vapidPublicKey) {
    throw new Error('Failed to retrieve VAPID public key from backend server.');
  }

  const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

  // Obtain Web Push Subscription from browser PushManager
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedKey
  });

  // Store subscription securely in MongoDB associated with user account
  const subJSON = subscription.toJSON();
  await api.post('/notifications/subscribe', { subscription: subJSON });

  return subscription;
}

/**
 * Unsubscribe user from Web Push Notifications
 */
export async function unsubscribeUserFromPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    await api.post('/notifications/unsubscribe', { endpoint });
    return true;
  }
  return false;
}
