'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { formatNumber, formatRelativeTime } from '@/lib/utils';
import {
  Users, FileText, Globe, Calendar, AlertTriangle,
  Ban, TrendingUp, Loader2, Check, X, Shield, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'users' | 'reports' | 'communities';

export default function AdminPage() {
  const { user, isAdmin, isModerator, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isModerator) router.push('/dashboard');
  }, [authLoading, isModerator, router]);

  useEffect(() => {
    if (isModerator) fetchData();
  }, [isModerator, tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'overview' || tab === 'users') {
        const [statsRes, usersRes] = await Promise.all([
          isAdmin ? api.get('/admin/stats') : Promise.resolve({ data: null }),
          api.get('/users?limit=20'),
        ]);
        if (statsRes.data) {
          setStats(statsRes.data.stats);
          setGrowthData(statsRes.data.growthData || []);
        }
        setUsers(usersRes.data.users);
      }
      if (tab === 'reports') {
        const { data } = await api.get('/admin/reports');
        setReports(data.posts);
      }
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleBanUser = async (userId: string, isBanned: boolean, username: string) => {
    const reason = isBanned ? '' : prompt(`Reason for banning @${username}:`) || '';
    if (!isBanned && !reason) return;
    setActionLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/ban`, { ban: !isBanned, reason });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: !isBanned } : u));
      toast.success(!isBanned ? `@${username} banned` : `@${username} unbanned`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    setActionLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
      toast.success(`Role updated to ${role}`);
    } catch { toast.error('Failed to update role'); }
    finally { setActionLoading(null); }
  };

  const handleRemovePost = async (postId: string) => {
    if (!confirm('Remove this reported post?')) return;
    setActionLoading(postId);
    try {
      await api.delete(`/admin/posts/${postId}`);
      setReports(prev => prev.filter(p => p._id !== postId));
      toast.success('Post removed');
    } catch { toast.error('Failed to remove post'); }
    finally { setActionLoading(null); }
  };

  if (authLoading || loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, sub: `+${stats.newUsersToday} today`, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Posts', value: stats.totalPosts, sub: `${stats.reportedPosts} reported`, icon: FileText, color: 'bg-purple-50 text-purple-600' },
    { label: 'Communities', value: stats.totalCommunities, sub: 'Active', icon: Globe, color: 'bg-green-50 text-green-600' },
    { label: 'Events', value: stats.totalEvents, sub: 'Total created', icon: Calendar, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Banned Users', value: stats.bannedUsers, sub: 'Suspended accounts', icon: Ban, color: 'bg-red-50 text-red-600' },
    { label: 'Active (7d)', value: stats.activeUsers, sub: 'Weekly active users', icon: TrendingUp, color: 'bg-primary-50 text-primary-600' },
  ] : [];

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reports', label: 'Reports', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">Admin Panel</h1>
          <p className="text-surface-500 text-sm">Platform management and moderation</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-surface-100">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-primary-500 text-white shadow-sm' : 'text-surface-600 hover:text-surface-900'
            }`}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {statCards.map(card => (
              <div key={card.label} className="card p-5">
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div className="font-display font-bold text-2xl text-surface-900">{formatNumber(card.value)}</div>
                <div className="font-medium text-surface-700 text-sm mt-0.5">{card.label}</div>
                <div className="text-xs text-surface-400 mt-0.5">{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Growth chart (simple bars) */}
          {growthData.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-surface-900 mb-4">Growth (Last 7 Days)</h2>
              <div className="space-y-3">
                {growthData.map((day: any) => {
                  const maxUsers = Math.max(...growthData.map((d: any) => d.users), 1);
                  const maxPosts = Math.max(...growthData.map((d: any) => d.posts), 1);
                  return (
                    <div key={day.date} className="flex items-center gap-3 text-sm">
                      <span className="text-surface-500 w-20 flex-shrink-0 text-xs">{day.date}</span>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-10 text-xs text-blue-500">Users</span>
                          <div className="flex-1 bg-surface-100 rounded-full h-2">
                            <div className="h-2 bg-blue-400 rounded-full transition-all"
                              style={{ width: `${(day.users / maxUsers) * 100}%` }} />
                          </div>
                          <span className="w-6 text-xs text-surface-500 text-right">{day.users}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-10 text-xs text-primary-500">Posts</span>
                          <div className="flex-1 bg-surface-100 rounded-full h-2">
                            <div className="h-2 bg-primary-400 rounded-full transition-all"
                              style={{ width: `${(day.posts / maxPosts) * 100}%` }} />
                          </div>
                          <span className="w-6 text-xs text-surface-500 text-right">{day.posts}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-50 border-b border-surface-100">
                <tr>
                  {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/profile/${u.username}`}
                        className="flex items-center gap-2.5 hover:text-primary-600 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-surface-100 overflow-hidden flex-shrink-0">
                          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.username}&backgroundColor=e5e7eb`}
                            alt={u.username} className="w-full h-full" />
                        </div>
                        <div>
                          <p className="font-medium text-surface-900 text-sm leading-tight">{u.displayName}</p>
                          <p className="text-xs text-surface-400">@{u.username}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-600">{u.email}</td>
                    <td className="px-4 py-3">
                      {isAdmin && u._id !== user?._id ? (
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u._id, e.target.value)}
                          disabled={actionLoading === u._id}
                          className="text-xs border border-surface-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-300"
                        >
                          {['user', 'moderator', 'admin'].map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`badge text-xs capitalize ${
                          u.role === 'admin' ? 'badge-primary' :
                          u.role === 'moderator' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          'badge-surface'
                        }`}>{u.role}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${u.isBanned ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        {u.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin && u._id !== user?._id && (
                        <button
                          onClick={() => handleBanUser(u._id, u.isBanned, u.username)}
                          disabled={actionLoading === u._id}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                            u.isBanned
                              ? 'border-green-300 text-green-700 hover:bg-green-50'
                              : 'border-red-300 text-red-600 hover:bg-red-50'
                          }`}
                        >
                          {actionLoading === u._id ? '...' : u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {tab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="card p-12 text-center">
              <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-surface-700">All clear!</h3>
              <p className="text-surface-500 text-sm mt-1">No reported posts to review.</p>
            </div>
          ) : (
            reports.map(post => (
              <div key={post._id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge bg-red-50 text-red-700 border border-red-200">
                        {post.reportCount} {post.reportCount === 1 ? 'report' : 'reports'}
                      </span>
                      <span className="text-xs text-surface-400">
                        by @{post.author?.username} · {formatRelativeTime(post.createdAt)}
                      </span>
                    </div>
                    {post.title && (
                      <h3 className="font-semibold text-surface-900 text-sm mb-1">{post.title}</h3>
                    )}
                    <p className="text-surface-600 text-sm line-clamp-3">{post.content}</p>
                    <Link href={`/communities/${post.community?.slug}`}
                      className="text-xs text-primary-600 mt-1 block">
                      in {post.community?.name}
                    </Link>

                    {/* Report reasons */}
                    {post.reports?.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {post.reports.slice(0, 3).map((r: any, i: number) => (
                          <p key={i} className="text-xs text-surface-500 bg-surface-50 rounded-lg px-3 py-1.5">
                            Reason: "{r.reason || 'No reason given'}"
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRemovePost(post._id)}
                      disabled={actionLoading === post._id}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      {actionLoading === post._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                      Remove
                    </button>
                    <Link href={`/posts/${post._id}`}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 border border-surface-200 text-surface-600 rounded-xl hover:bg-surface-50 transition-colors">
                      <ChevronRight className="w-3 h-3" /> View
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}