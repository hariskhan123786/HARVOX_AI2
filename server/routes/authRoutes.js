import express from 'express';
import { register, login, getMe, updateProfile, forgotPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.post('/forgot-password', forgotPassword);

export default router;
