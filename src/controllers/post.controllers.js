import { asyncHandler } from "../utils/asyncHandler.js";
import { Post } from "../models/Post.models.js";
import { Follow } from "../models/Follow.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createPost = asyncHandler(async (req, res) => {
    const localFilePath = req.file.path;
    const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
    if (!cloudinaryResponse?.secure_url) {
        throw new ApiError(500, "Failed to upload image");
    }

    const post = await Post.create({
      author: req.user._id,
      imageUrl: cloudinaryResponse.secure_url,
      caption: req.body.caption || "",
    })
    return res.status(201).json(
        new ApiResponse(201, post, "Post created successfully")
    )

})

const getPostById = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id).populate("author", "username avatarUrl");

    if (!post) {
        throw new ApiError(404, "Post not found");
    }
    
    return res.status(200).json(
        new ApiResponse(200, post, "Post fetched successfully")
    )
})

const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findOne({ _id: req.params.id, author: req.user._id });
    if (!post) {
        throw new ApiError(404, "Post not found or you are not authorized to delete this post");
    }
    await post.deleteOne();
    return res.status(200).json(
        new ApiResponse(200, null, "Post deleted successfully")
    );
})

const getUserPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({author: req.params.userId}).sort({createdAt: -1});
    return res.status(200).json(
        new ApiResponse(200, posts, "User posts fetched successfully")
    )
})

const getFeed = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get following users
    const following = await Follow.find({ follower: req.user._id }).select("following");
    const followingIds = following.map((f) => f.following);

    // Always show own posts + followed users' posts only
    const posts = await Post.find({
      author: { $in: [...followingIds, req.user._id] },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username avatarUrl");

    return res.status(200).json(
        new ApiResponse(200, posts, "Feed fetched successfully")
    );
});

export {createPost, getPostById, deletePost, getUserPosts, getFeed};