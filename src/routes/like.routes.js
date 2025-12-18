import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { likePost, unlikePost } from "../controllers/like.controllers.js";

const router = Router();

router.route('/:postId/like').post(verifyJWT, likePost);
router.route('/:postId/unlike').delete(verifyJWT, unlikePost);

export default router;