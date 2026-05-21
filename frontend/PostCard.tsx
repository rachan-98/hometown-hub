'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { formatRelativeTime, getAvatarUrl, truncate } from '@/lib/utils';
import { Heart, MessageCircle, Share2, Trash2, MoreHorizontal, Flag, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface PostCardProps {
  post: any;
  onDeleted?: (id: string) => void;
  showCommunity?: boolean;
}

export default function PostCard({ post, onDeleted, showCommunity = true }: PostCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const isAuthor = user?._id === post.author?._id;
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  const handleLike = async () => {
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      setLiked(data.isLiked);
      setLikeCount(data.likeCount);
    } catch {
      toast.error('Failed to like post');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      setDeleted(true);
      onDeleted?.(post._id);
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleReport = async () => {
    const reason = prompt('Reason for reporting:');
    if (!reason) return;
    try {
      await api.post(`/posts/${post._id}/report`, { reason });
      toast.success('Post reported. Thank you for helping keep our community safe.');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to report');
    }
    setShowMenu(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post._id}`);
    toast.success('Link copied to clipboard!');
  };

  if (deleted) return null;

  return (
    <article className="card p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.author?.username}`}>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-100 flex-shrink-0">
              <Image
                src={getAvatarUrl(post.author?.avatar, post.author?.username)}
                alt={post.author?.displayName || 'User'}
                width={40} height={40}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link href={`/profile/${post.author?.username}`}
                className="font-semibold text-surface-900 text-sm hover:text-primary-600 transition-colors">
                {post.author?.displayName || post.author?.username}
              </Link>
              {showCommunity && post.community && (
                <>
                  <span className="text-surface-400 text-sm">in</span>
                  <Link href={`/communities/${post.community?.slug}`}
                    className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors">
                    {post.community?.name}
                  </Link>
                </>
              )}
            </div>
            <p className="text-xs text-surface-400">{formatRelativeTime(post.createdAt)}</p>
          </div>
        </div>

        {/* More menu */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl border border-surface-100 shadow-lg py-1 z-10 animate-fade-in">
              <button onClick={handleShare}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors">
                <Share2 className="w-4 h-4" /> Copy link
              </button>
              {!isAuthor && (
                <button onClick={handleReport}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors">
                  <Flag className="w-4 h-4" /> Report post
                </button>
              )}
              {(isAuthor || isAdmin) && (
                <button onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <Link href={`/posts/${post._id}`} className="block group">
        {post.title && (
          <h2 className="font-display font-bold text-lg text-surface-900 mb-2 group-hover:text-primary-700 transition-colors">
            {post.title}
          </h2>
        )}
        <p className="text-surface-700 text-sm leading-relaxed whitespace-pre-wrap">
          {truncate(post.content, 400)}
        </p>
      </Link>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className={`mt-3 grid gap-2 rounded-xl overflow-hidden ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {post.images.slice(0, 4).map((img: any, i: number) => (
            <div key={i} className="aspect-video bg-surface-100 overflow-hidden">
              <Image src={img.url} alt={img.caption || 'Post image'} width={600} height={400}
                className="w-full h-full object-cover" unoptimized />
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.tags.map((tag: string) => (
            <span key={tag} className="badge-surface">#{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-surface-100">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all active:scale-95 ${
            liked ? 'text-red-500 hover:text-red-600' : 'text-surface-500 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          <span>{likeCount > 0 ? likeCount : ''} {likeCount === 1 ? 'Like' : 'Likes'}</span>
        </button>

        <Link href={`/posts/${post._id}`}
          className="flex items-center gap-1.5 text-sm font-medium text-surface-500 hover:text-primary-600 transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span>{post.commentCount || 0} Comments</span>
        </Link>

        <button onClick={handleShare}
          className="flex items-center gap-1.5 text-sm font-medium text-surface-500 hover:text-surface-700 transition-colors ml-auto">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </article>
  );
}
