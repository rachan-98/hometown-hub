'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import PostCard from '@/components/post/PostCard';
import CreatePostBox from '@/components/post/CreatePostBox';
import { formatNumber, formatDate, COMMUNITY_CATEGORIES } from '@/lib/utils';
import { Users, Calendar, Lock, Globe, Settings, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CommunityPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [sort, setSort] = useState('newest');
  const [tab, setTab] = useState<'posts' | 'events' | 'about'>('posts');

  useEffect(() => {
    fetchCommunity();
  }, [slug]);

  useEffect(() => {
    if (community) fetchPosts(true);
  }, [community, sort]);

  const fetchCommunity = async () => {
    try {
      const { data } = await api.get(`/communities/${slug}`);
      setCommunity(data.community);
    } catch {
      toast.error('Community not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (reset = false) => {
    setPostsLoading(true);
    try {
      const { data } = await api.get(`/communities/${slug}/posts?sort=${sort}`);
      setPosts(data.posts);
    } catch {} finally {
      setPostsLoading(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const { data } = await api.post(`/communities/${community._id}/join`);
      setCommunity((prev: any) => ({
        ...prev,
        isMember: data.isMember,
        memberCount: data.isMember ? prev.memberCount + 1 : prev.memberCount - 1,
      }));
      toast.success(data.message);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Action failed');
    } finally {
      setJoining(false);
    }
  };

  const cat = COMMUNITY_CATEGORIES.find(c => c.value === community?.category);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  if (!community) {
    return <div className="text-center py-20 text-surface-500">Community not found</div>;
  }

  const isCreator = community.creator?._id === user?._id;
  const isMod = community.moderators?.some((m: any) => m._id === user?._id) || user?.role === 'admin';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner / Header */}
      <div className="card overflow-hidden">
        {community.banner ? (
          <div className="h-40 bg-surface-200 overflow-hidden">
            <img src={community.banner} alt="Banner" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-40 gradient-brand" />
        )}

        <div className="px-6 pb-5">
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white bg-white shadow-md">
              {community.avatar ? (
                <img src={community.avatar} alt={community.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full gradient-brand flex items-center justify-center text-white text-2xl font-bold">
                  {community.name[0]}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {(isCreator || isMod) && (
                <Link href={`/communities/${slug}/settings`} className="btn-secondary text-sm py-2 px-3">
                  <Settings className="w-4 h-4" /> Manage
                </Link>
              )}
              {user && (
                <button onClick={handleJoin} disabled={joining || isCreator}
                  className={`text-sm font-semibold px-4 py-2 rounded-xl border transition-all ${
                    community.isMember
                      ? 'border-surface-200 text-surface-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
                      : 'btn-primary'
                  }`}
                >
                  {joining ? '...' : community.isMember ? 'Leave' : 'Join Community'}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-surface-900 flex items-center gap-2">
                {community.name}
                {community.isVerified && <span className="text-blue-500 text-lg">✓</span>}
                {community.isPrivate ? <Lock className="w-4 h-4 text-surface-400" /> : <Globe className="w-4 h-4 text-surface-400" />}
              </h1>
              <span className="badge-surface mt-1 inline-block">{cat?.icon} {cat?.label}</span>
            </div>

            <div className="flex items-center gap-4 text-sm text-surface-500">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {formatNumber(community.memberCount)} members</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Est. {formatDate(community.createdAt)}</span>
            </div>
          </div>

          <p className="mt-3 text-surface-600 text-sm leading-relaxed">{community.description}</p>

          {community.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {community.tags.map((tag: string) => <span key={tag} className="badge-surface">#{tag}</span>)}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-surface-100">
        {(['posts', 'events', 'about'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-primary-500 text-white shadow-sm' : 'text-surface-600 hover:text-surface-900'
            }`}>{t}</button>
        ))}
      </div>

      {tab === 'posts' && (
        <div className="space-y-4">
          {community.isMember && (
            <CreatePostBox
              onPostCreated={(post) => setPosts(prev => [post, ...prev])}
              communities={[community]}
              defaultCommunityId={community._id}
            />
          )}

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-surface-700">Sort by:</span>
            {[['newest', 'Newest'], ['top', 'Top']].map(([val, label]) => (
              <button key={val} onClick={() => setSort(val)}
                className={`text-sm px-3 py-1 rounded-lg font-medium transition-all ${
                  sort === val ? 'bg-primary-100 text-primary-700' : 'text-surface-500 hover:text-surface-800'
                }`}>{label}</button>
            ))}
          </div>

          {postsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>
          ) : posts.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-surface-500 text-sm mb-4">No posts yet. Be the first to share something!</p>
              {!community.isMember && (
                <button onClick={handleJoin} className="btn-primary text-sm">Join to post</button>
              )}
            </div>
          ) : (
            posts.map(post => <PostCard key={post._id} post={post} showCommunity={false}
              onDeleted={(id) => setPosts(prev => prev.filter(p => p._id !== id))} />)
          )}
        </div>
      )}

      {tab === 'about' && (
        <div className="card p-6 space-y-5">
          <div>
            <h3 className="font-semibold text-surface-900 mb-2">About</h3>
            <p className="text-surface-600 text-sm leading-relaxed">{community.description}</p>
          </div>

          {community.rules?.length > 0 && (
            <div>
              <h3 className="font-semibold text-surface-900 mb-3">Community Rules</h3>
              <div className="space-y-3">
                {community.rules.map((rule: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    <span className="font-display font-bold text-primary-500 text-sm flex-shrink-0">{i + 1}.</span>
                    <div>
                      <p className="font-medium text-surface-900 text-sm">{rule.title}</p>
                      {rule.description && <p className="text-surface-500 text-xs mt-0.5">{rule.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {community.location?.city && (
            <div>
              <h3 className="font-semibold text-surface-900 mb-2">Location</h3>
              <p className="text-surface-600 text-sm">
                {[community.location.city, community.location.state, community.location.country].filter(Boolean).join(', ')}
              </p>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-surface-900 mb-2">Moderators</h3>
            <div className="space-y-2">
              {community.moderators?.map((mod: any) => (
                <Link key={mod._id} href={`/profile/${mod.username}`} className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-surface-100 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${mod.username}`} alt={mod.username} className="w-full h-full" />
                  </div>
                  <span className="text-sm text-surface-700">{mod.displayName || mod.username}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
