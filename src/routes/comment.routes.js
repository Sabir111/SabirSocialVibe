import {Router} from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { addComment, deleteComment, getCommentsByPost } from '../controllers/comment.controllers.js';

const router = Router();

router.route('/:postId').post(verifyJWT,addComment)
router.route('/:postId').get(getCommentsByPost)
router.route('/:id').delete(verifyJWT,deleteComment)


export default router;