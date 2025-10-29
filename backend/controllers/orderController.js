import { db } from '../config/database.js';

// Add to cart - FR-004
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity, userId } = req.body;

        if (!productId || !quantity || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID, quantity, and user ID are required'
            });
        }

        const product = db.products.find(p => p.id === parseInt(productId));
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.stock_quantity < parseInt(quantity)) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        // Check if item already in cart
        const existingItemIndex = db.cart.findIndex(item =>
            item.productId === parseInt(productId) && item.userId === parseInt(userId)
        );

        if (existingItemIndex > -1) {
            db.cart[existingItemIndex].quantity += parseInt(quantity);
        } else {
            db.cart.push({
                id: db.cart.length + 1,
                userId: parseInt(userId),
                productId: parseInt(productId),
                quantity: parseInt(quantity),
                product: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image_url: product.image_url
                },
                createdAt: new Date()
            });
        }

        res.json({
            success: true,
            message: 'Product added to cart',
            cart: db.cart.filter(item => item.userId === parseInt(userId))
        });

    } catch (error) {
        console.error('❌ Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding to cart'
        });
    }
};

// Get cart - FR-004
export const getCart = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        const userCart = db.cart.filter(item => item.userId === userId);

        // Calculate totals
        const subtotal = userCart.reduce((sum, item) =>
            sum + (item.product.price * item.quantity), 0
        );
        const tax = subtotal * 0.18; // 18% GST
        const total = subtotal + tax;

        res.json({
            success: true,
            cart: userCart,
            summary: {
                subtotal: Math.round(subtotal),
                tax: Math.round(tax),
                total: Math.round(total),
                items: userCart.length
            }
        });

    } catch (error) {
        console.error('❌ Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching cart'
        });
    }
};

// Remove from cart
export const removeFromCart = async (req, res) => {
    try {
        const { productId, userId } = req.body;

        if (!productId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID and user ID are required'
            });
        }

        db.cart = db.cart.filter(item => !(item.productId === parseInt(productId) && item.userId === parseInt(userId)));

        res.json({
            success: true,
            message: 'Product removed from cart',
            cart: db.cart.filter(item => item.userId === parseInt(userId))
        });

    } catch (error) {
        console.error('❌ Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while removing from cart'
        });
    }
};

// Update cart quantity
export const updateCart = async (req, res) => {
    try {
        const { productId, quantity, userId } = req.body;

        if (!productId || !quantity || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID, quantity, and user ID are required'
            });
        }

        const itemIndex = db.cart.findIndex(item =>
            item.productId === parseInt(productId) && item.userId === parseInt(userId)
        );

        if (itemIndex > -1) {
            if (parseInt(quantity) === 0) {
                db.cart.splice(itemIndex, 1);
            } else {
                db.cart[itemIndex].quantity = parseInt(quantity);
                db.cart[itemIndex].updatedAt = new Date();
            }
        }

        res.json({
            success: true,
            message: 'Cart updated',
            cart: db.cart.filter(item => item.userId === parseInt(userId))
        });

    } catch (error) {
        console.error('❌ Update cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating cart'
        });
    }
};

// Create order - FR-006, FR-007, FR-008
export const createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod, userId } = req.body;

        if (!shippingAddress || !paymentMethod || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Shipping address, payment method, and user ID are required'
            });
        }

        const userCart = db.cart.filter(item => item.userId === parseInt(userId));
        if (userCart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Calculate total
        const subtotal = userCart.reduce((sum, item) =>
            sum + (item.product.price * item.quantity), 0
        );
        const total = subtotal + (subtotal * 0.18);

        // Create order
        const newOrder = {
            id: db.orders.length + 1,
            orderNumber: 'ORD' + Date.now(),
            userId: parseInt(userId),
            items: [...userCart],
            totalAmount: Math.round(total),
            status: 'pending',
            shippingAddress,
            paymentMethod,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        db.orders.push(newOrder);

        // Clear user's cart
        db.cart = db.cart.filter(item => item.userId !== parseInt(userId));

        // Create notification
        db.notifications.push({
            id: db.notifications.length + 1,
            userId: parseInt(userId),
            title: 'Order Confirmed',
            message: `Your order #${newOrder.orderNumber} has been placed successfully.`,
            type: 'order',
            isRead: false,
            createdAt: new Date()
        });

        console.log(`✅ New order created: ${newOrder.orderNumber}`);

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: newOrder
        });

    } catch (error) {
        console.error('❌ Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating order'
        });
    }
};

// Track order - FR-009
export const trackOrder = async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);

        const order = db.orders.find(o => o.id === orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Simulate order status progression based on order age
        const orderAge = Date.now() - new Date(order.createdAt).getTime();
        let statusHistory = [
            { status: 'pending', timestamp: order.createdAt, description: 'Order placed', location: 'Online Store' }
        ];

        if (orderAge > 30 * 60000) { // 30 minutes
            statusHistory.push({
                status: 'confirmed',
                timestamp: new Date(order.createdAt.getTime() + 30 * 60000),
                description: 'Order confirmed',
                location: 'Processing Center'
            });
        }

        if (orderAge > 2 * 60 * 60000) { // 2 hours
            statusHistory.push({
                status: 'shipped',
                timestamp: new Date(order.createdAt.getTime() + 2 * 60 * 60000),
                description: 'Order shipped',
                location: 'Distribution Center'
            });
        }

        if (orderAge > 24 * 60 * 60000) { // 24 hours
            statusHistory.push({
                status: 'delivered',
                timestamp: new Date(order.createdAt.getTime() + 24 * 60 * 60000),
                description: 'Order delivered',
                location: 'Delivery Address'
            });
            order.status = 'delivered';
        } else if (orderAge > 2 * 60 * 60000) {
            order.status = 'shipped';
        } else if (orderAge > 30 * 60000) {
            order.status = 'confirmed';
        }

        res.json({
            success: true,
            order: {
                ...order,
                statusHistory: statusHistory
            }
        });

    } catch (error) {
        console.error('❌ Track order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while tracking order'
        });
    }
};

// Order history - FR-010
export const getOrderHistory = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        const userOrders = db.orders
            .filter(order => order.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            orders: userOrders,
            total: userOrders.length
        });

    } catch (error) {
        console.error('❌ Get order history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching order history'
        });
    }
};