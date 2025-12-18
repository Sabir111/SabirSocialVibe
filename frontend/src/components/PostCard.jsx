import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { likeAPI } from '../api/like.api';
import { postAPI } from '../api/post.api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PostCard = ({ post, onLikeUpdate, onDelete }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef(null);

  const isOwnPost = user?._id === post.author?._id;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    setLoading(true);
    try {
      if (liked) {
        await likeAPI.unlikePost(post._id);
        setLikesCount((prev) => prev - 1);
        setLiked(false);
      } else {
        await likeAPI.likePost(post._id);
        setLikesCount((prev) => prev + 1);
        setLiked(true);
      }
      onLikeUpdate?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update like');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await postAPI.deletePost(post._id);
      toast.success('Post deleted successfully');
      setShowDeleteConfirm(false);
      onDelete?.(post._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-700 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Delete Post?</h3>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone. Your post will be permanently deleted.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300">
        {/* Post Header */}
        <div className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4">
          <Link to={`/profile/${post.author?.username}`}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
              {post.author?.avatarUrl ? (
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                post.author?.username?.charAt(0).toUpperCase()
              )}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              to={`/profile/${post.author?.username}`}
              className="font-semibold text-white text-sm sm:text-base hover:text-purple-400 transition-colors block truncate"
            >
              {post.author?.username}
            </Link>
            <p className="text-[10px] sm:text-xs text-slate-500">{formatDate(post.createdAt)}</p>
          </div>
          
          {/* More Options Menu */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="6" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="18" r="2" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-slate-900 rounded-xl border border-slate-600 shadow-2xl z-20 overflow-hidden">
                <Link
                  to={`/post/${post._id}`}
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-white hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm font-medium">View Post</span>
                </Link>

                <Link
                  to={`/profile/${post.author?.username}`}
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-white hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium">View Profile</span>
                </Link>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
                    toast.success('Link copied!');
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-white hover:bg-slate-700 transition-colors w-full"
                >
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Copy Link</span>
                </button>

                {isOwnPost && (
                  <>
                    <div className="border-t border-slate-700"></div>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors w-full"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="text-sm font-medium">Delete Post</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Image */}
        <Link to={`/post/${post._id}`}>
          <div className="relative aspect-square bg-slate-900">
            <img
              src={post.imageUrl}
              alt={post.caption || 'Post image'}
              className="w-full h-full object-cover hover:opacity-95 transition-opacity"
              loading="lazy"
            />
          </div>
        </Link>

        {/* Post Actions */}
        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
            <button
              onClick={handleLike}
              disabled={loading}
              className={`flex items-center gap-1 sm:gap-1.5 transition-all active:scale-95 ${
                liked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'
              }`}
            >
              <svg
                className={`w-5 h-5 sm:w-6 sm:h-6 ${liked ? 'fill-current animate-pulse' : ''}`}
                fill={liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="text-xs sm:text-sm font-medium">{likesCount}</span>
            </button>

            <Link
              to={`/post/${post._id}`}
              className="flex items-center gap-1 sm:gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="text-xs sm:text-sm font-medium">{post.commentsCount || 0}</span>
            </Link>

            <button className="flex items-center gap-1.5 text-slate-400 hover:text-purple-400 transition-colors ml-auto">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>

            <button className="flex items-center gap-1.5 text-slate-400 hover:text-yellow-400 transition-colors">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          </div>

          {/* Caption */}
          {post.caption && (
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              <Link
                to={`/profile/${post.author?.username}`}
                className="font-semibold text-white hover:text-purple-400 mr-1.5 sm:mr-2"
              >
                {post.author?.username}
              </Link>
              {post.caption}
            </p>
          )}

          {/* View Comments Link */}
          {post.commentsCount > 0 && (
            <Link
              to={`/post/${post._id}`}
              className="text-slate-500 text-xs sm:text-sm mt-2 block hover:text-slate-400 transition-colors"
            >
              View all {post.commentsCount} comments
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default PostCard;
