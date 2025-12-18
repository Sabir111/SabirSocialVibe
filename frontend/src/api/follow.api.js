import API from './axios';

export const followAPI = {
  followUser: (userId) => API.post(`/follows/${userId}`),
  unfollowUser: (userId) => API.delete(`/follows/${userId}`),
  getFollowers: (userId) => API.get(`/follows/${userId}/followers`),
  getFollowing: (userId) => API.get(`/follows/${userId}/following`),
};

