import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { Follow } from "../models/Follow.models.js";
import { Notification } from "../models/Notification.models.js";
import { ApiError } from "../utils/ApiError.js";

const followUser = asyncHandler (async (req, res) => {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      res.status(400);
      return new ApiError("Cannot follow yourself");
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      res.status(404);
      return new ApiError("User not found");
    }

    // create follow (unique index prevents duplicates)
    try {
      await Follow.create({ follower: req.user._id, following: userId });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json(
            { message: "Already following this user" }
        )
      }
      throw err;
    }

    // update counts (atomicity not perfect but ok for dev)
    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(userId, { $inc: { followersCount: 1 } });

    // notification
    await Notification.create({
      user: userId,
      actor: req.user._id,
      type: "follow",
    });

    res.status(200).json(
        { message: "User followed successfully" }
    )

})

const unfollowUser = asyncHandler (async (req, res) => {
    const { userId } = req.params;

    const deleted = await Follow.findOneAndDelete({
      follower: req.user._id,
      following: userId,
    });

    if (!deleted) {
      res.status(400);
      return new ApiError("Not following");
    }

    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } });

    res.status(200).json({ message: "Unfollowed user" });
})

const getFollowers = asyncHandler (async (req, res) => {
    const { userId } = req.params;
    const followers = await Follow.find({ following: userId }).populate("follower", "username avatarUrl");
    let followerlist = followers.map(f => f.follower)
    // res.json(followerlist.length);
    res.json(followerlist);
})

const getFollowing = asyncHandler (async (req, res) => {
    const { userId } = req.params;
    const following = await Follow.find({ follower: userId }).populate("following", "username avatarUrl");
    res.json(following.map(f => f.following));
})

export { followUser, unfollowUser, getFollowers, getFollowing };