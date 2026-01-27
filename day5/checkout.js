// Checkout functionality
let currentStep = 1;
let cart = [];

// Product data (same as in script.js)
const products = [
    { id: 1, name: 'Stylish T-Shirt', price: 1299, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=250&h=300&fit=crop' },
    { id: 2, name: 'Designer Jeans', price: 2499, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=250&h=300&fit=crop' },
    { id: 3, name: 'Elegant Dress', price: 1899, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=250&h=300&fit=crop' },
    { id: 4, name: 'Sneakers', price: 3999, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=250&h=300&fit=crop' },
    { id: 5, name: 'Leather Jacket', price: 4299, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=250&h=300&fit=crop' },
    { id: 6, name: 'Handbag', price: 2199, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=250&h=300&fit=crop' },
    { id: 7, name: 'Smart Watch', price: 5499, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=250&h=300&fit=crop' },
    { id: 8, name: 'Sunglasses', price: 999, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=250&h=300&fit=crop' }
];

// Initialize checkout
document.addEventListener('DOMContentLoaded', () => {
    console.log('Checkout page loaded');
    loadCart();
    updateCartCount();
    updateProgress();
    showStep(1);
    updateOrderSummary();
});

function loadCart() {
    cart = JSON.parse(localStorage.getItem('myntra-cart')) || [];
    console.log('Cart loaded:', cart);
    if (cart.length === 0) {
        showNotification('Your cart is empty. Please add some items first.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

function updateProgress() {
    document.querySelectorAll('.progress-step').forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        step.classList.toggle('active', stepNum <= currentStep);
        step.classList.toggle('completed', stepNum < currentStep);
    });
}

function showStep(step) {
    console.log('Showing step:', step);
    document.querySelectorAll('.checkout-step').forEach(stepDiv => {
        stepDiv.classList.remove('active');
    });
    document.getElementById(`step-${step}`).classList.add('active');
    currentStep = step;
    updateProgress();

    // Update review section when showing step 4
    if (step === 4) {
        updateReviewSection();
    }
}

function nextStep() {
    console.log('Next step called, current step:', currentStep);
    if (validateCurrentStep()) {
        if (currentStep < 4) {
            showStep(currentStep + 1);
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    } else {
        window.location.href = 'index.html';
    }
}

function updateOrderSummary() {
    updateCheckoutItems();
    calculateTotals();
}

function updateCheckoutItems() {
    const container = document.getElementById('checkout-items');
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty</p>';
        return;
    }

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'checkout-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>Quantity: ${item.quantity}</p>
                <p class="item-price">₹${item.price * item.quantity}</p>
            </div>
        `;
        container.appendChild(itemElement);
    });
}

function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 50;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + tax;

    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
    document.getElementById('tax').textContent = `₹${tax}`;
    document.getElementById('grand-total').textContent = `₹${total}`;

    return { subtotal, shipping, tax, total };
}

function showNotification(message, type = 'info') {
    // Simple alert for now
    alert(message);
}

function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            return cart.length > 0;
        case 2:
            return validateShippingForm();
        case 3:
            return validatePaymentForm();
        case 4:
            return document.getElementById('terms-agree').checked;
        default:
            return true;
    }
}

function validateShippingForm() {
    const requiredFields = ['first-name', 'last-name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    let isValid = true;

    requiredFields.forEach(field => {
        const element = document.getElementById(field);
        if (!element || !element.value.trim()) {
            if (element) element.classList.add('error');
            isValid = false;
        } else {
            if (element) element.classList.remove('error');
        }
    });

    if (!isValid) {
        showNotification('Please fill in all required fields.', 'error');
    }

    return isValid;
}

function validatePaymentForm() {
    const selectedMethod = document.querySelector('.payment-method.active');
    if (!selectedMethod) return false;

    const method = selectedMethod.dataset.method;

    if (method === 'card') {
        return validateCardForm();
    } else if (method === 'cod') {
        return true;
    }

    return false;
}

function validateCardForm() {
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const cardName = document.getElementById('card-name').value;

    if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
        showNotification('Please enter a valid 16-digit card number.', 'error');
        return false;
    }

    if (!cardName.trim()) {
        showNotification('Please enter the name on your card.', 'error');
        return false;
    }

    return true;
}

function placeOrder() {
    if (!validateCurrentStep()) return;

    // Generate order ID
    const orderId = 'MYN' + Date.now();

    // Show success step
    showStep('success');
    document.getElementById('order-id').textContent = orderId;

    // Clear cart
    localStorage.removeItem('myntra-cart');
    cart = [];

    showNotification('Order placed successfully!', 'success');
}

function continueShopping() {
    window.location.href = 'index.html';
}

function viewOrder() {
    alert('Order details page would open here');
}

// Add event listeners for payment method selection
document.addEventListener('DOMContentLoaded', () => {
    // Payment method selection
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', () => selectPaymentMethod(method.dataset.method));
    });

    // Form validation
    document.getElementById('checkout-form').addEventListener('submit', (e) => e.preventDefault());

    // Card formatting
    const cardNumber = document.getElementById('card-number');
    if (cardNumber) {
        cardNumber.addEventListener('input', formatCardNumber);
    }

    const expiry = document.getElementById('expiry');
    if (expiry) {
        expiry.addEventListener('input', formatExpiry);
    }

    const cvv = document.getElementById('cvv');
    if (cvv) {
        cvv.addEventListener('input', limitCVV);
    }

    // Cart icon click
    document.getElementById('cart-icon').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});

function selectPaymentMethod(method) {
    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('.payment-form').forEach(f => f.classList.remove('active'));

    const selectedMethod = document.querySelector(`[data-method="${method}"]`);
    if (selectedMethod) {
        selectedMethod.classList.add('active');
    }

    const form = document.getElementById(`${method}-form`);
    if (form) {
        form.classList.add('active');
    }
}

function formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/\D/g, '');
    value = value.substring(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = value;
}

function formatExpiry(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 4);
        value = value.replace(/(\d{2})(\d{2})/, '$1/$2');
    }
    e.target.value = value;
}

function updateReviewSection() {
    const container = document.getElementById('items-review');
    if (container) {
        container.innerHTML = '';
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'checkout-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                    <p class="item-price">₹${item.price * item.quantity}</p>
                </div>
            `;
            container.appendChild(itemElement);
        });
    }
}