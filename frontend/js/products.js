const API_BASE_URL = 'http://localhost:5000/api';

let allProducts = [];
let currentFilters = {
    category: 'all',
    sortBy: 'default',
    searchTerm: ''
};

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    
    // Add event listeners for filters
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const searchInput = document.getElementById('searchInput');
    
    if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
    if (sortFilter) sortFilter.addEventListener('change', filterProducts);
    if (searchInput) searchInput.addEventListener('input', debounce(filterProducts, 300));
    
    // Load products from URL parameters
    loadFromURLParams();
});

function loadFromURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    
    if (searchQuery) {
        document.getElementById('searchInput').value = searchQuery;
        currentFilters.searchTerm = searchQuery;
        filterProducts();
    }
}

async function loadProducts() {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            allProducts = data.products;
            displayProducts(allProducts);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showMessage('Error loading products. Showing sample products.', 'error');
        loadSampleProducts();
    } finally {
        showLoading(false);
    }
}

function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid') || document.getElementById('featuredProducts');
    if (!productsGrid) return;
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <h3>No products found</h3>
                <p>Try adjusting your search or filters</p>
                <button class="btn-primary" onclick="resetFilters()">Reset Filters</button>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                ${product.image_url ? 
                    `<img src="${product.image_url}" alt="${product.name}" onerror="this.style.display='none'">` : 
                    `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; background: #f8f9fa; border-radius: 8px;">
                        <span>No Image</span>
                    </div>`
                }
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-description">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
                <div class="product-price">₹${product.price.toLocaleString('en-IN')}</div>
                <div class="product-rating">⭐ ${product.rating || '4.0'}</div>
                <div class="product-stock ${product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}">
                    ${product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of Stock'}
                </div>
                <div class="product-category" style="font-size: 0.8rem; color: #666; margin-bottom: 1rem;">
                    ${product.category}
                </div>
                <button class="btn-primary" onclick="addToCart(${product.id})" ${product.stock_quantity === 0 ? 'disabled' : ''}>
                    ${product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    `).join('');
}

function filterProducts() {
    const category = document.getElementById('categoryFilter')?.value || 'all';
    const sortBy = document.getElementById('sortFilter')?.value || 'default';
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    
    currentFilters = { category, sortBy, searchTerm };
    
    let filteredProducts = [...allProducts];
    
    // Filter by category
    if (category !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
            product.category.toLowerCase() === category.toLowerCase()
        );
    }
    
    // Filter by search term
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
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
    }
    
    displayProducts(filteredProducts);
    updateResultsCount(filteredProducts.length);
}

function searchProducts() {
    filterProducts();
}

function resetFilters() {
    if (document.getElementById('categoryFilter')) {
        document.getElementById('categoryFilter').value = 'all';
    }
    if (document.getElementById('sortFilter')) {
        document.getElementById('sortFilter').value = 'default';
    }
    if (document.getElementById('searchInput')) {
        document.getElementById('searchInput').value = '';
    }
    currentFilters = { category: 'all', sortBy: 'default', searchTerm: '' };
    displayProducts(allProducts);
    updateResultsCount(allProducts.length);
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `${count} product${count !== 1 ? 's' : ''} found`;
    }
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add to cart function
async function addToCart(productId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please login to add items to cart');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: productId,
                quantity: 1,
                userId: currentUser.id
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Product added to cart!', 'success');
            updateCartCount();
        } else {
            showToast(data.message || 'Error adding product to cart', 'error');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

function updateCartCount() {
    // This function should be in app.js, but we'll define a fallback here
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        // Simple increment - in real app, you'd fetch the actual count
        const currentCount = parseInt(cartCount.textContent) || 0;
        cartCount.textContent = currentCount + 1;
        cartCount.style.display = 'flex';
    }
}

function showToast(message, type = 'info') {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        color: white;
        z-index: 10000;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 3000);
}

function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

// Sample data for demo
function loadSampleProducts() {
    allProducts = [
        {
            id: 1,
            name: "Wireless Bluetooth Headphones",
            description: "High-quality wireless headphones with noise cancellation",
            price: 2999,
            category: "Electronics",
            stock_quantity: 50,
            rating: 4.5
        },
        {
            id: 2,
            name: "Smart Watch",
            description: "Feature-rich smartwatch with health monitoring",
            price: 4999,
            category: "Electronics",
            stock_quantity: 30,
            rating: 4.3
        },
        {
            id: 3,
            name: "Running Shoes",
            description: "Comfortable running shoes for athletes",
            price: 3499,
            category: "Fashion",
            stock_quantity: 25,
            rating: 4.7
        },
        {
            id: 4,
            name: "Kitchen Blender",
            description: "Powerful blender for kitchen use",
            price: 1999,
            category: "Home",
            stock_quantity: 40,
            rating: 4.2
        },
        {
            id: 5,
            name: "Yoga Mat",
            description: "Non-slip yoga mat for comfortable exercise",
            price: 1299,
            category: "Sports",
            stock_quantity: 60,
            rating: 4.6
        }
    ];
    
    displayProducts(allProducts);
    updateResultsCount(allProducts.length);
}