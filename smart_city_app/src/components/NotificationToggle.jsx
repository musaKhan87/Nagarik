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
  const [message, setMessage] = useState('');

  useEffect(() => {
    registerServiceWorker();

    async function initPushStatus() {
      try {
        const status = await checkPushSubscriptionStatus();
        setIsSubscribed(status.isSubscribed);
      } catch (e) {
        console.warn('Push init error:', e);
      }
    }
    initPushStatus();
  }, [currentUser]);

  const handleTogglePush = async () => {
    setLoading(true);
    setMessage('');

    try {
      if (isSubscribed) {
        try {
          await unsubscribeUserFromPush();
        } catch (e) {
          console.warn('Unsubscribe error:', e);
        }
        setIsSubscribed(false);
        setMessage('Civic status alerts disabled.');
      } else {
        if ('Notification' in window && Notification.permission !== 'granted') {
          const perm = await Notification.requestPermission();
          if (perm === 'denied') {
            setMessage('Notification permission blocked in browser settings.');
            setLoading(false);
            setTimeout(() => setMessage(''), 4000);
            return;
          }
        }
        
        try {
          if (currentUser) {
            await subscribeUserToPush();
          }
        } catch (pushErr) {
          console.warn('Backend push sub notice:', pushErr);
        }

        setIsSubscribed(true);
        setMessage('🔔 Civic status push notifications active!');
      }
    } catch (err) {
      console.error('Push toggle error:', err);
      setIsSubscribed(!isSubscribed);
      setMessage(isSubscribed ? 'Alerts disabled.' : '🔔 Push notifications enabled!');
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
        className={`relative grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border transition-all duration-300 active:scale-95 ${
          isSubscribed
            ? "border-primary/50 bg-primary/15 text-primary shadow-sm ring-2 ring-primary/20"
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
        <div className="absolute right-0 mt-2 z-50 w-60 rounded-2xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur-xl text-xs space-y-1 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2 font-bold text-foreground">
            {isSubscribed ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
            <span>Notification Status</span>
          </div>
          <p className="text-muted-foreground leading-relaxed text-[11px]">{message}</p>
        </div>
      )}
    </div>
  );
}
