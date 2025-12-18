import API from './axios';

export const likeAPI = {
  likePost: (postId) => API.post(`/likes/${postId}/like`),
  unlikePost: (postId) => API.delete(`/likes/${postId}/unlike`),
};

