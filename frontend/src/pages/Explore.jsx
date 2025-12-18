import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { followAPI } from '../api/follow.api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../api/axios';

const Explore = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState([]);
  const [followLoading, setFollowLoading] = useState({});

  useEffect(() => {
    fetchUsers();
    if (currentUser) {
      fetchFollowing();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/users/all');
      const allUsers = data.data || data || [];
      setUsers(allUsers.filter(u => u._id !== currentUser?._id));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async () => {
    try {
      const { data } = await followAPI.getFollowing(currentUser._id);
      const followingList = data.data || data || [];
      setFollowingIds(followingList.map(f => f._id));
    } catch (error) {
      console.error('Failed to fetch following:', error);
    }
  };

  const handleFollow = async (userId) => {
    if (!currentUser) {
      toast.error('Please login to follow');
      return;
    }

    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const isFollowing = followingIds.includes(userId);
      if (isFollowing) {
        await followAPI.unfollowUser(userId);
        setFollowingIds(prev => prev.filter(id => id !== userId));
        toast.success('Unfollowed!');
      } else {
        await followAPI.followUser(userId);
        setFollowingIds(prev => [...prev, userId]);
        toast.success('Following!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update follow');
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-16 sm:pt-20 pb-20 md:pb-6">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">Explore Users</h1>
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-800/80 rounded-lg sm:rounded-xl p-3 sm:p-4 animate-pulse">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3.5 sm:h-4 bg-slate-700 rounded w-28 sm:w-32 mb-2"></div>
                    <div className="h-2.5 sm:h-3 bg-slate-700 rounded w-20 sm:w-24"></div>
                  </div>
                  <div className="h-8 sm:h-10 bg-slate-700 rounded w-20 sm:w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-16 sm:pt-20 pb-20 md:pb-6">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">Explore Users</h1>

        {users.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No users found</h3>
            <p className="text-slate-400 text-sm sm:text-base">Be the first to join!</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {users.map((user) => {
              const isFollowing = followingIds.includes(user._id);
              return (
                <div
                  key={user._id}
                  className="bg-slate-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-600/50 flex items-center gap-3 sm:gap-4 shadow-lg"
                >
                  <Link to={`/profile/${user.username}`} className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm sm:text-lg font-bold overflow-hidden">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user.username?.charAt(0).toUpperCase()
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${user.username}`}>
                      <h3 className="font-semibold text-white text-sm sm:text-base hover:text-purple-400 transition-colors truncate">
                        {user.username}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-slate-300 truncate">
                      {user.bio || 'No bio yet'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-cyan-400">
                      {user.followersCount || 0} followers
                    </p>
                  </div>

                  {currentUser && (
                    <button
                      onClick={() => handleFollow(user._id)}
                      disabled={followLoading[user._id]}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all text-xs sm:text-sm flex-shrink-0 ${
                        isFollowing
                          ? 'bg-slate-700 text-white hover:bg-slate-600'
                          : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:from-purple-700 hover:to-cyan-700'
                      }`}
                    >
                      {followLoading[user._id] ? '...' : isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
