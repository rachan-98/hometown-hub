'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getAvatarUrl } from '@/lib/utils';
import { MapPin, Search, Bell, ChevronDown, Settings, LogOut, User, Shield, Menu, X } from 'lucide-react';
import NotificationBell from '@/components/notification/NotificationBell';
import Image from 'next/image';

export default function Navbar() {
  const { user, logout, isAdmin, isModerator } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white border-b border-surface-100 shadow-sm">
      <div className="h-16 px-4 flex items-center gap-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-surface-900 hidden sm:block">Hometown Hub</span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search communities, posts, people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 focus:bg-white transition-all"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <NotificationBell />

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-surface-50 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-100 flex-shrink-0">
                <Image
                  src={getAvatarUrl(user?.avatar, user?.username || 'user')}
                  alt={user?.displayName || 'User'}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <span className="text-sm font-medium text-surface-700 hidden sm:block max-w-[100px] truncate">
                {user?.displayName || user?.username}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-surface-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-surface-100 shadow-lg py-1.5 animate-fade-in">
                <div className="px-4 py-2 border-b border-surface-100 mb-1">
                  <p className="font-medium text-surface-900 text-sm truncate">{user?.displayName}</p>
                  <p className="text-xs text-surface-400 truncate">@{user?.username}</p>
                </div>

                <Link href={`/profile/${user?.username}`}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                  onClick={() => setShowUserMenu(false)}>
                  <User className="w-4 h-4" /> View profile
                </Link>

                <Link href="/profile/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                  onClick={() => setShowUserMenu(false)}>
                  <Settings className="w-4 h-4" /> Settings
                </Link>

                {(isAdmin || isModerator) && (
                  <Link href="/admin"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}>
                    <Shield className="w-4 h-4" /> Admin Panel
                  </Link>
                )}

                <div className="border-t border-surface-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
