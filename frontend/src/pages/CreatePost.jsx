import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../api/post.api';
import toast from 'react-hot-toast';

const CreatePost = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error('Please select an image');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('caption', caption);

      await postAPI.createPost(formData);
      toast.success('Post created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-16 sm:pt-20 pb-20 md:pb-6">
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-700/50 overflow-hidden">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-slate-700/50">
            <h1 className="text-lg sm:text-xl font-semibold text-white text-center">Create New Post</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            {/* Image Upload Area */}
            {!preview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square sm:aspect-[4/3] bg-slate-900/50 rounded-lg sm:rounded-xl border-2 border-dashed border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors"
              >
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-slate-400 text-base sm:text-lg mb-1 sm:mb-2">Tap to upload image</p>
                <p className="text-slate-500 text-xs sm:text-sm">PNG, JPG, GIF up to 5MB</p>
              </div>
            ) : (
              <div className="relative aspect-square sm:aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {/* Caption Input */}
            <div className="mt-4 sm:mt-6">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                rows={3}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-900/50 border border-slate-600 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !image}
              className="w-full mt-4 sm:mt-6 py-2.5 sm:py-3 px-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Posting...
                </span>
              ) : (
                'Share Post'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
