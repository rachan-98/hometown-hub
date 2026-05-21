'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Calendar, Bell, User, Search,
  Plus, TrendingUp, Shield, Settings, Compass
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/communities', icon: Compass, label: 'Explore' },
  { href: '/events', icon: Calendar, label: 'Events' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, isModerator } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-surface-100 overflow-y-auto hidden lg:flex flex-col">
      <div className="flex flex-col flex-1 py-4 px-3">
        {/* Main nav */}
        <nav className="space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive(href)
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive(href) ? 'text-primary-600' : 'text-surface-400')} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Quick actions */}
        <div className="mt-6 pt-6 border-t border-surface-100 space-y-2">
          <p className="px-3 text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Quick Actions</p>
          <Link href="/communities/new"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-all">
            <div className="w-5 h-5 rounded-md bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Plus className="w-3 h-3 text-primary-600" />
            </div>
            New Community
          </Link>
          <Link href="/events/new"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-all">
            <div className="w-5 h-5 rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Plus className="w-3 h-3 text-purple-600" />
            </div>
            New Event
          </Link>
        </div>

        {/* My communities */}
        {user?.communities && user.communities.length > 0 && (
          <div className="mt-6 pt-6 border-t border-surface-100">
            <p className="px-3 text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">My Communities</p>
            <div className="space-y-0.5">
              {user.communities.slice(0, 6).map((community: any) => (
                <Link
                  key={community._id}
                  href={`/communities/${community.slug}`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-all"
                >
                  <div className="w-6 h-6 rounded-lg bg-surface-100 overflow-hidden flex-shrink-0">
                    {community.avatar ? (
                      <img src={community.avatar} alt={community.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
                        {community.name[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="truncate">{community.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Admin link */}
        {(isAdmin || isModerator) && (
          <div className="mt-auto pt-4 border-t border-surface-100">
            <Link href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-600 hover:bg-primary-50 transition-all">
              <Shield className="w-5 h-5" />
              Admin Panel
            </Link>
          </div>
        )}

        {/* Profile link */}
        <div className="mt-4">
          <Link href={`/profile/${user?.username}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-50 transition-all">
            <User className="w-5 h-5 text-surface-400" />
            My Profile
          </Link>
          <Link href="/profile/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-50 transition-all">
            <Settings className="w-5 h-5 text-surface-400" />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
}
