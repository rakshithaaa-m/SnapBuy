import express from 'express';
import { getProducts, searchProducts, getProductById, getFeaturedProducts } from '../controllers/productController.js';

const router = express.Router();

// Get all products with optional filtering
router.get('/', getProducts);

// Search products with filters
router.get('/search', searchProducts);

// Get product by ID
router.get('/:id', getProductById);

// Get featured products
router.get('/featured/featured', getFeaturedProducts);

export default router;