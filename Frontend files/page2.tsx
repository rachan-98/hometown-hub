'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatNumber, COMMUNITY_CATEGORIES } from '@/lib/utils';
import { Search, Plus, Users, Filter, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CommunitiesPage() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('memberCount');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  const fetchCommunities = async (reset = false) => {
    try {
      const params = new URLSearchParams({
        page: reset ? '1' : String(page),
        limit: '12',
        sort,
        ...(category && { category }),
      });
      const { data } = await api.get(`/communities?${params}`);
      if (reset) {
        setCommunities(data.communities);
        setPage(2);
      } else {
        setCommunities(prev => [...prev, ...data.communities]);
        setPage(p => p + 1);
      }
      setHasMore(data.pagination.page < data.pagination.pages);
    } catch {
      toast.error('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCommunities(true); }, [category, sort]);

  const handleJoin = async (communityId: string, isMember: boolean) => {
    setJoining(communityId);
    try {
      await api.post(`/communities/${communityId}/join`);
      setCommunities(prev => prev.map(c =>
        c._id === communityId
          ? { ...c, memberCount: isMember ? c.memberCount - 1 : c.memberCount + 1, _isMember: !isMember }
          : c
      ));
      toast.success(isMember ? 'Left community' : 'Joined community!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Action failed');
    } finally {
      setJoining(null);
    }
  };

  const filtered = communities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">Explore Communities</h1>
          <p className="text-surface-500 text-sm mt-1">Find your people and join the conversation</p>
        </div>
        <Link href="/communities/new" className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New Community
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search communities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10 text-sm"
          />
        </div>

        <div className="flex gap-3">
          <select value={category} onChange={e => setCategory(e.target.value)} className="input text-sm flex-1">
            <option value="">All categories</option>
            {COMMUNITY_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
            ))}
          </select>

          <select value={sort} onChange={e => setSort(e.target.value)} className="input text-sm w-40">
            <option value="memberCount">Most members</option>
            <option value="newest">Newest first</option>
          </select>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setCategory('')}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
            !category ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'
          }`}
        >
          All
        </button>
        {COMMUNITY_CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value === category ? '' : cat.value)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              category === cat.value ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(community => {
              const isMember = community._isMember ||
                user?.communities?.some((c: any) => c._id === community._id || c === community._id);
              const cat = COMMUNITY_CATEGORIES.find(c => c.value === community.category);

              return (
                <div key={community._id} className="card p-5 hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-start gap-4">
                    <Link href={`/communities/${community.slug}`}
                      className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-100 flex-shrink-0 flex items-center justify-center">
                      {community.avatar ? (
                        <img src={community.avatar} alt={community.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full gradient-brand flex items-center justify-center text-white text-xl font-bold">
                          {community.name[0]}
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link href={`/communities/${community.slug}`}
                            className="font-semibold text-surface-900 hover:text-primary-600 transition-colors truncate block">
                            {community.name}
                          </Link>
                          <span className="badge-surface text-xs mt-1 inline-block">
                            {cat?.icon} {cat?.label || community.category}
                          </span>
                        </div>
                        <button
                          onClick={() => handleJoin(community._id, isMember)}
                          disabled={joining === community._id}
                          className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                            isMember
                              ? 'border-surface-200 text-surface-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
                              : 'border-primary-400 text-primary-600 hover:bg-primary-50'
                          }`}
                        >
                          {joining === community._id ? '...' : isMember ? 'Joined' : 'Join'}
                        </button>
                      </div>

                      <p className="text-xs text-surface-500 mt-1.5 line-clamp-2">{community.description}</p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {formatNumber(community.memberCount)} members
                        </span>
                        {community.postCount > 0 && (
                          <span>{formatNumber(community.postCount)} posts</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-surface-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium text-surface-600">No communities found</p>
              <p className="text-sm mt-1">Try a different search or create one!</p>
              <Link href="/communities/new" className="btn-primary mt-4 inline-flex">
                <Plus className="w-4 h-4" /> Create Community
              </Link>
            </div>
          )}

          {hasMore && filtered.length > 0 && (
            <div className="text-center pt-2">
              <button onClick={() => fetchCommunities()} className="btn-secondary">Load more</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
