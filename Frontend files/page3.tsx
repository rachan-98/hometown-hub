'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { COMMUNITY_CATEGORIES } from '@/lib/utils';
import { Loader2, Upload, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function NewCommunityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [rules, setRules] = useState([{ title: '', description: '' }]);
  const [formData, setFormData] = useState({
    name: '', description: '', category: 'general',
    tags: '', isPrivate: false,
    location: { city: '', state: '', country: '' },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = e => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      return toast.error('Name and description are required');
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      fd.append('category', formData.category);
      fd.append('isPrivate', String(formData.isPrivate));
      if (formData.tags) fd.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(Boolean)));
      const validRules = rules.filter(r => r.title.trim());
      if (validRules.length > 0) fd.append('rules', JSON.stringify(validRules));
      if (formData.location.city) fd.append('location', JSON.stringify(formData.location));
      if (avatarFile) fd.append('avatar', avatarFile);

      const { data } = await api.post('/communities', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Community created!');
      router.push(`/communities/${data.community.slug}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/communities" className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">Create Community</h1>
          <p className="text-surface-500 text-sm">Build a space for your neighborhood or interest group</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar upload */}
        <div className="card p-6">
          <h2 className="font-semibold text-surface-900 mb-4">Community Avatar</h2>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-100 flex items-center justify-center flex-shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="gradient-brand w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {formData.name[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <label className="btn-secondary cursor-pointer text-sm">
              <Upload className="w-4 h-4" /> Upload image
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
        </div>

        {/* Basic info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-surface-900">Basic Information</h2>

          <div>
            <label className="label">Community Name *</label>
            <input type="text" className="input" placeholder="e.g. Downtown Neighbors"
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              required minLength={3} maxLength={50} />
            <p className="text-xs text-surface-400 mt-1">URL: /communities/{formData.name.toLowerCase().replace(/\s+/g, '-') || 'community-name'}</p>
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea className="input resize-none" rows={4}
              placeholder="What is this community about? What can members expect?"
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              required minLength={10} maxLength={1000} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select className="input" value={formData.category}
                onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                {COMMUNITY_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Tags</label>
              <input type="text" className="input" placeholder="local, events, help"
                value={formData.tags}
                onChange={e => setFormData(p => ({ ...p, tags: e.target.value }))} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="isPrivate" checked={formData.isPrivate}
              onChange={e => setFormData(p => ({ ...p, isPrivate: e.target.checked }))}
              className="w-4 h-4 rounded text-primary-500" />
            <label htmlFor="isPrivate" className="text-sm text-surface-700">
              Private community (invite-only)
            </label>
          </div>
        </div>

        {/* Location */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-surface-900">Location (Optional)</h2>
          <div className="grid grid-cols-3 gap-3">
            {(['city', 'state', 'country'] as const).map(field => (
              <div key={field}>
                <label className="label capitalize">{field}</label>
                <input type="text" className="input text-sm"
                  placeholder={field === 'city' ? 'Hyderabad' : field === 'state' ? 'Telangana' : 'India'}
                  value={formData.location[field]}
                  onChange={e => setFormData(p => ({ ...p, location: { ...p.location, [field]: e.target.value } }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-surface-900">Community Rules (Optional)</h2>
          {rules.map((rule, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="flex-1 space-y-2">
                <input type="text" className="input text-sm" placeholder={`Rule ${i + 1} title`}
                  value={rule.title}
                  onChange={e => setRules(prev => prev.map((r, ri) => ri === i ? { ...r, title: e.target.value } : r))} />
                <input type="text" className="input text-sm" placeholder="Description (optional)"
                  value={rule.description}
                  onChange={e => setRules(prev => prev.map((r, ri) => ri === i ? { ...r, description: e.target.value } : r))} />
              </div>
              {rules.length > 1 && (
                <button type="button" onClick={() => setRules(prev => prev.filter((_, ri) => ri !== i))}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {rules.length < 10 && (
            <button type="button" onClick={() => setRules(prev => [...prev, { title: '', description: '' }])}
              className="btn-ghost text-sm">
              <Plus className="w-4 h-4" /> Add rule
            </button>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/communities" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Creating...' : 'Create Community'}
          </button>
        </div>
      </form>
    </div>
  );
}
