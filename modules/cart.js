import { events } from '../app.config.js';

// Cart state
let cartItems = JSON.parse(localStorage.getItem('cart') || '[]');

// Get cart total
export function getCartTotal() {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Get cart count
export function getCartCount() {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
}

// Add item to cart
export function addToCart(product, quantity = 1) {
    const existing = cartItems.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cartItems.push({ ...product, quantity });
    }
    saveCart();
    notifyCartUpdated();
}

// Remove item from cart
export function removeFromCart(productId) {
    cartItems = cartItems.filter(item => item.id !== productId);
    saveCart();
    notifyCartUpdated();
}

// Update item quantity
export function updateQuantity(productId, change) {
    cartItems = cartItems.map(item =>
        item.id === productId 
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
    ).filter(item => item.quantity > 0);
    saveCart();
    notifyCartUpdated();
}

// Clear cart
export function clearCart() {
    cartItems = [];
    saveCart();
    notifyCartUpdated();
}

// Get cart items
export function getCartItems() {
    return [...cartItems];
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cartItems));
}

// Notify cart updated
function notifyCartUpdated() {
    document.dispatchEvent(new CustomEvent(events.cartUpdated, {
        detail: {
            items: getCartItems(),
            total: getCartTotal(),
            count: getCartCount()
        }
    }));
}
