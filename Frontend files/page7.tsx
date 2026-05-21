'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import { Bell, CheckCheck, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications?limit=50')
      .then(({ data }) => {
        setNotifications(data.notifications);
        if (data.unreadCount > 0) api.put('/notifications/read', {});
      })
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const typeIcons: Record<string, string> = {
    post_like: '❤️', post_comment: '💬', new_follower: '👤', event_rsvp: '📅',
    community_join: '🏘️', mention: '📢', system: '🔔', comment_like: '👍',
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">Notifications</h1>
          <p className="text-surface-500 text-sm mt-1">{notifications.length} notifications</p>
        </div>
        {notifications.length > 0 && (
          <button onClick={() => { api.put('/notifications/read', {}); setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); }}
            className="btn-ghost text-sm">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card p-16 text-center">
          <Bell className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="font-semibold text-surface-700">All caught up!</h3>
          <p className="text-surface-500 text-sm mt-1">No notifications yet. Get active in communities!</p>
        </div>
      ) : (
        <div className="card divide-y divide-surface-100">
          {notifications.map(n => (
            <div key={n._id} className={`flex items-start gap-4 px-5 py-4 hover:bg-surface-50 transition-colors group ${!n.isRead ? 'bg-primary-50/20' : ''}`}>
              <span className="text-2xl flex-shrink-0">{typeIcons[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.isRead ? 'font-semibold text-surface-900' : 'text-surface-700'}`}>{n.title}</p>
                <p className="text-sm text-surface-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-surface-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!n.isRead && <div className="w-2 h-2 bg-primary-500 rounded-full" />}
                <button onClick={() => handleDelete(n._id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
