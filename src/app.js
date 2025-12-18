import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true , limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

//import routes here
import userRouter from './routes/user.routes.js';
import postRouter from './routes/post.routes.js';
import likeRouter from './routes/like.routes.js';
import commentRouter from './routes/comment.routes.js';
import followRouter from './routes/follow.routes.js';
import notificationRouter from './routes/notification.routes.js';

//routes declaration here

app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/likes', likeRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/follows', followRouter);
app.use('/api/v1/notifications', notificationRouter);


export default app;