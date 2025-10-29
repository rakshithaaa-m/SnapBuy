-- SnapBuy Database Schema
CREATE DATABASE IF NOT EXISTS snapbuy;
USE snapbuy;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role ENUM('customer', 'admin') DEFAULT 'customer',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Password reset OTP table
CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_expires (expires_at)
);

-- Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INT,
    image_url VARCHAR(500),
    stock_quantity INT DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    rating DECIMAL(3,2) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_category (category_id),
    INDEX idx_active (is_active),
    INDEX idx_featured (is_featured),
    INDEX idx_price (price)
);

-- Orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    tracking_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Order items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
);

-- Notifications table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at)
);

-- Shopping cart table
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_user_product (user_id, product_id),
    INDEX idx_user (user_id)
);

-- Insert sample data
INSERT INTO categories (name, description) VALUES 
('Electronics', 'Electronic devices and accessories'),
('Fashion', 'Clothing and fashion accessories'),
('Home', 'Home and kitchen appliances'),
('Sports', 'Sports equipment and accessories'),
('Books', 'Books and educational materials');

-- Insert sample products
INSERT INTO products (name, description, price, category_id, stock_quantity, sku, rating, is_featured) VALUES 
('Wireless Bluetooth Headphones', 'High-quality wireless headphones with noise cancellation. Perfect for music lovers and professionals.', 2999.00, 1, 50, 'ELEC-001', 4.5, TRUE),
('Smart Watch', 'Feature-rich smartwatch with health monitoring, GPS, and long battery life.', 4999.00, 1, 30, 'ELEC-002', 4.3, TRUE),
('Running Shoes', 'Comfortable running shoes with advanced cushioning technology for athletes.', 3499.00, 2, 25, 'FASH-001', 4.7, FALSE),
('Kitchen Blender', 'Powerful blender for kitchen use with multiple speed settings.', 1999.00, 3, 40, 'HOME-001', 4.2, FALSE),
('Yoga Mat', 'Non-slip yoga mat for comfortable exercise sessions.', 1299.00, 4, 60, 'SPRT-001', 4.6, TRUE),
('Programming Book', 'Complete guide to web development and programming.', 899.00, 5, 100, 'BOOK-001', 4.8, FALSE);

-- Create admin user (password: admin123)
INSERT INTO users (name, email, password, phone, role, is_verified) VALUES 
('Admin User', 'admin@snapbuy.com', 'admin123', '9876543210', 'admin', TRUE);

-- Create sample customer user (password: customer123)
INSERT INTO users (name, email, password, phone, role, is_verified) VALUES 
('John Doe', 'john@example.com', 'customer123', '9876543211', 'customer', TRUE);

-- Sample order
INSERT INTO orders (user_id, order_number, total_amount, status, shipping_address, payment_method) VALUES 
(2, 'ORD1001', 3598.00, 'delivered', '123 Main Street, Bangalore, Karnataka - 560001', 'credit_card');

-- Sample order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES 
(1, 1, 1, 2999.00),
(1, 4, 1, 599.00);

-- Sample notification
INSERT INTO notifications (user_id, title, message, type) VALUES 
(2, 'Welcome to SnapBuy!', 'Thank you for registering with SnapBuy. Start shopping now!', 'welcome');

-- Display created data
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as product_count FROM products;
SELECT COUNT(*) as category_count FROM categories;