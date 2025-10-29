import { db } from '../config/database.js';
import { sendOTPEmail } from '../utils/emailService.js';

// User Registration - FR-001
export const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validation
        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if user exists
        const existingUser = db.users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create new user
        const newUser = {
            id: db.users.length + 1,
            name,
            email,
            password, // In real app, hash this password with bcrypt
            phone,
            role: 'customer',
            is_verified: false,
            created_at: new Date(),
            updated_at: new Date()
        };

        db.users.push(newUser);

        // Create welcome notification
        db.notifications.push({
            id: db.notifications.length + 1,
            userId: newUser.id,
            title: 'Welcome to SnapBuy!',
            message: 'Thank you for registering with SnapBuy. Start shopping now!',
            type: 'welcome',
            isRead: false,
            createdAt: new Date()
        });

        console.log(`✅ New user registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone
            }
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// User Login - FR-001
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = db.users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Verify password (in real app, use bcrypt.compare)
        if (password !== user.password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Create login notification
        db.notifications.push({
            id: db.notifications.length + 1,
            userId: user.id,
            title: 'Login Successful',
            message: 'You have successfully logged into your account.',
            type: 'security',
            isRead: false,
            createdAt: new Date()
        });

        console.log(`✅ User logged in: ${email}`);

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// Forgot Password - FR-001
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = db.users.find(u => u.email === email);
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({
                success: true,
                message: 'If the email exists, a reset OTP has been sent'
            });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Remove any existing OTP for this email
        db.passwordResets = db.passwordResets.filter(pr => pr.email !== email);

        // Save new OTP
        db.passwordResets.push({
            id: db.passwordResets.length + 1,
            email,
            otp,
            expiresAt,
            used: false,
            createdAt: new Date()
        });

        // Send OTP via email
        await sendOTPEmail(email, otp);

        console.log(`✅ Password reset OTP sent to: ${email}`);

        res.json({
            success: true,
            message: 'If the email exists, a reset OTP has been sent'
        });

    } catch (error) {
        console.error('❌ Password reset request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while sending OTP'
        });
    }
};

// Reset Password - FR-001
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, and new password are required'
            });
        }

        // Find valid OTP
        const resetRequest = db.passwordResets.find(
            r => r.email === email &&
                r.otp === otp &&
                !r.used &&
                r.expiresAt > new Date()
        );

        if (!resetRequest) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Update password
        const userIndex = db.users.findIndex(u => u.email === email);
        if (userIndex > -1) {
            db.users[userIndex].password = newPassword; // In real app, hash this password
            db.users[userIndex].updated_at = new Date();
        }

        // Mark OTP as used
        resetRequest.used = true;

        // Create password change notification
        db.notifications.push({
            id: db.notifications.length + 1,
            userId: db.users[userIndex].id,
            title: 'Password Changed',
            message: 'Your password has been changed successfully.',
            type: 'security',
            isRead: false,
            createdAt: new Date()
        });

        console.log(`✅ Password reset for: ${email}`);

        res.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('❌ Password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset'
        });
    }
};