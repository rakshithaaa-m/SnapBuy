const API_BASE_URL = 'http://localhost:5000/api';

let orders = [];

document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    setupModal();
});

function setupModal() {
    const modal = document.getElementById('trackingModal');
    const span = document.getElementsByClassName('close')[0];
    
    if (span) {
        span.onclick = function() {
            modal.style.display = 'none';
        }
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

async function loadOrders() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/user/${currentUser.id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            orders = data.orders || [];
            displayOrders();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showMessage('Error loading orders. Showing sample orders.', 'error');
        loadSampleOrders();
    } finally {
        showLoading(false);
    }
}

function displayOrders() {
    const ordersList = document.getElementById('ordersList');
    const noOrders = document.getElementById('noOrders');
    
    if (!ordersList) return;
    
    if (orders.length === 0) {
        ordersList.innerHTML = '';
        if (noOrders) noOrders.style.display = 'block';
        return;
    }
    
    if (noOrders) noOrders.style.display = 'none';
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <h3>Order #${order.orderNumber}</h3>
                    <p class="order-date">Placed on ${formatDate(order.createdAt)}</p>
                    <p class="order-items">${getTotalItems(order)} items • ${formatPrice(order.totalAmount)}</p>
                </div>
                <div class="order-status-info">
                    <span class="order-status status-${order.status}">
                        ${getStatusText(order.status)}
                    </span>
                    <div class="order-total">${formatPrice(order.totalAmount)}</div>
                </div>
            </div>
            
            <div class="order-items-preview">
                ${order.items.slice(0, 3).map(item => `
                    <div class="order-item-preview">
                        <span>${item.product.name} × ${item.quantity}</span>
                        <span>${formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                `).join('')}
                ${order.items.length > 3 ? 
                    `<div class="more-items">+${order.items.length - 3} more items</div>` : 
                    ''
                }
            </div>
            
            <div class="order-actions">
                <button class="btn-primary" onclick="trackOrder(${order.id})">
                    📦 Track Order
                </button>
                <button class="btn-outline" onclick="viewOrderDetails(${order.id})">
                    👁️ View Details
                </button>
                ${order.status === 'delivered' ? `
                    <button class="btn-outline" onclick="reorder(${order.id})">
                        🔄 Reorder
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function getTotalItems(order) {
    return order.items.reduce((total, item) => total + item.quantity, 0);
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pending',
        'confirmed': 'Confirmed',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
}

async function trackOrder(orderId) {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/track/${orderId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            showTrackingModal(data.order);
        } else {
            showToast(data.message || 'Error tracking order', 'error');
        }
    } catch (error) {
        console.error('Error tracking order:', error);
        showToast('Network error. Please try again.', 'error');
        // Show sample tracking for demo
        showSampleTracking(orderId);
    } finally {
        showLoading(false);
    }
}

function showTrackingModal(order) {
    const modal = document.getElementById('trackingModal');
    const trackingDetails = document.getElementById('trackingDetails');
    
    if (!modal || !trackingDetails) return;
    
    const statusHistory = order.statusHistory || generateStatusHistory(order);
    
    trackingDetails.innerHTML = `
        <div class="tracking-header">
            <h3>Order #${order.orderNumber}</h3>
            <p class="tracking-status">Current Status: <span class="status-${order.status}">${getStatusText(order.status)}</span></p>
            <p><strong>Total:</strong> ${formatPrice(order.totalAmount)}</p>
            <p><strong>Shipping:</strong> ${order.shippingAddress}</p>
        </div>
        
        <div class="tracking-timeline">
            ${statusHistory.map((step, index) => `
                <div class="timeline-step ${isStepCompleted(step.timestamp) ? 'completed' : ''} ${index === statusHistory.length - 1 ? 'last' : ''}">
                    <div class="timeline-marker">
                        <div class="marker-dot"></div>
                        ${index < statusHistory.length - 1 ? '<div class="timeline-connector"></div>' : ''}
                    </div>
                    <div class="timeline-content">
                        <h4>${step.description}</h4>
                        <p class="timeline-date">${formatDateTime(step.timestamp)}</p>
                        ${step.location ? `<p class="timeline-location">📍 ${step.location}</p>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="tracking-actions">
            <button class="btn-outline" onclick="contactSupport('${order.orderNumber}')">
                📞 Contact Support
            </button>
            <button class="btn-primary" onclick="closeTrackingModal()">
                Close
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
}

function generateStatusHistory(order) {
    const baseTime = new Date(order.createdAt);
    const now = new Date();
    const orderAge = now - baseTime;
    
    const statusHistory = [
        { 
            status: 'pending', 
            timestamp: baseTime, 
            description: 'Order placed',
            location: 'Online Store'
        }
    ];
    
    if (orderAge > 30 * 60000) { // 30 minutes
        statusHistory.push({
            status: 'confirmed',
            timestamp: new Date(baseTime.getTime() + 30 * 60000),
            description: 'Order confirmed',
            location: 'Processing Center'
        });
    }
    
    if (orderAge > 2 * 60 * 60000) { // 2 hours
        statusHistory.push({
            status: 'shipped',
            timestamp: new Date(baseTime.getTime() + 2 * 60 * 60000),
            description: 'Order shipped',
            location: 'Distribution Center'
        });
    }
    
    if (orderAge > 24 * 60 * 60000) { // 24 hours
        statusHistory.push({
            status: 'delivered',
            timestamp: new Date(baseTime.getTime() + 24 * 60 * 60000),
            description: 'Order delivered',
            location: 'Delivery Address'
        });
    }
    
    return statusHistory;
}

function isStepCompleted(timestamp) {
    return new Date(timestamp) <= new Date();
}

function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const orderDetails = `
Order #: ${order.orderNumber}
Status: ${getStatusText(order.status)}
Date: ${formatDate(order.createdAt)}
Total: ${formatPrice(order.totalAmount)}
Items: ${getTotalItems(order)}
Shipping: ${order.shippingAddress}
Payment: ${order.paymentMethod}

Items:
${order.items.map(item => `  - ${item.product.name} (Qty: ${item.quantity}) - ${formatPrice(item.product.price * item.quantity)}`).join('\n')}
        `;
        alert(orderDetails);
    }
}

function reorder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order && confirm('Add all items from this order to cart?')) {
        // In a real app, you would add each item to cart via API
        showToast('Items from this order will be added to cart!', 'success');
        console.log('Reordering items:', order.items);
    }
}

