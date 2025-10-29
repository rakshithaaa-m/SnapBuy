import { db } from '../config/database.js';

// Get all products - FR-002
export const getProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, inStock, featured } = req.query;

        let filteredProducts = [...db.products];

        // Filter by category
        if (category && category !== 'all') {
            filteredProducts = filteredProducts.filter(p =>
                p.category.toLowerCase() === category.toLowerCase()
            );
        }

        // Filter by price range
        if (minPrice) {
            filteredProducts = filteredProducts.filter(p => p.price >= parseInt(minPrice));
        }
        if (maxPrice) {
            filteredProducts = filteredProducts.filter(p => p.price <= parseInt(maxPrice));
        }

        // Filter by stock availability
        if (inStock === 'true') {
            filteredProducts = filteredProducts.filter(p => p.stock_quantity > 0);
        }

        // Filter featured products
        if (featured === 'true') {
            filteredProducts = filteredProducts.filter(p => p.is_featured);
        }

        res.json({
            success: true,
            products: filteredProducts,
            total: filteredProducts.length,
            filters: {
                category: category || 'all',
                minPrice: minPrice || '',
                maxPrice: maxPrice || '',
                inStock: inStock || 'all'
            }
        });

    } catch (error) {
        console.error('❌ Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching products'
        });
    }
};

// Search products - FR-003
export const searchProducts = async (req, res) => {
    try {
        const { q, category, sortBy, limit } = req.query;

        let filteredProducts = [...db.products];

        // Search in name and description
        if (q) {
            const searchTerm = q.toLowerCase();
            filteredProducts = filteredProducts.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                p.category.toLowerCase().includes(searchTerm)
            );
        }

        // Filter by category
        if (category && category !== 'all') {
            filteredProducts = filteredProducts.filter(p =>
                p.category.toLowerCase() === category.toLowerCase()
            );
        }

        // Sort products
        if (sortBy === 'price_low') {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price_high') {
            filteredProducts.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'rating') {
            filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === 'name') {
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            // Default sort by ID
            filteredProducts.sort((a, b) => a.id - b.id);
        }

        // Limit results
        if (limit) {
            filteredProducts = filteredProducts.slice(0, parseInt(limit));
        }

        res.json({
            success: true,
            products: filteredProducts,
            total: filteredProducts.length,
            searchQuery: q || '',
            filters: {
                category: category || 'all',
                sortBy: sortBy || 'default'
            }
        });

    } catch (error) {
        console.error('❌ Search products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching products'
        });
    }
};

// Get product by ID
export const getProductById = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const product = db.products.find(p => p.id === productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product: product
        });

    } catch (error) {
        console.error('❌ Get product by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching product'
        });
    }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
    try {
        const featuredProducts = db.products.filter(p => p.is_featured);

        res.json({
            success: true,
            products: featuredProducts,
            total: featuredProducts.length
        });

    } catch (error) {
        console.error('❌ Get featured products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching featured products'
        });
    }
};