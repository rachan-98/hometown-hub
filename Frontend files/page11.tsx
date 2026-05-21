'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatRelativeTime, getAvatarUrl } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Trash2, Loader2, Send, ArrowLeft, Share2, Flag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    api.get(`/posts/${id}`)
      .then(({ data }) => {
        setPost(data.post);
        setLiked(data.post.isLiked || false);
        setLikeCount(data.post.likeCount || 0);
      })
      .catch(() => toast.error('Post not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!user) return toast.error('Login to like posts');
    try {
      const { data } = await api.post(`/posts/${id}/like`);
      setLiked(data.isLiked);
      setLikeCount(data.likeCount);
    } catch { toast.error('Failed'); }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!user) return toast.error('Login to comment');
    setSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${id}/comments`, { content: comment });
      setPost((prev: any) => ({
        ...prev,
        comments: [...(prev.comments || []), data.comment],
        commentCount: data.commentCount,
      }));
      setComment('');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await api.delete(`/posts/${id}/comments/${commentId}`);
      setPost((prev: any) => ({
        ...prev,
        comments: prev.comments.map((c: any) =>
          c._id === commentId ? { ...c, content: '[deleted]', isDeleted: true } : c
        ),
        commentCount: prev.commentCount - 1,
      }));
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <p className="text-surface-500">Post not found or has been deleted.</p>
        <Link href="/dashboard" className="btn-primary mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4" /> Back to feed
        </Link>
      </div>
    );
  }

  const activeComments = post.comments?.filter((c: any) => !c.isDeleted) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back */}
      <Link href="/dashboard" className="btn-ghost text-sm py-2 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back to feed
      </Link>

      {/* Post */}
      <article className="card p-6">
        {/* Author */}
        <div className="flex items-center gap-3 mb-5">
          <Link href={`/profile/${post.author?.username}`}>
            <div className="w-11 h-11 rounded-full overflow-hidden bg-surface-100">
              <Image
                src={getAvatarUrl(post.author?.avatar, post.author?.username)}
                alt={post.author?.displayName || ''}
                width={44} height={44}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/profile/${post.author?.username}`}
                className="font-semibold text-surface-900 hover:text-primary-600 transition-colors">
                {post.author?.displayName || post.author?.username}
              </Link>
              <span className="text-surface-400 text-sm">in</span>
              <Link href={`/communities/${post.community?.slug}`}
                className="text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors">
                {post.community?.name}
              </Link>
            </div>
            <p className="text-xs text-surface-400">{formatRelativeTime(post.createdAt)}</p>
          </div>
        </div>

        {/* Content */}
        {post.title && (
          <h1 className="font-display text-2xl font-bold text-surface-900 mb-4">{post.title}</h1>
        )}
        <div className="text-surface-700 leading-relaxed whitespace-pre-wrap">{post.content}</div>

        {/* Images */}
        {post.images?.length > 0 && (
          <div className={`mt-4 grid gap-2 rounded-xl overflow-hidden ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {post.images.map((img: any, i: number) => (
              <div key={i} className="overflow-hidden rounded-xl">
                <Image src={img.url} alt={img.caption || `Image ${i + 1}`}
                  width={800} height={600} className="w-full object-cover" unoptimized />
                {img.caption && <p className="text-xs text-surface-500 mt-1 px-1">{img.caption}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {post.tags.map((tag: string) => (
              <span key={tag} className="badge-surface">#{tag}</span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-1 mt-5 pt-5 border-t border-surface-100 text-sm text-surface-400">
          <span>{post.viewCount || 0} views</span>
          <span className="mx-2">·</span>
          <span>{likeCount} likes</span>
          <span className="mx-2">·</span>
          <span>{post.commentCount || 0} comments</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-4">
          <button onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm border transition-all ${
              liked
                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                : 'border-surface-200 text-surface-600 hover:bg-surface-50'
            }`}>
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            {liked ? 'Liked' : 'Like'}
          </button>

          <button onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm border border-surface-200 text-surface-600 hover:bg-surface-50 transition-all">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </article>

      {/* Comments section */}
      <div className="card p-6">
        <h2 className="font-display font-bold text-lg text-surface-900 mb-5">
          Comments ({post.commentCount || 0})
        </h2>

        {/* Add comment */}
        {user ? (
          <form onSubmit={handleComment} className="mb-6">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={getAvatarUrl(user.avatar, user.username)}
                  alt="You" width={36} height={36}
                  className="w-full h-full object-cover" unoptimized
                />
              </div>
              <div className="flex-1 flex gap-2">
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                  maxLength={1000}
                  className="input flex-1 resize-none text-sm"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(e as any); }
                  }}
                />
                <button type="submit" disabled={submitting || !comment.trim()}
                  className="btn-primary self-end py-2 px-3">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-surface-50 rounded-xl p-4 text-center mb-6">
            <p className="text-surface-500 text-sm">
              <Link href="/auth/login" className="link font-medium">Sign in</Link> to join the conversation
            </p>
          </div>
        )}

        {/* Comments list */}
        <div className="space-y-5">
          {activeComments.length === 0 ? (
            <p className="text-surface-400 text-sm text-center py-6">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            activeComments.map((c: any) => (
              <div key={c._id} className="flex gap-3 group">
                <Link href={`/profile/${c.author?.username}`} className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-100">
                    <Image
                      src={getAvatarUrl(c.author?.avatar, c.author?.username)}
                      alt={c.author?.displayName || ''}
                      width={36} height={36}
                      className="w-full h-full object-cover" unoptimized
                    />
                  </div>
                </Link>
                <div className="flex-1">
                  <div className="bg-surface-50 rounded-2xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <Link href={`/profile/${c.author?.username}`}
                        className="font-semibold text-sm text-surface-900 hover:text-primary-600 transition-colors">
                        {c.author?.displayName || c.author?.username}
                      </Link>
                      {(user?._id === c.author?._id || user?.role === 'admin' || user?.role === 'moderator') && (
                        <button
                          onClick={() => handleDeleteComment(c._id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-surface-400 hover:text-red-500 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-surface-700 leading-relaxed">{c.content}</p>
                  </div>
                  <p className="text-xs text-surface-400 mt-1 ml-4">{formatRelativeTime(c.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}