import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/Comment.models.js";
import { Post } from "../models/Post.models.js";
import { Notification } from "../models/Notification.models.js";
import { ApiError } from "../utils/ApiError.js";


const addComment = asyncHandler (async (req, res, next) => {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text) {
      res.status(400);
      return next(new Error("Comment text is required"));
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404);
      return next(new Error("Post not found"));
    }

    const comment = await Comment.create({
      user: req.user._id,
      post: postId,
      text,
    });

    // Populate user data before returning
    await comment.populate("user", "username avatarUrl");

    // increment commentsCount on post
    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();

    // create notification for post owner (if not commenting on own post)
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: post.author,
        actor: req.user._id,
        type: "comment",
        post: post._id,
      });
    }

    res.status(201).json(
        { 
            statusCode: 201,
            data: comment,
            message: "Comment added successfully", 
            success: true
        }
    )
})

const getCommentsByPost = asyncHandler (async (req, res, next) => {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: 1 })
      .populate("user", "username avatarUrl");
    res.status(200).json(
        {
            statusCode: 200,
            data: comments,
            message: "Comments fetched successfully", 
            success: true
        })
})

const deleteComment = asyncHandler (async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      res.status(404);
      return new ApiError("Comment not found");
    }

    // only comment owner OR post owner can delete
    const post = await Post.findById(comment.post);
    if (
      comment.user.toString() !== req.user._id.toString() &&
      post.author.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      return next(new Error("Not authorized to delete this comment"));
    }

    await comment.deleteOne();

    // decrement post commentsCount
    if (post) {
      post.commentsCount = Math.max(0, (post.commentsCount || 1) - 1);
      await post.save();
    }

    res.status(200).json({ message: "Comment deleted" });
})

export { addComment, getCommentsByPost, deleteComment };