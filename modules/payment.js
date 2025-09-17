import { config, events } from '../app.config.js';
import { getCartTotal, clearCart } from './cart.js';

class PaymentProcessor {
    constructor(sessionManager) {
        this.sessionManager = sessionManager;
        this.paymentElements = {
            form: null,
            cardInput: null,
            expiryInput: null,
            successMessage: null,
            subtotalEl: null,
            shippingEl: null,
            taxEl: null,
            totalEl: null
        };
        this.paymentState = {
            isProcessing: false,
            error: null
        };
    }

    // Format card number with spaces
    formatCardNumber(input) {
        let value = input.value.replace(/\s/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        input.value = value.replace(/(\d{4})/g, '$1 ').trim();
    }

    // Format expiry date with slash
    formatExpiryDate(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
        input.value = value;
    }

    // Calculate order summary
    calculateOrderSummary() {
        const subtotal = getCartTotal();
        const shipping = config.shippingFee;
        const tax = subtotal * config.taxRate;
        const total = subtotal + shipping + tax;

        // Update UI
        if (this.paymentElements.subtotalEl) this.paymentElements.subtotalEl.textContent = subtotal.toFixed(2);
        if (this.paymentElements.shippingEl) this.paymentElements.shippingEl.textContent = shipping.toFixed(2);
        if (this.paymentElements.taxEl) this.paymentElements.taxEl.textContent = tax.toFixed(2);
        if (this.paymentElements.totalEl) this.paymentElements.totalEl.textContent = total.toFixed(2);

        return { subtotal, shipping, tax, total };
    }

    // Process payment
    async processPayment(formData) {
        if (this.paymentState.isProcessing) return;
        
        this.paymentState.isProcessing = true;
        this.paymentState.error = null;

        try {
            const { total } = this.calculateOrderSummary();
            
            // Make API call to process payment
            const response = await fetch(`${config.apiBaseUrl}/payment/process`, {
                method: 'POST',
                headers: {
                    ...this.sessionManager.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: total,
                    currency: config.defaultCurrency,
                    paymentMethod: {
                        card: formData.get('cardNumber'),
                        expiry: formData.get('expiry'),
                        cvc: formData.get('cvc')
                    },
                    billing: {
                        name: formData.get('fullName'),
                        email: formData.get('email'),
                        phone: formData.get('phone')
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Payment failed');
            }

            // Show success message and clear cart
            this.showSuccessMessage();
            clearCart();

            // Dispatch payment completed event
            document.dispatchEvent(new CustomEvent(events.paymentCompleted, {
                detail: { amount: total }
            }));

            // Redirect after delay
            setTimeout(() => {
                window.location.href = routes.home;
            }, 2000);

        } catch (error) {
            this.paymentState.error = error.message;
            this.showError();
        } finally {
            this.paymentState.isProcessing = false;
        }
    }

    showSuccessMessage() {
        if (this.paymentElements.successMessage) {
            this.paymentElements.successMessage.classList.remove('hidden');
        }
    }

    showError() {
        // Implement error display logic
        console.error(this.paymentState.error);
    }

    // Initialize payment form
    init(container) {
        // Insert HTML template
        container.innerHTML = this.getTemplate();
        
        // Cache DOM elements
        this.paymentElements = {
            form: document.getElementById('payment-form'),
            cardInput: document.querySelector('input[pattern="[0-9 ]{19}"]'),
            expiryInput: document.querySelector('input[placeholder="MM/YY"]'),
            successMessage: document.getElementById('payment-success'),
            subtotalEl: document.getElementById('subtotal'),
            shippingEl: document.getElementById('shipping'),
            taxEl: document.getElementById('tax'),
            totalEl: document.getElementById('total')
        };

        // Add event listeners
        this.addEventListeners();

        // Initialize order summary
        this.calculateOrderSummary();

        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Add event listeners
    addEventListeners() {
        if (this.paymentElements.form) {
            this.paymentElements.form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                this.processPayment(formData);
            });
        }

        if (this.paymentElements.cardInput) {
            this.paymentElements.cardInput.addEventListener('input', (e) => {
                this.formatCardNumber(e.target);
            });
        }

        if (this.paymentElements.expiryInput) {
            this.paymentElements.expiryInput.addEventListener('input', (e) => {
                this.formatExpiryDate(e.target);
            });
        }

        // Prevent form submission on Enter key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
    }

    // Get HTML template
    getTemplate() {
        return `
            <div class="max-w-4xl mx-auto px-4 py-12">
                <div class="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div class="p-8">
                        <div class="flex items-center justify-between mb-8">
                            <h1 class="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
                            <div class="text-amber-600">
                                <i data-lucide="shield-check" class="w-8 h-8"></i>
                            </div>
                        </div>

                        <!-- Order Summary -->
                        <div class="mb-8 p-6 bg-gray-50 rounded-2xl">
                            <h2 class="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Subtotal</span>
                                    <span class="font-medium text-gray-900">$<span id="subtotal">0.00</span></span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Shipping</span>
                                    <span class="font-medium text-gray-900">$<span id="shipping">0.00</span></span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Tax</span>
                                    <span class="font-medium text-gray-900">$<span id="tax">0.00</span></span>
                                </div>
                                <div class="pt-3 border-t border-gray-200">
                                    <div class="flex justify-between">
                                        <span class="font-semibold text-gray-900">Total</span>
                                        <span class="font-bold text-2xl text-amber-600">$<span id="total">0.00</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Payment Form -->
                        <form id="payment-form" class="space-y-6">
                            <div class="grid md:grid-cols-2 gap-6">
                                <!-- Billing Information -->
                                <div class="space-y-6">
                                    <h2 class="text-lg font-semibold text-gray-900">Billing Information</h2>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        <input type="text" name="fullName" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" required>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                        <input type="email" name="email" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" required>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                        <input type="tel" name="phone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" required>
                                    </div>
                                </div>

                                <!-- Payment Details -->
                                <div class="space-y-6">
                                    <h2 class="text-lg font-semibold text-gray-900">Payment Details</h2>
                                    <div class="relative">
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                                        <input type="text" name="cardNumber" maxlength="19" class="w-full p-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" required pattern="[0-9 ]{19}">
                                        <i data-lucide="credit-card" class="absolute left-4 top-[38px] w-5 h-5 text-gray-400"></i>
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                                            <input type="text" name="expiry" maxlength="5" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="MM/YY" required pattern="(0[1-9]|1[0-2])\\/([0-9]{2})">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                                            <input type="text" name="cvc" maxlength="4" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" required pattern="[0-9]{3,4}">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Submit Button -->
                            <div class="pt-6">
                                <button type="submit" class="w-full bg-amber-600 text-white py-4 rounded-xl font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2">
                                    <i data-lucide="lock" class="w-5 h-5"></i>
                                    <span>Pay Now</span>
                                </button>
                            </div>
                        </form>

                        <!-- Payment Success Message -->
                        <div id="payment-success" class="hidden mt-6">
                            <div class="bg-green-50 text-green-800 p-4 rounded-xl flex items-center space-x-3">
                                <i data-lucide="check-circle" class="w-6 h-6 text-green-600"></i>
                                <p class="font-semibold">Payment Successful! Thank you for your order.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

export { PaymentProcessor };
