const API_BASE_URL = 'http://localhost:5000/api';

let cart = [];
let cartSummary = {
    subtotal: 0,
    tax: 0,
    total: 0
};

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
});

async function loadCart() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/cart/${currentUser.id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            cart = data.cart || [];
            cartSummary = data.summary || calculateSummary();
            displayCartItems();
            updateCartSummary();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        showMessage('Error loading cart. Using local data.', 'error');
        // Fallback to localStorage
        loadCartFromLocalStorage();
    } finally {
        showLoading(false);
    }
}

function loadCartFromLocalStorage() {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartSummary = calculateSummary();
    displayCartItems();
    updateCartSummary();
}

function displayCartItems() {
    const cartItems = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '';
        if (emptyCart) emptyCart.style.display = 'block';
        return;
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                ${item.product.image_url ? 
                    `<img src="${item.product.image_url}" alt="${item.product.name}">` : 
                    `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; background: #f8f9fa; border-radius: 6px;">
                        <span>No Image</span>
                    </div>`
                }
            </div>
            <div class="cart-item-details">
                <h3>${item.product.name}</h3>
                <div class="product-price">₹${item.product.price.toLocaleString('en-IN')}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.productId}, ${item.quantity - 1})">-</button>
                    <span style="padding: 0 1rem; font-weight: bold;">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.productId}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <div class="cart-item-total">
                ₹${(item.product.price * item.quantity).toLocaleString('en-IN')}
            </div>
            <button class="btn-outline" onclick="removeFromCart(${item.productId})" style="white-space: nowrap;">Remove</button>
        </div>
    `).join('');
}

function updateCartSummary() {
    document.getElementById('subtotal').textContent = `₹${cartSummary.subtotal.toLocaleString('en-IN')}`;
    document.getElementById('tax').textContent = `₹${cartSummary.tax.toLocaleString('en-IN')}`;
    document.getElementById('total').textContent = `₹${cartSummary.total.toLocaleString('en-IN')}`;
}

function calculateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    return {
        subtotal: Math.round(subtotal),
        tax: Math.round(tax),
        total: Math.round(total)
    };
}

async function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/cart`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: productId,
                quantity: newQuantity,
                userId: currentUser.id
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            loadCart(); // Reload cart
            showToast('Cart updated', 'success');
        } else {
            showToast(data.message || 'Error updating quantity', 'error');
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        showToast('Network error. Please try again.', 'error');
        // Fallback to localStorage update
        updateQuantityLocal(productId, newQuantity);
    }
}

function updateQuantityLocal(productId, newQuantity) {
    const itemIndex = cart.findIndex(item => item.productId === productId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartFromLocalStorage();
    }
}

async function removeFromCart(productId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/cart`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: productId,
                userId: currentUser.id
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            loadCart(); // Reload cart
            showToast('Product removed from cart', 'success');
        } else {
            showToast(data.message || 'Error removing from cart', 'error');
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        showToast('Network error. Please try again.', 'error');
        // Fallback to localStorage
        removeFromCartLocal(productId);
    }
}

function removeFromCartLocal(productId) {
    cart = cart.filter(item => item.productId !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartFromLocalStorage();
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }
    
    window.location.href = 'checkout.html';
}

// For checkout page
function loadCheckoutItems() {
    const checkoutItems = document.getElementById('checkoutItems');
    if (!checkoutItems) return;
    
    checkoutItems.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <div class="checkout-item-info">
                <h4>${item.product.name}</h4>
                <p>Quantity: ${item.quantity} × ₹${item.product.price.toLocaleString('en-IN')}</p>
            </div>
            <div class="checkout-item-price">
                ₹${(item.product.price * item.quantity).toLocaleString('en-IN')}
            </div>
        </div>
    `).join('');
    
    document.getElementById('orderTotal').textContent = `₹${cartSummary.total.toLocaleString('en-IN')}`;
}

// Initialize checkout if on checkout page
if (window.location.href.includes('checkout.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        loadCheckoutItems();
        
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', handleCheckout);
        }
    });
}

async function handleCheckout(e) {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showToast('Please login to checkout', 'error');
        return;
    }
    
    const formData = new FormData(e.target);
    const shippingAddress = formData.get('address');
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
    
    if (!shippingAddress) {
        showToast('Please enter shipping address', 'error');
        return;
    }
    
    if (!paymentMethod) {
        showToast('Please select payment method', 'error');
        return;
    }
    
    const orderData = {
        userId: currentUser.id,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod
    };
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Order placed successfully!', 'success');
            localStorage.removeItem('cart');
            setTimeout(() => {
                window.location.href = 'orders.html';
            }, 2000);
        } else {
            showToast(data.message || 'Error placing order', 'error');
        }
    } catch (error) {
        console.error('Error during checkout:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
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