function contactSupport(orderNumber) {
    alert(`Contact support for order ${orderNumber}\n\nEmail: support@snapbuy.com\nPhone: 1-800-SNAPBUY\nHours: 24/7`);
}

function closeTrackingModal() {
    const modal = document.getElementById('trackingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatPrice(price) {
    return '₹' + price.toLocaleString('en-IN');
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

// Sample data for demo
function loadSampleOrders() {
    orders = [
        {
            id: 1,
            orderNumber: 'ORD' + Date.now(),
            status: 'delivered',
            totalAmount: 3598,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            shippingAddress: '123 Main St, Bangalore, Karnataka 560001',
            paymentMethod: 'Credit Card',
            items: [
                { product: { id: 1, name: 'Wireless Headphones', price: 2999 }, quantity: 1 },
                { product: { id: 4, name: 'Phone Case', price: 599 }, quantity: 1 }
            ]
        },
        {
            id: 2,
            orderNumber: 'ORD' + (Date.now() - 1000),
            status: 'shipped',
            totalAmount: 4999,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            shippingAddress: '456 Oak Ave, Mumbai, Maharashtra 400001',
            paymentMethod: 'UPI',
            items: [
                { product: { id: 2, name: 'Smart Watch', price: 4999 }, quantity: 1 }
            ]
        },
        {
            id: 3,
            orderNumber: 'ORD' + (Date.now() - 2000),
            status: 'confirmed',
            totalAmount: 2299,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            shippingAddress: '789 Pine Rd, Delhi, Delhi 110001',
            paymentMethod: 'Cash on Delivery',
            items: [
                { product: { id: 3, name: 'Running Shoes', price: 3499 }, quantity: 1 },
                { product: { id: 5, name: 'Socks', price: 199 }, quantity: 2 }
            ]
        }
    ];
    
    displayOrders();
}

function showSampleTracking(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        showTrackingModal(order);
    }
}