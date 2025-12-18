import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authAPI } from '../api/auth.api';
import { postAPI } from '../api/post.api';
import { followAPI } from '../api/follow.api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({ bio: '', avatarUrl: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: profileData } = await authAPI.getUserProfile(username);
      setProfile(profileData.data);
      setEditForm({ bio: profileData.data.bio || '', avatarUrl: profileData.data.avatarUrl || '' });

      if (currentUser && profileData.data._id !== currentUser._id) {
        try {
          const { data: followingData } = await followAPI.getFollowing(currentUser._id);
          const followingList = followingData.data || followingData || [];
          const isFollowingUser = followingList.some(f => f._id === profileData.data._id);
          setIsFollowing(isFollowingUser);
        } catch (err) {
          console.log('Could not check follow status');
        }
      }

      const { data: postsData } = await postAPI.getUserPosts(profileData.data._id);
      setPosts(postsData.data || []);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      let updatedUser = null;

      if (avatarFile) {
        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const { data: avatarData } = await authAPI.updateAvatar(formData);
        updatedUser = avatarData.data;
        setUploadingAvatar(false);
      }

      if (editForm.bio !== profile.bio) {
        const { data } = await authAPI.updateAccount({ bio: editForm.bio });
        updatedUser = data.data;
      }

      if (updatedUser) {
        setProfile(updatedUser);
        if (setUser) {
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }

      setShowEditModal(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
      setUploadingAvatar(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('Please login to follow');
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followAPI.unfollowUser(profile._id);
        setIsFollowing(false);
        setProfile((prev) => ({
          ...prev,
          followersCount: prev.followersCount - 1,
        }));
      } else {
        await followAPI.followUser(profile._id);
        setIsFollowing(true);
        setProfile((prev) => ({
          ...prev,
          followersCount: prev.followersCount + 1,
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update follow');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-16 sm:pt-20 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="animate-pulse">
            <div className="bg-slate-800/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
              <div className="flex flex-col items-center gap-4 sm:gap-6">
                <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-slate-700 rounded-full"></div>
                <div className="text-center w-full">
                  <div className="h-6 sm:h-8 bg-slate-700 rounded w-32 mx-auto mb-4"></div>
                  <div className="flex justify-center gap-6 sm:gap-8">
                    <div className="h-4 bg-slate-700 rounded w-16"></div>
                    <div className="h-4 bg-slate-700 rounded w-16"></div>
                    <div className="h-4 bg-slate-700 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-16 sm:pt-20 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">User not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-16 sm:pt-20 pb-20 md:pb-6">
      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-800 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-md border-t sm:border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Edit Profile</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditProfile} className="space-y-4">
              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                      ) : (
                        profile.username?.charAt(0).toUpperCase()
                      )}
                    </div>
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-all">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">Choose Photo</span>
                      <span className="sm:hidden">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                    {avatarFile && (
                      <p className="text-xs text-slate-400 mt-1 truncate">{avatarFile.name}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white text-sm sm:text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setAvatarFile(null);
                    setAvatarPreview(null);
                  }}
                  className="flex-1 py-2.5 sm:py-3 bg-slate-700 text-white text-sm sm:text-base rounded-xl hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm sm:text-base rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all disabled:opacity-50"
                >
                  {editLoading ? (uploadingAvatar ? 'Uploading...' : 'Saving...') : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Profile Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
          <div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:gap-10">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl sm:text-4xl md:text-5xl font-bold ring-3 sm:ring-4 ring-slate-700 overflow-hidden">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  profile.username?.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left w-full">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4">
                <h1 className="text-xl sm:text-2xl font-semibold text-white">{profile.username}</h1>
                <div className="flex gap-2">
                  {!isOwnProfile && currentUser && (
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all ${
                        isFollowing
                          ? 'bg-slate-700 text-white hover:bg-slate-600'
                          : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:from-purple-700 hover:to-cyan-700'
                      }`}
                    >
                      {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                  {isOwnProfile && (
                    <button 
                      onClick={() => setShowEditModal(true)}
                      className="px-4 sm:px-6 py-1.5 sm:py-2 bg-slate-700 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-slate-600 transition-all"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start gap-6 sm:gap-8 mb-4">
                <div className="text-center">
                  <span className="block text-lg sm:text-xl font-bold text-white">{posts.length}</span>
                  <span className="text-slate-400 text-xs sm:text-sm">Posts</span>
                </div>
                <div className="text-center cursor-pointer hover:opacity-80">
                  <span className="block text-lg sm:text-xl font-bold text-white">{profile.followersCount || 0}</span>
                  <span className="text-slate-400 text-xs sm:text-sm">Followers</span>
                </div>
                <div className="text-center cursor-pointer hover:opacity-80">
                  <span className="block text-lg sm:text-xl font-bold text-white">{profile.followingCount || 0}</span>
                  <span className="text-slate-400 text-xs sm:text-sm">Following</span>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto md:mx-0">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/50 mb-4 sm:mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2.5 sm:py-3 text-center text-sm sm:text-base font-medium transition-colors ${
              activeTab === 'posts'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Posts
            </span>
          </button>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Posts Yet</h3>
            <p className="text-slate-400 text-sm sm:text-base">
              {isOwnProfile ? "Share your first photo!" : "This user hasn't posted anything yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1 md:gap-2">
            {posts.map((post) => (
              <Link
                to={`/post/${post._id}`}
                key={post._id}
                className="aspect-square bg-slate-800 overflow-hidden cursor-pointer group relative"
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption || 'Post'}
                  className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <div className="flex items-center gap-3 sm:gap-4 text-white text-sm sm:text-base">
                    <span className="flex items-center gap-1">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {post.likesCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {post.commentsCount || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
