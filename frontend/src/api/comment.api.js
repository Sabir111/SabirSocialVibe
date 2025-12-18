import API from './axios';

export const commentAPI = {
  addComment: (postId, text) => API.post(`/comments/${postId}`, { text }),
  getComments: (postId) => API.get(`/comments/${postId}`),
  deleteComment: (id) => API.delete(`/comments/${id}`),
};

