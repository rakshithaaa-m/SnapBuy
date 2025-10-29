import express from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();

// User registration
router.post('/register', register);

// User login
router.post('/login', login);

// Forgot password - send OTP
router.post('/forgot-password', forgotPassword);

// Reset password with OTP
router.post('/reset-password', resetPassword);

// Verify token (optional)
router.post('/verify-token', (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid'
    });
});

export default router;