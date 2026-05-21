'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Loader2, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function NewEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'social',
    community: '', startDate: '', endDate: '',
    isOnline: false, address: '', city: '', state: '', country: '',
    onlineUrl: '', capacity: '', isFree: true, price: '', currency: 'USD',
    tags: '', isAllDay: false,
  });

  useEffect(() => {
    if (user?.communities?.length) setCommunities(user.communities);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.community) return toast.error('Select a community');
    setLoading(true);
    try {
      const payload = {
        title: formData.title, description: formData.description,
        category: formData.category, community: formData.community,
        startDate: formData.startDate, endDate: formData.endDate || undefined,
        isAllDay: formData.isAllDay,
        location: {
          address: formData.address, city: formData.city,
          state: formData.state, country: formData.country,
          isOnline: formData.isOnline, onlineUrl: formData.onlineUrl,
        },
        capacity: parseInt(formData.capacity) || 0,
        isFree: formData.isFree, price: parseFloat(formData.price) || 0,
        currency: formData.currency,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      const { data } = await api.post('/events', payload);
      toast.success('Event created!');
      router.push(`/events/${data.event._id}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string, value: any) => setFormData(p => ({ ...p, [field]: value }));

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/events" className="btn-ghost p-2"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">Create Event</h1>
          <p className="text-surface-500 text-sm">Invite your community to something great</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-surface-900">Event Details</h2>

          <div>
            <label className="label">Event Title *</label>
            <input type="text" className="input" placeholder="e.g. Monthly Neighborhood Cleanup"
              value={formData.title} onChange={e => set('title', e.target.value)} required maxLength={200} />
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea className="input resize-none" rows={5}
              placeholder="What's this event about? Include any important details..."
              value={formData.description} onChange={e => set('description', e.target.value)} required maxLength={5000} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={formData.category} onChange={e => set('category', e.target.value)}>
                {['social', 'sports', 'music', 'food', 'arts', 'education', 'business', 'health', 'other'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Community *</label>
              <select className="input" value={formData.community} onChange={e => set('community', e.target.value)} required>
                <option value="">Select community...</option>
                {communities.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-surface-900 flex items-center gap-2"><Calendar className="w-5 h-5" /> Date & Time</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date & Time *</label>
              <input type="datetime-local" className="input" required
                value={formData.startDate} onChange={e => set('startDate', e.target.value)}
                min={new Date().toISOString().slice(0, 16)} />
            </div>
            <div>
              <label className="label">End Date & Time</label>
              <input type="datetime-local" className="input"
                value={formData.endDate} onChange={e => set('endDate', e.target.value)}
                min={formData.startDate} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="allDay" checked={formData.isAllDay}
              onChange={e => set('isAllDay', e.target.checked)} className="w-4 h-4" />
            <label htmlFor="allDay" className="text-sm text-surface-700">All-day event</label>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-surface-900 flex items-center gap-2"><MapPin className="w-5 h-5" /> Location</h2>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="online" checked={formData.isOnline}
              onChange={e => set('isOnline', e.target.checked)} className="w-4 h-4" />
            <label htmlFor="online" className="text-sm text-surface-700">Online event</label>
          </div>

          {formData.isOnline ? (
            <div>
              <label className="label">Meeting URL</label>
              <input type="url" className="input" placeholder="https://meet.google.com/..."
                value={formData.onlineUrl} onChange={e => set('onlineUrl', e.target.value)} />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="label">Address</label>
                <input type="text" className="input" placeholder="Street address"
                  value={formData.address} onChange={e => set('address', e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(['city', 'state', 'country'] as const).map(field => (
                  <div key={field}>
                    <label className="label capitalize">{field}</label>
                    <input type="text" className="input text-sm"
                      value={(formData as any)[field]} onChange={e => set(field, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-surface-900">Capacity & Pricing</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Capacity (0 = unlimited)</label>
              <input type="number" className="input" min="0" placeholder="100"
                value={formData.capacity} onChange={e => set('capacity', e.target.value)} />
            </div>

            <div className="flex items-center gap-3 pt-7">
              <input type="checkbox" id="free" checked={formData.isFree}
                onChange={e => set('isFree', e.target.checked)} className="w-4 h-4" />
              <label htmlFor="free" className="text-sm text-surface-700">Free event</label>
            </div>
          </div>

          {!formData.isFree && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Price</label>
                <input type="number" className="input" min="0" step="0.01" placeholder="9.99"
                  value={formData.price} onChange={e => set('price', e.target.value)} />
              </div>
              <div>
                <label className="label">Currency</label>
                <select className="input" value={formData.currency} onChange={e => set('currency', e.target.value)}>
                  {['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="label">Tags</label>
            <input type="text" className="input" placeholder="outdoor, cleanup, volunteer (comma-separated)"
              value={formData.tags} onChange={e => set('tags', e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/events" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
