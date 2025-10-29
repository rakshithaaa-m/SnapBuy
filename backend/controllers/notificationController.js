import { db } from '../config/database.js';

// Get user notifications
export const getUserNotifications = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const userNotifications = db.notifications
            .filter(n => n.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 20); // Limit to 20 most recent

        res.json({
            success: true,
            notifications: userNotifications,
            total: userNotifications.length
        });
    } catch (error) {
        console.error('❌ Get notifications error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching notifications' 
        });
    }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        const notificationId = parseInt(req.params.id);
        const notification = db.notifications.find(n => n.id === notificationId);
        
        if (notification) {
            notification.isRead = true;
        }

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('❌ Mark as read error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating notification' 
        });
    }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const unreadCount = db.notifications.filter(n => 
            n.userId === userId && !n.isRead
        ).length;

        res.json({
            success: true,
            unreadCount
        });
    } catch (error) {
        console.error('❌ Get unread count error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching unread count' 
        });
    }
};

// Create notification (internal use)
export const createNotification = async (userId, title, message, type = 'info') => {
    const newNotification = {
        id: db.notifications.length + 1,
        userId,
        title,
        message,
        type,
        isRead: false,
        createdAt: new Date()
    };
    
    db.notifications.push(newNotification);
    return newNotification;
};