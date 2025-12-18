import { Router } from "express";
import { getNotifications, markRead } from "../controllers/notification.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route('/').get(verifyJWT, getNotifications)
router.route('/:id/read').patch(verifyJWT, markRead)


export default router;