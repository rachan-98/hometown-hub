'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { Search, Users, FileText, Calendar, User, Loader2 } from 'lucide-react';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'communities' | 'posts' | 'events'>('all');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); search(q); }
  }, [searchParams]);

  const search = async (q: string) => {
    if (q.length < 2) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/search?q=${encodeURIComponent(q)}&type=${activeTab}`);
      setResults(data.results);
    } catch { toast.error('Search failed'); }
    finally { setLoading(false); }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const totalResults = Object.values(results).reduce((acc: number, arr: any) => acc + (arr?.length || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900">Search</h1>
        <p className="text-surface-500 text-sm mt-1">Find communities, people, posts, and events</p>
      </div>

      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search anything..." className="input pl-12 py-3.5 text-base" autoFocus />
        </div>
      </form>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-surface-100">
        {(['all', 'users', 'communities', 'posts', 'events'] as const).map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); if (query) search(query); }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab ? 'bg-primary-500 text-white shadow-sm' : 'text-surface-600 hover:text-surface-900'
            }`}>{tab}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : query && totalResults === 0 ? (
        <div className="card p-12 text-center">
          <Search className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="font-semibold text-surface-700">No results for "{query}"</h3>
          <p className="text-surface-500 text-sm mt-1">Try different keywords or browse communities</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Users */}
          {results.users?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-surface-900 flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-primary-500" /> People ({results.users.length})
              </h2>
              <div className="space-y-3">
                {results.users.map((u: any) => (
                  <Link key={u._id} href={`/profile/${u.username}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-50 transition-colors">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-100 flex-shrink-0">
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.username}&backgroundColor=f34c14&textColor=ffffff`}
                        alt={u.username} className="w-full h-full" />
                    </div>
                    <div>
                      <p className="font-medium text-surface-900 text-sm">{u.displayName || u.username}</p>
                      <p className="text-xs text-surface-500">@{u.username}</p>
                      {u.bio && <p className="text-xs text-surface-400 truncate max-w-xs">{u.bio}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Communities */}
          {results.communities?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-surface-900 flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-primary-500" /> Communities ({results.communities.length})
              </h2>
              <div className="space-y-3">
                {results.communities.map((c: any) => (
                  <Link key={c._id} href={`/communities/${c.slug}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-100 flex-shrink-0">
                      {c.avatar ? <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full gradient-brand flex items-center justify-center text-white font-bold">{c.name[0]}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-900 text-sm">{c.name}</p>
                      <p className="text-xs text-surface-500">{formatNumber(c.memberCount)} members · {c.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Posts */}
          {results.posts?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-surface-900 flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-primary-500" /> Posts ({results.posts.length})
              </h2>
              <div className="divide-y divide-surface-100">
                {results.posts.map((p: any) => (
                  <Link key={p._id} href={`/posts/${p._id}`}
                    className="block py-3 hover:bg-surface-50 transition-colors px-2 -mx-2 rounded-xl">
                    {p.title && <p className="font-medium text-surface-900 text-sm">{p.title}</p>}
                    <p className="text-surface-600 text-sm line-clamp-2 mt-0.5">{p.content}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-surface-400">
                      <span>{p.author?.displayName}</span>
                      <span>in {p.community?.name}</span>
                      <span>· {formatRelativeTime(p.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          {results.events?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-surface-900 flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-primary-500" /> Events ({results.events.length})
              </h2>
              <div className="space-y-3">
                {results.events.map((e: any) => (
                  <Link key={e._id} href={`/events/${e._id}`}
                    className="block p-3 rounded-xl hover:bg-surface-50 transition-colors">
                    <p className="font-medium text-surface-900 text-sm">{e.title}</p>
                    <p className="text-xs text-surface-500 mt-0.5">
                      {new Date(e.startDate).toLocaleDateString()} · {formatNumber(e.attendeeCount)} going
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
