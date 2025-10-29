// Main application initialization
const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    updateNavigation();
    loadFeaturedProducts();
    setupEventListeners();
});

function initializeApp() {
    // Check authentication and update UI
    const currentUser = checkAuthStatus();
    updateUIForAuth(currentUser);
    
    // Load notifications if user is logged in
    if (currentUser) {
        loadNotifications(currentUser.id);
        updateCartCount();
    }
}

function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    // Redirect to login if not authenticated on protected pages
    const protectedPages = ['cart.html', 'checkout.html', 'orders.html', 'profile.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !user) {
        window.location.href = 'login.html';
        return null;
    }
    
    return user;
}

function updateUIForAuth(user) {
    const navAuth = document.querySelector('.nav-auth');
    
    if (user) {
        // User is logged in - show user menu
        if (navAuth) {
            navAuth.innerHTML = `
                <span style="margin-right: 1rem;">Welcome, ${user.name}</span>
                <a href="profile.html" class="nav-link">Profile</a>
                <a href="orders.html" class="nav-link">Orders</a>
                <button onclick="logout()" class="btn-outline">Logout</button>
            `;
        }
        
        // Update any user-specific elements
        const userElements = document.querySelectorAll('[data-user]');
        userElements.forEach(element => {
            if (element.dataset.user === 'name') {
                element.textContent = user.name;
            }
        });
    } else {
        // User is not logged in - show auth buttons
        if (navAuth) {
            navAuth.innerHTML = `
                <a href="login.html" class="btn-outline">Login</a>
                <a href="register.html" class="btn-primary">Register</a>
            `;
        }
    }
}

function updateNavigation() {
    // Update active link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'index.html') ||
            (currentPage === 'index.html' && linkHref === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function setupEventListeners() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performGlobalSearch(this.value);
            }
        });
    }
}

async function loadFeaturedProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/featured/featured`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.products.length > 0) {
            displayFeaturedProducts(data.products);
        } else {
            // Fallback: show first 4 products as featured
            await loadDefaultProducts();
        }
    } catch (error) {
        console.error('Error loading featured products:', error);
        // Show sample featured products
        displaySampleFeaturedProducts();
    }
}

async function loadDefaultProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const data = await response.json();
        
        if (data.success) {
            const featuredProducts = data.products.slice(0, 4);
            displayFeaturedProducts(featuredProducts);
        }
    } catch (error) {
        console.error('Error loading default products:', error);
        displaySampleFeaturedProducts();
    }
}

function displayFeaturedProducts(products) {
    const featuredContainer = document.getElementById('featuredProducts');
    if (!featuredContainer) return;
    
    if (products.length === 0) {
        featuredContainer.innerHTML = '<p class="no-products">No featured products available</p>';
        return;
    }
    
    featuredContainer.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                ${product.image_url ? 
                    `<img src="${product.image_url}" alt="${product.name}" onerror="this.style.display='none'">` : 
                    `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">No Image</div>`
                }
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-description">${product.description.substring(0, 100)}...</p>
                <div class="product-price">₹${product.price}</div>
                <div class="product-rating">⭐ ${product.rating || '4.0'}</div>
                <div class="product-stock ${product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}">
                    ${product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </div>
                <button class="btn-primary" onclick="addToCart(${product.id})" ${product.stock_quantity === 0 ? 'disabled' : ''}>
                    ${product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    `).join('');
}

function displaySampleFeaturedProducts() {
    const featuredContainer = document.getElementById('featuredProducts');
    if (!featuredContainer) return;
    
    const sampleProducts = [
        {
            id: 1,
            name: "Wireless Headphones",
            description: "High-quality wireless headphones with noise cancellation",
            price: 2999,
            rating: 4.5,
            stock_quantity: 50
        },
        {
            id: 2,
            name: "Smart Watch",
            description: "Feature-rich smartwatch with health monitoring",
            price: 4999,
            rating: 4.3,
            stock_quantity: 30
        },
        {
            id: 3,
            name: "Running Shoes",
            description: "Comfortable running shoes for athletes",
            price: 3499,
            rating: 4.7,
            stock_quantity: 25
        },
        {
            id: 4,
            name: "Kitchen Blender",
            description: "Powerful blender for kitchen use",
            price: 1999,
            rating: 4.2,
            stock_quantity: 40
        }
    ];
    
    featuredContainer.innerHTML = sampleProducts.map(product => `
        <div class="product-card">
            <div class="product-image">
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">Sample Image</div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">₹${product.price}</div>
                <div class="product-rating">⭐ ${product.rating}</div>
                <button class="btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

async function loadNotifications(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            updateNotificationBadge(data.notifications);
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

function updateNotificationBadge(notifications) {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const badge = document.getElementById('notificationBadge');
    
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

async function updateCartCount() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/cart/${currentUser.id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            const cartCount = data.cart.reduce((total, item) => total + item.quantity, 0);
            const cartCountElement = document.getElementById('cartCount');
            if (cartCountElement) {
                cartCountElement.textContent = cartCount;
                cartCountElement.style.display = cartCount > 0 ? 'flex' : 'none';
            }
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
        // Fallback to localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            cartCountElement.textContent = cartCount;
            cartCountElement.style.display = cartCount > 0 ? 'flex' : 'none';
        }
    }
}

// Global add to cart function
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
            showToast('Error adding product to cart', 'error');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

function performGlobalSearch(query) {
    if (query.trim()) {
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
}

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 6px;
                color: white;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 250px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease;
            }
            .toast-success { background: #28a745; }
            .toast-error { background: #dc3545; }
            .toast-info { background: #17a2b8; }
            .toast-warning { background: #ffc107; color: #333; }
            .toast button {
                background: none;
                border: none;
                color: inherit;
                font-size: 1.2rem;
                cursor: pointer;
                margin-left: 1rem;
                opacity: 0.8;
            }
            .toast button:hover { opacity: 1; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 3000);
}

// Global logout function
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Utility function to format price
function formatPrice(price) {
    return '₹' + price.toLocaleString('en-IN');
}

// Utility function to handle API errors
function handleApiError(error) {
    console.error('API Error:', error);
    showToast('Something went wrong. Please try again.', 'error');
}

// Health check
async function checkServerHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch (error) {
        console.error('Server health check failed:', error);
        return false;
    }
}