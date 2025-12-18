import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { createPost, deletePost, getFeed, getPostById, getUserPosts } from "../controllers/post.controllers.js";

const router = Router();

router.route('/').post(verifyJWT,upload.single('image'),createPost)
router.route('/feed').get(verifyJWT, getFeed)
router.route('/:id').get(getPostById)
router.route('/:id').delete(verifyJWT,deletePost)
router.route('/user/:userId').get(getUserPosts)
export default router;