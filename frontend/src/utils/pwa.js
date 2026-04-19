// client/src/utils/pwa.js
// Handles: service worker registration, install prompt, push subscription

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

// ── Service Worker Registration ──
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('SW registered:', reg.scope);
    return reg;
  } catch (err) {
    console.warn('SW registration failed:', err);
    return null;
  }
}

// ── Install Prompt (Add to Home Screen) ──
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  // Dispatch custom event so the app can show its own install button
  window.dispatchEvent(new CustomEvent('pwa-installable'));
});

export async function promptInstall() {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === 'accepted';
}

export function isInstallable() {
  return !!deferredPrompt;
}

export function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
}

// ── Push Notifications ──
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export async function subscribeToPush(registration) {
  if (!VAPID_PUBLIC_KEY) {
    console.warn('VITE_VAPID_PUBLIC_KEY not set — push notifications disabled');
    return null;
  }
  try {
    const existing = await registration.pushManager.getSubscription();
    if (existing) return existing;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    return subscription;
  } catch (err) {
    console.warn('Push subscription failed:', err);
    return null;
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return Notification.permission === 'denied' ? 'denied' : await Notification.requestPermission();
}

// ── Full setup — call once on app load ──
export async function setupPWA() {
  const reg = await registerServiceWorker();
  if (!reg) return;

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') return;

  const subscription = await subscribeToPush(reg);
  if (!subscription) return;

  // Send subscription to server
  try {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch('/api/push/subscribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ subscription }),
    });
  } catch (err) {
    console.warn('Failed to register push subscription with server:', err);
  }
}
