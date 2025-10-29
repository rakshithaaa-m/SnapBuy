// In-memory database simulation
const users = [];
const products = [];
const orders = [];
const cart = [];
const notifications = [];
const passwordResets = [];

// Initialize sample data
const sampleProducts = [
    {
        id: 1,
        name: "Wireless Bluetooth Headphones",
        description: "High-quality wireless headphones with noise cancellation. Perfect for music lovers and professionals.",
        price: 2999,
        category: "Electronics",
        image_url: "/images/headphones.jpg",
        stock_quantity: 50,
        rating: 4.5,
        sku: "ELEC-001",
        is_featured: true,
        created_at: new Date()
    },
    {
        id: 2,
        name: "Smart Watch",
        description: "Feature-rich smartwatch with health monitoring, GPS, and long battery life.",
        price: 4999,
        category: "Electronics",
        image_url: "/images/smartwatch.jpg",
        stock_quantity: 30,
        rating: 4.3,
        sku: "ELEC-002",
        is_featured: true,
        created_at: new Date()
    },
    {
        id: 3,
        name: "Running Shoes",
        description: "Comfortable running shoes with advanced cushioning technology for athletes.",
        price: 3499,
        category: "Fashion",
        image_url: "/images/shoes.jpg",
        stock_quantity: 25,
        rating: 4.7,
        sku: "FASH-001",
        is_featured: false,
        created_at: new Date()
    },
    {
        id: 4,
        name: "Kitchen Blender",
        description: "Powerful blender for kitchen use with multiple speed settings.",
        price: 1999,
        category: "Home",
        image_url: "/images/blender.jpg",
        stock_quantity: 40,
        rating: 4.2,
        sku: "HOME-001",
        is_featured: false,
        created_at: new Date()
    },
    {
        id: 5,
        name: "Yoga Mat",
        description: "Non-slip yoga mat for comfortable exercise sessions.",
        price: 1299,
        category: "Sports",
        image_url: "/images/yogamat.jpg",
        stock_quantity: 60,
        rating: 4.6,
        sku: "SPRT-001",
        is_featured: true,
        created_at: new Date()
    }
];

// Add sample products if empty
if (products.length === 0) {
    sampleProducts.forEach(product => products.push(product));
}

// Add sample admin user
if (users.length === 0) {
    users.push({
        id: 1,
        name: "Admin User",
        email: "admin@snapbuy.com",
        password: "admin123", // In real app, this would be hashed
        phone: "9876543210",
        role: "admin",
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date()
    });
}

export const db = {
    users,
    products,
    orders,
    cart,
    notifications,
    passwordResets
};

console.log('✅ Database initialized with sample data');
console.log(`   📦 Products: ${products.length}`);
console.log(`   👥 Users: ${users.length}`);