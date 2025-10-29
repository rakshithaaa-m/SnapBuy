// Authentication middleware
export const authenticate = (req, res, next) => {
    // For now, we'll use a simple user ID from request body/headers
    // In a real app, you would use JWT tokens
    const userId = req.body.userId || req.query.userId || req.headers['user-id'];
    
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    
    // Add user to request object
    req.user = { id: parseInt(userId) };
    next();
};

// Admin authorization middleware
export const requireAdmin = (req, res, next) => {
    // Simple admin check - in real app, check user role from database
    const userId = req.user?.id;
    
    // For demo, user ID 1 is admin
    if (userId !== 1) {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    
    next();
};

// Optional authentication (doesn't block if not authenticated)
export const optionalAuth = (req, res, next) => {
    const userId = req.body.userId || req.query.userId || req.headers['user-id'];
    
    if (userId) {
        req.user = { id: parseInt(userId) };
    }
    
    next();
};