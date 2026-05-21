'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDateTime, formatNumber, getAvatarUrl } from '@/lib/utils';
import {
  Calendar, MapPin, Users, Clock, Link2, ArrowLeft, CheckCircle2,
  XCircle, HelpCircle, Globe, Loader2, Share2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

const rsvpOptions = [
  { value: 'going', label: "I'm Going", icon: CheckCircle2, color: 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100' },
  { value: 'maybe', label: 'Maybe', icon: HelpCircle, color: 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100' },
  { value: 'not_going', label: "Can't Go", icon: XCircle, color: 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100' },
];

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(({ data }) => setEvent(data.event))
      .catch(() => toast.error('Event not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRsvp = async (status: string) => {
    if (!user) return toast.error('Please login to RSVP');
    if (status === event.userRsvp) return;
    setRsvpLoading(true);
    try {
      const { data } = await api.post(`/events/${id}/rsvp`, { status });
      setEvent((prev: any) => ({ ...prev, userRsvp: data.status, attendeeCount: data.attendeeCount }));
      toast.success(status === 'going' ? "You're going! 🎉" : status === 'maybe' ? "Marked as maybe" : "RSVP removed");
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'RSVP failed');
    } finally {
      setRsvpLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  if (!event) return <div className="text-center py-20 text-surface-500">Event not found</div>;

  const goingCount = event.attendees?.filter((a: any) => a.status === 'going').length || event.attendeeCount || 0;
  const maybeCount = event.attendees?.filter((a: any) => a.status === 'maybe').length || 0;
  const isOrganizer = user?._id === event.organizer?._id;
  const isPast = new Date(event.startDate) < new Date();

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/events" className="btn-ghost text-sm py-2 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back to events
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Event header card */}
          <div className="card overflow-hidden">
            {event.image ? (
              <div className="h-56 overflow-hidden">
                <Image src={event.image} alt={event.title} width={800} height={400}
                  className="w-full h-full object-cover" unoptimized />
              </div>
            ) : (
              <div className="h-40 gradient-brand flex items-center justify-center">
                <Calendar className="w-16 h-16 text-white/40" />
              </div>
            )}

            <div className="p-6">
              {event.isCancelled && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium mb-4 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> This event has been cancelled
                  {event.cancelReason && `: ${event.cancelReason}`}
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <h1 className="font-display text-2xl font-bold text-surface-900">{event.title}</h1>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                  className="btn-ghost p-2 flex-shrink-0">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {event.community && (
                <Link href={`/communities/${event.community.slug}`}
                  className="inline-flex items-center gap-1.5 mt-2 text-sm text-primary-600 font-medium hover:text-primary-700">
                  in {event.community.name}
                </Link>
              )}

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3 text-surface-600 text-sm">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-primary-500" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">{formatDateTime(event.startDate)}</p>
                    {event.endDate && <p className="text-surface-500">Ends: {formatDateTime(event.endDate)}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-surface-600 text-sm">
                  <div className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {event.location?.isOnline ? <Globe className="w-4 h-4 text-surface-500" /> : <MapPin className="w-4 h-4 text-surface-500" />}
                  </div>
                  <div>
                    {event.location?.isOnline ? (
                      <>
                        <p className="font-medium text-surface-900">Online Event</p>
                        {event.location.onlineUrl && event.userRsvp === 'going' && (
                          <a href={event.location.onlineUrl} target="_blank" rel="noopener noreferrer"
                            className="link text-sm flex items-center gap-1">
                            <Link2 className="w-3 h-3" /> Join link
                          </a>
                        )}
                      </>
                    ) : (
                      <>
                        {event.location?.address && <p className="font-medium text-surface-900">{event.location.address}</p>}
                        <p className="text-surface-500">
                          {[event.location?.city, event.location?.state, event.location?.country].filter(Boolean).join(', ')}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-surface-600 text-sm">
                  <div className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-surface-500" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">{formatNumber(goingCount)} attending</p>
                    {maybeCount > 0 && <p className="text-surface-500">{maybeCount} maybe</p>}
                    {event.capacity > 0 && <p className="text-surface-500">Capacity: {event.capacity}</p>}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-surface-100">
                <h2 className="font-semibold text-surface-900 mb-3">About this event</h2>
                <p className="text-surface-600 text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
              </div>

              {event.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {event.tags.map((tag: string) => <span key={tag} className="badge-surface">#{tag}</span>)}
                </div>
              )}
            </div>
          </div>

          {/* Attendees */}
          {event.attendees?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-surface-900 mb-4">Attendees ({goingCount} going)</h2>
              <div className="flex flex-wrap gap-2">
                {event.attendees
                  .filter((a: any) => a.status === 'going')
                  .slice(0, 20)
                  .map((a: any) => (
                    <Link key={a._id} href={`/profile/${a.user?.username}`}
                      title={a.user?.displayName || a.user?.username}>
                      <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm hover:scale-110 transition-transform">
                        <Image
                          src={getAvatarUrl(a.user?.avatar, a.user?.username)}
                          alt={a.user?.displayName || ''}
                          width={36} height={36}
                          className="w-full h-full object-cover" unoptimized
                        />
                      </div>
                    </Link>
                  ))}
                {goingCount > 20 && (
                  <div className="w-9 h-9 rounded-full bg-surface-100 border-2 border-white shadow-sm flex items-center justify-center text-xs text-surface-600 font-medium">
                    +{goingCount - 20}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* RSVP card */}
          <div className="card p-5 sticky top-20">
            <h2 className="font-semibold text-surface-900 mb-1">Are you going?</h2>

            {event.isFree ? (
              <p className="text-green-600 font-medium text-sm mb-4">🎟️ Free Event</p>
            ) : (
              <p className="text-surface-700 font-medium text-sm mb-4">💰 {event.currency} {event.price}</p>
            )}

            {!isPast && !event.isCancelled ? (
              <div className="space-y-2">
                {rsvpOptions.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = event.userRsvp === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleRsvp(opt.value)}
                      disabled={rsvpLoading}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border font-medium text-sm transition-all ${
                        isSelected ? opt.color + ' ring-2 ring-offset-1' : 'border-surface-200 text-surface-600 hover:bg-surface-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {opt.label}
                      {isSelected && <span className="ml-auto text-xs">✓ Selected</span>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-surface-50 rounded-xl p-4 text-center text-sm text-surface-500">
                {isPast ? 'This event has ended' : 'This event was cancelled'}
              </div>
            )}

            {event.capacity > 0 && (
              <div className="mt-4 pt-4 border-t border-surface-100">
                <div className="flex justify-between text-xs text-surface-500 mb-1.5">
                  <span>Spots filled</span>
                  <span>{goingCount}/{event.capacity}</span>
                </div>
                <div className="w-full bg-surface-100 rounded-full h-2">
                  <div
                    className="h-2 bg-primary-500 rounded-full transition-all"
                    style={{ width: `${Math.min((goingCount / event.capacity) * 100, 100)}%` }}
                  />
                </div>
                {goingCount >= event.capacity && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">Event is at capacity</p>
                )}
              </div>
            )}
          </div>

          {/* Organizer */}
          <div className="card p-5">
            <h2 className="font-semibold text-surface-900 mb-3">Organizer</h2>
            <Link href={`/profile/${event.organizer?.username}`}
              className="flex items-center gap-3 hover:bg-surface-50 p-2 -mx-2 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-100">
                <Image
                  src={getAvatarUrl(event.organizer?.avatar, event.organizer?.username)}
                  alt={event.organizer?.displayName || ''}
                  width={40} height={40}
                  className="w-full h-full object-cover" unoptimized
                />
              </div>
              <div>
                <p className="font-medium text-surface-900 text-sm">{event.organizer?.displayName}</p>
                <p className="text-xs text-surface-500">@{event.organizer?.username}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}