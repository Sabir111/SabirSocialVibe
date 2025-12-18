import {asyncHandler} from '../utils/asyncHandler.js';
import { User } from '../models/user.models.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import jwt from 'jsonwebtoken';


const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {username,email, password} = req.body
    console.log("email", email);
    if (
        [email,username,password].some((field)=>
        field?.trim()===""
    )) {
        throw new ApiError(400, "All fields are required");
    }
    const existedUser = await User.findOne({
        $or: [{email}, {username}]
    })
    if (existedUser) {
        throw new ApiError(409, "User already exists with this email/username");
    }

    const user = await User.create({
        email,
        username:username.toLowerCase(),
        password
    })

    const craetedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!craetedUser){
        throw new ApiError(500, "Failed to create user");
    }

    return res.status(201).json(
        new ApiResponse(200, craetedUser, "User registered successfully")
    )

});

const loginUser = asyncHandler(async (req, res) => {

    const {username , email , password} = req.body
    // if (!(username || email)) {
    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{email}, {username}]
    })

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Password incorrect");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
        // sameSite: "strict",
        // maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {
            user: loggedInUser,
            accessToken,
            refreshToken
        }, "User logged in successfully")
    )
})



const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined 
            }
        },
        {
            new: true,
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged out successfully")
    ) 
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "Refresh token missing");
    }

    try {
        const decodedtoken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedtoken?._id)
        if(!user){
            throw new ApiError(401, "Invalid refresh token - user not found");
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "refresh token is expired or used");  
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200, {
                accessToken,
                refreshToken : newRefreshToken
            }, "Access token refreshed successfully")
        )
    } catch (error) {
        throw(new ApiError(401, error?.message || "Invalid refresh token"));
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
        
    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.comparePassword(currentPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Current password is incorrect");
    }
    user.password = newPassword;
    await user.save({validateBeforeSave:false});

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
    );
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    if(!req.user){
        throw new ApiError(401, "Unauthorized access");
    }

    const { bio } = req.body;
    if (!bio) {
        throw new ApiError(400, "At least one field is required");
    }
    const updates = {};
    if (bio !== undefined) updates.bio = bio;
    // if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

    const user = await User.findByIdAndUpdate(req.user._id,
        {
        $set: updates
    },
    {
      new: true,
    }
    ).select("-password");
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return res.status(200).json(
      new ApiResponse(200, user, "User details updated successfully")
    );
})

const getUserProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const user =  await User.findOne({ username }).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(
        new ApiResponse(200, user, "User profile fetched successfully")
    );
})

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select("-password -refreshToken").limit(50);
    return res.status(200).json(
        new ApiResponse(200, users, "All users fetched successfully")
    );
})

const updateAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Avatar file is required");
    }

    const localFilePath = req.file.path;
    const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
    
    if (!cloudinaryResponse?.secure_url) {
        throw new ApiError(500, "Failed to upload avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatarUrl: cloudinaryResponse.secure_url } },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, user, "Avatar updated successfully")
    );
})

export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, getUserProfile, getAllUsers, updateAvatar };
