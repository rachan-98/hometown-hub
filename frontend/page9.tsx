'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import PostCard from '@/components/post/PostCard';
import { formatDate, formatNumber, getAvatarUrl } from '@/lib/utils';
import { MapPin, Link2, Calendar, Users, Heart, Loader2, UserPlus, UserMinus } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [tab, setTab] = useState<'posts' | 'communities'>('posts');

  useEffect(() => {
    Promise.all([
      api.get(`/users/${username}`),
      api.get(`/users/${username}/posts`),
    ]).then(([profileRes, postsRes]) => {
      setProfile(profileRes.data.user);
      setFollowing(profileRes.data.user.isFollowing);
      setPosts(postsRes.data.posts);
    }).catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [username]);

  const handleFollow = async () => {
    try {
      const { data } = await api.post(`/users/${profile._id}/follow`);
      setFollowing(data.isFollowing);
      setProfile((prev: any) => ({
        ...prev,
        followerCount: data.isFollowing ? prev.followerCount + 1 : prev.followerCount - 1,
      }));
      toast.success(data.message);
    } catch { toast.error('Action failed'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  if (!profile) return <div className="text-center py-20 text-surface-500">User not found</div>;

  const isOwnProfile = currentUser?.username === username;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile header */}
      <div className="card overflow-hidden">
        {/* Cover */}
        <div className="h-32 gradient-brand" />

        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl border-4 border-white overflow-hidden shadow-md">
              <Image src={getAvatarUrl(profile.avatar, profile.username)}
                alt={profile.displayName} width={80} height={80}
                className="w-full h-full object-cover" unoptimized />
            </div>

            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <a href="/profile/settings" className="btn-secondary text-sm py-2">Edit Profile</a>
              ) : (
                <button onClick={handleFollow}
                  className={`text-sm font-semibold px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
                    following ? 'border-surface-200 text-surface-600 hover:border-red-300 hover:text-red-600' : 'btn-primary'
                  }`}>
                  {following ? <><UserMinus className="w-4 h-4" /> Unfollow</> : <><UserPlus className="w-4 h-4" /> Follow</>}
                </button>
              )}
            </div>
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold text-surface-900">{profile.displayName}</h1>
            <p className="text-surface-500 text-sm">@{profile.username}</p>
          </div>

          {profile.bio && <p className="mt-3 text-surface-700 text-sm leading-relaxed">{profile.bio}</p>}

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-surface-500">
            {profile.location && (
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</span>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary-600 hover:text-primary-700">
                <Link2 className="w-4 h-4" /> {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Joined {formatDate(profile.createdAt)}
            </span>
            {profile.role !== 'user' && (
              <span className={`badge ${profile.role === 'admin' ? 'badge-primary' : 'badge-surface'} capitalize`}>
                {profile.role}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-5 pt-5 border-t border-surface-100">
            {[
              { label: 'Posts', value: profile.postCount || 0 },
              { label: 'Followers', value: profile.followerCount || profile.followers?.length || 0 },
              { label: 'Following', value: profile.followingCount || profile.following?.length || 0 },
              { label: 'Communities', value: profile.communities?.length || 0 },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="font-display font-bold text-lg text-surface-900">{formatNumber(stat.value)}</div>
                <div className="text-xs text-surface-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-surface-100">
        {(['posts', 'communities'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-primary-500 text-white shadow-sm' : 'text-surface-600 hover:text-surface-900'
            }`}>{t}</button>
        ))}
      </div>

      {tab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="card p-12 text-center text-surface-500">No posts yet</div>
          ) : (
            posts.map(post => <PostCard key={post._id} post={post} />)
          )}
        </div>
      )}

      {tab === 'communities' && (
        <div className="grid grid-cols-2 gap-4">
          {profile.communities?.length === 0 ? (
            <div className="col-span-2 card p-12 text-center text-surface-500">Not in any communities yet</div>
          ) : (
            profile.communities?.map((c: any) => (
              <a key={c._id} href={`/communities/${c.slug}`}
                className="card p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-transform">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-100 flex-shrink-0">
                  {c.avatar ? <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full gradient-brand flex items-center justify-center text-white font-bold text-lg">{c.name[0]}</div>}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-surface-900 truncate text-sm">{c.name}</p>
                  <p className="text-xs text-surface-500">{formatNumber(c.memberCount)} members</p>
                </div>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
