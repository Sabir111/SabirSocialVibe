import { useState, useEffect } from 'react';
import { postAPI } from '../api/post.api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await postAPI.getFeed(pageNum, 10);
      console.log('Full API Response:', JSON.stringify(response.data, null, 2));
      
      let newPosts = [];
      
      if (response.data && Array.isArray(response.data.data)) {
        newPosts = response.data.data;
      } else if (Array.isArray(response.data)) {
        newPosts = response.data;
      }
      
      console.log('Parsed posts count:', newPosts.length);
      
      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }
      
      setHasMore(newPosts.length === 10);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20">
        <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20 text-center">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                SabirSocialVibe
              </span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto px-4">
              Share your moments, connect with friends, and discover amazing content.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
            >
              Login
            </Link>
          </div>

          {/* Features */}
          <div className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 px-4">
            <div className="bg-slate-800/50 rounded-2xl p-5 sm:p-6 border border-slate-700/50">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Share Photos</h3>
              <p className="text-slate-400 text-sm">Upload and share your favorite moments</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-5 sm:p-6 border border-slate-700/50">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Connect</h3>
              <p className="text-slate-400 text-sm">Follow friends and discover new people</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-5 sm:p-6 border border-slate-700/50">
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Engage</h3>
              <p className="text-slate-400 text-sm">Like, comment and interact with posts</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-16 sm:pt-20 pb-20 md:pb-6">
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Stories Section */}
        <div className="bg-slate-800/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 border border-slate-700/50 overflow-hidden">
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {/* Add Story Button */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-400">Add Story</span>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        {loading && posts.length === 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 sm:h-4 bg-slate-700 rounded w-24 mb-2"></div>
                    <div className="h-2 sm:h-3 bg-slate-700 rounded w-16"></div>
                  </div>
                </div>
                <div className="aspect-square bg-slate-700 rounded-lg sm:rounded-xl mb-3 sm:mb-4"></div>
                <div className="h-3 sm:h-4 bg-slate-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No posts yet</h3>
            <p className="text-slate-400 text-sm sm:text-base mb-6">Follow some users or create your first post!</p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Post
            </Link>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center py-4">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2.5 bg-slate-800 text-white text-sm sm:text-base rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
