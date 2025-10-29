import express from 'express';
import { getUserProfile, updateUserProfile, getAllUsers } from '../controllers/userController.js';

const router = express.Router();

// Get user profile
router.get('/:id', getUserProfile);

// Update user profile
router.put('/:id', updateUserProfile);

// Get all users (Admin only)
router.get('/', getAllUsers);

export default router;