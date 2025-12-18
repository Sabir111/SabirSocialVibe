import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { postAPI } from '../api/post.api';
import { likeAPI } from '../api/like.api';
import { commentAPI } from '../api/comment.api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwnPost = user?._id === post?.author?._id;

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const { data } = await postAPI.getPostById(id);
      const postData = data.data || data;
      setPost(postData);
      setLikesCount(postData.likesCount || 0);
      
      // Fetch comments
      try {
        const { data: commentsData } = await commentAPI.getComments(id);
        const commentsArray = commentsData?.data || commentsData || [];
        setComments(Array.isArray(commentsArray) ? commentsArray : []);
      } catch (err) {
        console.log('Could not fetch comments');
        setComments([]);
      }
    } catch (error) {
      toast.error('Failed to load post');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      if (liked) {
        await likeAPI.unlikePost(id);
        setLikesCount((prev) => prev - 1);
        setLiked(false);
      } else {
        await likeAPI.likePost(id);
        setLikesCount((prev) => prev + 1);
        setLiked(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update like');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const { data } = await commentAPI.addComment(id, newComment);
      const newCommentData = data.data || data;
      setComments((prev) => [newCommentData, ...prev]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setDeleting(true);
    try {
      await postAPI.deletePost(id);
      toast.success('Post deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-16 sm:pt-20 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="animate-pulse">
            <div className="bg-slate-800/80 rounded-2xl overflow-hidden">
              <div className="aspect-square bg-slate-700"></div>
              <div className="p-4">
                <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-16 sm:pt-20 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Post not found</h2>
          <Link to="/" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-16 sm:pt-20 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">Back</span>
        </button>

        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
          {/* Post Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                {post.author?.avatarUrl ? (
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  post.author?.username?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white hover:text-purple-400 transition-colors">
                  {post.author?.username}
                </h3>
                <p className="text-xs text-slate-500">{formatDate(post.createdAt)}</p>
              </div>
            </Link>

            {isOwnPost && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Delete Post"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          {/* Post Image */}
          <div className="relative bg-slate-900">
            <img
              src={post.imageUrl}
              alt={post.caption || 'Post image'}
              className="w-full max-h-[70vh] object-contain"
            />
          </div>

          {/* Post Actions */}
          <div className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-all ${
                  liked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'
                }`}
              >
                <svg
                  className={`w-6 h-6 sm:w-7 sm:h-7 ${liked ? 'fill-current' : ''}`}
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
                <span className="font-medium">{likesCount}</span>
              </button>

              <div className="flex items-center gap-2 text-slate-400">
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="font-medium">{comments.length}</span>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied!');
                }}
                className="text-slate-400 hover:text-purple-400 transition-colors ml-auto"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>
            </div>

            {/* Caption */}
            {post.caption && (
              <p className="text-white mb-4">
                <Link
                  to={`/profile/${post.author?.username}`}
                  className="font-semibold hover:text-purple-400 mr-2"
                >
                  {post.author?.username}
                </Link>
                <span className="text-slate-300">{post.caption}</span>
              </p>
            )}
          </div>

          {/* Comments Section */}
          <div className="border-t border-slate-700/50 p-4">
            <h4 className="text-white font-semibold mb-4">Comments ({comments.length})</h4>

            {/* Add Comment Form */}
            {user && (
              <form onSubmit={handleComment} className="flex gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    user.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || commentLoading}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-medium rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {commentLoading ? '...' : 'Post'}
                  </button>
                </div>
              </form>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No comments yet. Be the first to comment!</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    <Link to={`/profile/${comment.user?.username}`} className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                        {comment.user?.avatarUrl ? (
                          <img src={comment.user.avatarUrl} alt={comment.user.username} className="w-full h-full object-cover" />
                        ) : (
                          comment.user?.username?.charAt(0).toUpperCase()
                        )}
                      </div>
                    </Link>
                    <div className="flex-1">
                      <p className="text-sm">
                        <Link
                          to={`/profile/${comment.user?.username}`}
                          className="font-semibold text-white hover:text-purple-400 mr-2"
                        >
                          {comment.user?.username}
                        </Link>
                        <span className="text-slate-300">{comment.text}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

