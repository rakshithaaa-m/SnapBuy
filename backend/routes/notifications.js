import express from 'express';
import { getUserNotifications, markAsRead, getUnreadCount } from '../controllers/notificationController.js';

const router = express.Router();

// Get user notifications
router.get('/user/:userId', getUserNotifications);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Get unread notification count
router.get('/unread/:userId', getUnreadCount);

export default router;