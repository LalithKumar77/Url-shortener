import express from 'express';
import {
     getAllUsersHandler,
     updateProfilePic,
     deleteProfilepic,
     deleteUserHandler
    } from '../controllers/userController.js';
import apiLimiter from '../utils/rateLimiter.js';
import verifyTokens from "../middlewares/authMiddleware.js";
const router = express.Router();

router.use(verifyTokens);

router.get('/users', apiLimiter, getAllUsersHandler);

router.delete('/user', deleteUserHandler);
router.post('/user/profilepic', updateProfilePic);
router.delete('/user/profile', deleteProfilepic);

export default router;