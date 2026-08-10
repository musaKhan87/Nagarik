import React, { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  checkPushSubscriptionStatus,
  subscribeUserToPush,
  unsubscribeUserFromPush,
  registerServiceWorker
} from '../utils/pushNotification';

export function NotificationToggle() {
  const { currentUser } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState('default');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Automatically register service worker on load
    registerServiceWorker();

    async function initPushStatus() {
      if (currentUser) {
        const status = await checkPushSubscriptionStatus();
        setIsSubscribed(status.isSubscribed);
        setPermission(status.permission);
      }
    }
    initPushStatus();
  }, [currentUser]);

  if (!currentUser) return null;

  const handleTogglePush = async () => {
    setLoading(true);
    setMessage('');

    try {
      if (isSubscribed) {
        await unsubscribeUserFromPush();
        setIsSubscribed(false);
        setMessage('Web Push notifications disabled.');
      } else {
        await subscribeUserToPush();
        setIsSubscribed(true);
        setPermission('granted');
        setMessage('Mobile & Browser Push notifications enabled!');
      }
    } catch (err) {
      console.error('Push notification toggle error:', err);
      setMessage(err.message || 'Failed to update notification settings.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleTogglePush}
        disabled={loading}
        title={isSubscribed ? "Push Alerts Active (Click to disable)" : "Enable Mobile & Browser Push Alerts"}
        className={`relative grid h-9 w-9 place-items-center rounded-full border transition-all duration-300 ${
          isSubscribed
            ? "border-primary/40 bg-primary/10 text-primary shadow-sm ring-2 ring-primary/20"
            : "border-border/80 bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        {isSubscribed ? (
          <>
            <Bell className="h-4 w-4 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          </>
        ) : (
          <BellOff className="h-4 w-4" />
        )}
      </button>

      {/* Floating Status Toast Message */}
      {message && (
        <div className="absolute right-0 mt-2 z-50 w-64 rounded-2xl border border-border bg-card p-3 shadow-2xl backdrop-blur-xl text-xs space-y-1 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2 font-bold text-foreground">
            {isSubscribed ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
            <span>Notification Status</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">{message}</p>
        </div>
      )}
    </div>
  );
}
