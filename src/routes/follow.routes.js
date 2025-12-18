import { Router} from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { followUser, getFollowers, getFollowing, unfollowUser } from "../controllers/follow.controllers.js";

const router = Router();

router.route('/:userId').post(verifyJWT, followUser)
router.route('/:userId').delete(verifyJWT, unfollowUser)
router.route('/:userId/followers').get(getFollowers)
router.route('/:userId/following').get(getFollowing)

export default router;