import API from './axios';

export const postAPI = {
  createPost: (formData) => API.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getFeed: (page = 1, limit = 10) => API.get(`/posts/feed?page=${page}&limit=${limit}`),
  getPostById: (id) => API.get(`/posts/${id}`),
  deletePost: (id) => API.delete(`/posts/${id}`),
  getUserPosts: (userId) => API.get(`/posts/user/${userId}`),
};

