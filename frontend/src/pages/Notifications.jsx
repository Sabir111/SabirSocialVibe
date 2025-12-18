import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationAPI } from '../api/notification.api';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getNotifications();
      setNotifications(data.data || []);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return (
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        );
      case 'comment':
        return (
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case 'follow':
        return (
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-16 sm:pt-20 pb-20 md:pb-6">
        <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">Notifications</h1>
          <div className="space-y-2 sm:space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-800/80 rounded-lg sm:rounded-xl p-3 sm:p-4 animate-pulse">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3.5 sm:h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                    <div className="h-2.5 sm:h-3 bg-slate-700 rounded w-1/4"></div>
                  </div>
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
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">Notifications</h1>

        {notifications.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No notifications</h3>
            <p className="text-slate-400 text-sm sm:text-base">When someone interacts with you, you'll see it here.</p>
          </div>
        ) : (
          <div className="space-y-1.5 sm:space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
                className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all cursor-pointer ${
                  notification.isRead
                    ? 'bg-slate-800/60'
                    : 'bg-slate-800/80 border border-purple-500/40 shadow-lg'
                } hover:bg-slate-700/80 active:scale-[0.99]`}
              >
                {getNotificationIcon(notification.type)}

                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs sm:text-sm leading-relaxed">
                    <Link
                      to={`/profile/${notification.actor?.username}`}
                      className="font-bold text-cyan-400 hover:text-cyan-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {notification.actor?.username}
                    </Link>{' '}
                    <span className="text-slate-200">{getNotificationText(notification)}</span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-purple-400 mt-0.5 sm:mt-1">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>

                {notification.post && (
                  <Link 
                    to={`/post/${notification.post}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-700 rounded-lg overflow-hidden">
                      <img
                        src={notification.post.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                )}

                {!notification.isRead && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
