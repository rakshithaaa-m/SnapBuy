import express from 'express';
import { 
    addToCart, 
    getCart, 
    removeFromCart,
    updateCart,
    createOrder, 
    trackOrder, 
    getOrderHistory 
} from '../controllers/orderController.js';

const router = express.Router();

// Cart routes
router.post('/cart', addToCart);
router.get('/cart/:userId', getCart);
router.put('/cart', updateCart);
router.delete('/cart', removeFromCart);

// Order routes
router.post('/', createOrder);
router.get('/track/:orderId', trackOrder);
router.get('/user/:userId', getOrderHistory);

export default router;