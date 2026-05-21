'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatDateTime, formatNumber } from '@/lib/utils';
import { Calendar, MapPin, Users, Plus, Loader2, Clock } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvping, setRsvping] = useState<string | null>(null);

  useEffect(() => {
    api.get('/events?upcoming=true&limit=20')
      .then(({ data }) => setEvents(data.events))
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  const handleRsvp = async (eventId: string, currentStatus: string | null) => {
    setRsvping(eventId);
    const newStatus = currentStatus === 'going' ? 'not_going' : 'going';
    try {
      const { data } = await api.post(`/events/${eventId}/rsvp`, { status: newStatus });
      setEvents(prev => prev.map(e => e._id === eventId
        ? { ...e, userRsvp: data.status, attendeeCount: data.attendeeCount } : e));
      toast.success(newStatus === 'going' ? "You're going! 🎉" : "RSVP removed");
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to RSVP');
    } finally {
      setRsvping(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">Upcoming Events</h1>
          <p className="text-surface-500 text-sm mt-1">Discover what's happening in your communities</p>
        </div>
        <Link href="/events/new" className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="font-semibold text-surface-700 mb-2">No upcoming events</h3>
          <p className="text-surface-500 text-sm mb-4">Be the first to create an event in your community!</p>
          <Link href="/events/new" className="btn-primary inline-flex"><Plus className="w-4 h-4" /> Create Event</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map(event => (
            <div key={event._id} className="card overflow-hidden hover:-translate-y-0.5 transition-transform">
              <div className="flex">
                {/* Date sidebar */}
                <div className="w-20 bg-primary-500 flex flex-col items-center justify-center text-white flex-shrink-0 py-4">
                  <span className="text-xs font-medium opacity-75 uppercase">
                    {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                  </span>
                  <span className="font-display font-bold text-3xl leading-none">
                    {new Date(event.startDate).getDate()}
                  </span>
                  <span className="text-xs opacity-75">
                    {new Date(event.startDate).toLocaleString('default', { weekday: 'short' })}
                  </span>
                </div>

                {/* Event content */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/events/${event._id}`}>
                        <h3 className="font-display font-bold text-lg text-surface-900 hover:text-primary-600 transition-colors truncate">
                          {event.title}
                        </h3>
                      </Link>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-surface-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDateTime(event.startDate)}
                        </span>
                        {event.location?.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.location.isOnline ? 'Online' : `${event.location.city}`}
                          </span>
                        )}
                        {event.community && (
                          <Link href={`/communities/${event.community.slug}`}
                            className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                            {event.community.name}
                          </Link>
                        )}
                      </div>

                      <p className="text-surface-500 text-sm mt-2 line-clamp-2">{event.description}</p>

                      <div className="flex items-center gap-3 mt-3">
                        <span className="flex items-center gap-1 text-xs text-surface-500">
                          <Users className="w-3.5 h-3.5" />
                          {formatNumber(event.attendeeCount)} going
                          {event.capacity > 0 && ` / ${event.capacity} max`}
                        </span>
                        {event.isFree ? (
                          <span className="badge badge-primary">Free</span>
                        ) : (
                          <span className="badge badge-surface">{event.currency} {event.price}</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRsvp(event._id, event.userRsvp)}
                      disabled={rsvping === event._id}
                      className={`flex-shrink-0 text-sm font-semibold px-4 py-2 rounded-xl border transition-all ${
                        event.userRsvp === 'going'
                          ? 'bg-green-50 border-green-300 text-green-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600'
                          : 'btn-primary'
                      }`}
                    >
                      {rsvping === event._id ? '...' : event.userRsvp === 'going' ? '✓ Going' : 'RSVP'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
