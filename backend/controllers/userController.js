import { db } from '../config/database.js';

// Get user profile
export const getUserProfile = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = db.users.find(u => u.id === userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.json({
            success: true,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('❌ Get user profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching user profile' 
        });
    }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { name, phone } = req.body;
        
        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name and phone are required'
            });
        }
        
        const userIndex = db.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        db.users[userIndex].name = name;
        db.users[userIndex].phone = phone;
        db.users[userIndex].updated_at = new Date();

        const { password, ...updatedUser } = db.users[userIndex];
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('❌ Update user profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating profile' 
        });
    }
};

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const usersWithoutPasswords = db.users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.json({
            success: true,
            users: usersWithoutPasswords,
            total: usersWithoutPasswords.length
        });
    } catch (error) {
        console.error('❌ Get all users error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching users' 
        });
    }
};