import { asyncHandler } from "../utils/asyncHandler.js";
import { Notification } from "../models/Notification.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("actor", "username avatarUrl")
      .populate("post", "imageUrl");

    return res.status(200).json(
        new ApiResponse(200, notifications, "Notifications fetched successfully")
    );
});

const markRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const notif = await Notification.findOne({ _id: id, user: req.user._id });
    if (!notif) {
      throw new ApiError(404, "Notification not found");
    }
    notif.isRead = true;
    await notif.save();
    return res.status(200).json(
        new ApiResponse(200, notif, "Notification marked as read")
    );
});

export { getNotifications, markRead };