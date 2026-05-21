'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { getAvatarUrl } from '@/lib/utils';
import { ImageIcon, Tag, X, Loader2, Send } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface CreatePostBoxProps {
  onPostCreated: (post: any) => void;
  communities: any[];
  defaultCommunityId?: string;
}

export default function CreatePostBox({ onPostCreated, communities, defaultCommunityId }: CreatePostBoxProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState(defaultCommunityId || communities[0]?._id || '');
  const [tags, setTags] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 4) {
      toast.error('Maximum 4 images per post');
      return;
    }
    setImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim()) return toast.error('Post content is required');
    if (!selectedCommunity) return toast.error('Please select a community');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('community', selectedCommunity);
      if (title) formData.append('title', title);
      if (tags) formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)));
      images.forEach(img => formData.append('images', img));

      const { data } = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onPostCreated(data.post);
      setContent(''); setTitle(''); setTags('');
      setImages([]); setImagePreviews([]);
      setExpanded(false);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <Image src={getAvatarUrl(user?.avatar, user?.username || 'u')}
            alt="You" width={40} height={40} className="w-full h-full object-cover" unoptimized />
        </div>
        <div className="flex-1">
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              className="w-full text-left px-4 py-3 bg-surface-50 hover:bg-surface-100 border border-surface-200 rounded-xl text-surface-400 text-sm transition-colors"
            >
              What's happening in your community?
            </button>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <input
                type="text"
                placeholder="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input text-sm"
                maxLength={300}
              />

              <textarea
                placeholder="What's on your mind? Share news, ask questions, start a discussion..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="input text-sm resize-none"
                maxLength={10000}
                autoFocus
              />

              {/* Community select */}
              <select
                value={selectedCommunity}
                onChange={(e) => setSelectedCommunity(e.target.value)}
                className="input text-sm"
              >
                <option value="">Select community...</option>
                {communities.map((c: any) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>

              {/* Image previews */}
              {imagePreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              <input
                type="text"
                placeholder="Tags (comma-separated, e.g. local, news, help)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="input text-sm"
              />

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="btn-ghost text-sm cursor-pointer py-1.5 px-3">
                    <ImageIcon className="w-4 h-4" />
                    Photo
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setExpanded(false); setContent(''); setTitle(''); }}
                    className="btn-secondary text-sm py-2 px-4">
                    Cancel
                  </button>
                  <button onClick={handleSubmit} disabled={loading || !content.trim()}
                    className="btn-primary text-sm py-2 px-4">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Post
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
