const API_BASE_URL = 'http://localhost:5000/api';

// Admin JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('admin')) {
        checkAdminAccess();
        loadAdminStats();
        loadRecentOrders();
        setupAdminEventListeners();
    }
});

function checkAdminAccess() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Admin access required');
        window.location.href = '../login.html';
        return;
    }
}

function setupAdminEventListeners() {
    // Add product form submission
    const addProductForm = document.getElementById('newProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }
}

async function loadAdminStats() {
    showLoading(true);
    
    try {
        // Simulate API calls for stats
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, you would fetch these from your API
        document.getElementById('totalUsers').textContent = '127';
        document.getElementById('totalProducts').textContent = '45';
        document.getElementById('totalOrders').textContent = '89';
        document.getElementById('totalRevenue').textContent = '₹2,45,670';
        
    } catch (error) {
        console.error('Error loading admin stats:', error);
        showMessage('Error loading dashboard statistics', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadRecentOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            displayRecentOrders(data.orders.slice(0, 5));
        } else {
            displaySampleRecentOrders();
        }
    } catch (error) {
        console.error('Error loading recent orders:', error);
        displaySampleRecentOrders();
    }
}

function displayRecentOrders(orders) {
    const container = document.getElementById('recentOrders');
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = '<p>No recent orders</p>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="order-card" style="background: white; padding: 1rem; margin: 0.5rem 0; border-radius: 6px; border-left: 4px solid #007bff;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${order.orderNumber}</strong>
                    <br><small>${formatDate(order.createdAt)} | ₹${order.totalAmount}</small>
                </div>
                <span class="order-status status-${order.status}">${order.status}</span>
            </div>
        </div>
    `).join('');
}

function displaySampleRecentOrders() {
    const container = document.getElementById('recentOrders');
    if (!container) return;

    const sampleOrders = [
        { orderNumber: 'ORD001', status: 'delivered', totalAmount: 3598, createdAt: new Date() },
        { orderNumber: 'ORD002', status: 'shipped', totalAmount: 4999, createdAt: new Date() },
        { orderNumber: 'ORD003', status: 'pending', totalAmount: 2299, createdAt: new Date() }
    ];

    container.innerHTML = sampleOrders.map(order => `
        <div class="order-card" style="background: white; padding: 1rem; margin: 0.5rem 0; border-radius: 6px; border-left: 4px solid #007bff;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${order.orderNumber}</strong>
                    <br><small>${formatDate(order.createdAt)} | ₹${order.totalAmount}</small>
                </div>
                <span class="order-status status-${order.status}">${order.status}</span>
            </div>
        </div>
    `).join('');
}

// Product management functions
async function handleAddProduct(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        stock_quantity: parseInt(formData.get('stock')),
        category: formData.get('category'),
        sku: `SKU-${Date.now()}`,
        rating: 4.0,
        is_featured: false
    };

    try {
        // In a real app, you would make an API call here
        console.log('Adding product:', productData);
        showToast('Product added successfully!', 'success');
        closeAddProductForm();
        // Reload products list
        if (window.loadProducts) window.loadProducts();
    } catch (error) {
        console.error('Error adding product:', error);
        showToast('Error adding product', 'error');
    }
}

function showAddProductForm() {
    document.getElementById('addProductForm').style.display = 'block';
}

function closeAddProductForm() {
    document.getElementById('addProductForm').style.display = 'none';
    document.getElementById('newProductForm').reset();
}

function editProduct(id) {
    showToast(`Edit product ${id} - This would open an edit form in a real application`, 'info');
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        showToast(`Product ${id} deleted - This would remove from database in real application`, 'success');
        // In real app, reload the products list
        if (window.loadProducts) window.loadProducts();
    }
}

// Order management functions
function updateOrderStatus(orderId, status) {
    if (confirm(`Change order status to ${status}?`)) {
        showToast(`Order ${orderId} status updated to ${status}`, 'success');
        // In real app, make API call to update order status
        console.log('Updating order status:', orderId, status);
    }
}

function generateSalesReport() {
    showToast('Sales report generated successfully!', 'success');
    // In real app, generate and download report
    console.log('Generating sales report...');
}

function viewUsers() {
    showToast('User management - This would show user management in a real application', 'info');
}

// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN');
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

function showToast(message, type = 'info') {
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