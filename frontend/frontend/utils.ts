import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string | Date, pattern = 'MMM d, yyyy') {
  return format(new Date(date), pattern);
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'MMM d, yyyy • h:mm a');
}

export function getAvatarUrl(avatar: string | null | undefined, username: string) {
  if (avatar && avatar.startsWith('http')) return avatar;
  return `https://api.dicebear.com/7.x/initials/svg?seed=${username}&backgroundColor=f34c14&textColor=ffffff`;
}

export function truncate(text: string, length: number) {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export const COMMUNITY_CATEGORIES = [
  { value: 'neighborhood', label: 'Neighborhood', icon: '🏡' },
  { value: 'marketplace', label: 'Marketplace', icon: '🛒' },
  { value: 'events', label: 'Events', icon: '🎉' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'food', label: 'Food & Dining', icon: '🍕' },
  { value: 'arts', label: 'Arts & Culture', icon: '🎨' },
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'health', label: 'Health & Wellness', icon: '🏥' },
  { value: 'environment', label: 'Environment', icon: '🌱' },
  { value: 'politics', label: 'Local Politics', icon: '🏛️' },
  { value: 'general', label: 'General', icon: '💬' },
];
