'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Bell } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications?limit=8');
      setNotifications(data.notifications);
      setUnread(data.unreadCount);
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read', {});
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleOpen = () => {
    setOpen(!open);
    if (!open && unread > 0) markAllRead();
  };

  const typeIcons: Record<string, string> = {
    post_like: '❤️', post_comment: '💬', new_follower: '👤',
    event_rsvp: '📅', community_join: '🏘️', mention: '📢', system: '🔔',
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-surface-100 shadow-xl z-50 animate-fade-in overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
            <h3 className="font-semibold text-surface-900">Notifications</h3>
            <Link href="/notifications" className="text-xs text-primary-600 hover:text-primary-700 font-medium" onClick={() => setOpen(false)}>
              View all
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-surface-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-surface-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <div key={n._id}
                  className={`px-4 py-3 hover:bg-surface-50 transition-colors ${!n.isRead ? 'bg-primary-50/30' : ''}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{typeIcons[n.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900">{n.title}</p>
                      <p className="text-xs text-surface-500 mt-0.5 truncate">{n.message}</p>
                      <p className="text-xs text-surface-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
