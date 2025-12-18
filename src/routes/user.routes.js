import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, getUserProfile, getAllUsers, updateAvatar } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)

router.route('/logout').post(verifyJWT, logoutUser) 
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(verifyJWT, changeCurrentPassword)
router.route('/current-user').get(verifyJWT, getCurrentUser)
router.route('/update-account').patch(verifyJWT, updateAccountDetails)
router.route('/update-avatar').patch(verifyJWT, upload.single('avatar'), updateAvatar)
router.route('/profile/:username').get(getUserProfile)
router.route('/all').get(getAllUsers)

export default router;