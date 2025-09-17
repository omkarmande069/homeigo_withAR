import { PaymentProcessor } from './modules/payment.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize SessionManager
    const sessionManager = new SessionManager();

    // Initialize PaymentProcessor
    const paymentProcessor = new PaymentProcessor(sessionManager);
    const paymentContainer = document.getElementById('payment-container');
    
    if (paymentContainer) {
        paymentProcessor.init(paymentContainer);
    }
});

// Payment UI Template
const paymentTemplate = `
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
                <input type="text" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input type="email" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input type="tel" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" required>
              </div>
            </div>

            <!-- Payment Details -->
            <div class="space-y-6">
              <h2 class="text-lg font-semibold text-gray-900">Payment Details</h2>
              <div class="relative">
                <label class="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                <input type="text" maxlength="19" class="w-full p-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" required pattern="[0-9 ]{19}">
                <i data-lucide="credit-card" class="absolute left-4 top-[38px] w-5 h-5 text-gray-400"></i>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input type="text" maxlength="5" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="MM/YY" required pattern="(0[1-9]|1[0-2])\/([0-9]{2})">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                  <input type="text" maxlength="4" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" required pattern="[0-9]{3,4}">
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

// Format card number with spaces
function formatCardNumber(input) {
  let value = input.value.replace(/\s/g, '');
  if (value.length > 16) value = value.slice(0, 16);
  input.value = value.replace(/(\d{4})/g, '$1 ').trim();
}

// Format expiry date with slash
function formatExpiryDate(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 4) value = value.slice(0, 4);
  if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
  input.value = value;
}

// Calculate and display order total
function updateOrderSummary() {
  const cartTotal = localStorage.getItem('cartTotal') || 99.99;
  const subtotal = parseFloat(cartTotal);
  const shipping = 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  paymentElements.subtotalEl.textContent = subtotal.toFixed(2);
  paymentElements.shippingEl.textContent = shipping.toFixed(2);
  paymentElements.taxEl.textContent = tax.toFixed(2);
  paymentElements.totalEl.textContent = total.toFixed(2);
}

// Handle form submission
function handlePaymentSubmit(e) {
  e.preventDefault();
  paymentElements.successMessage.classList.remove('hidden');
  localStorage.removeItem('cartTotal');
  
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 2000);
}

// Initialize payment page
export function initPaymentPage() {
  // Insert payment template into the page
  document.querySelector('#payment-container').innerHTML = paymentTemplate;
  
  // Initialize SessionManager and Icons
  const sessionManager = new SessionManager();
  lucide.createIcons();

  // Set up event listeners
  paymentElements.cardInput.addEventListener('input', (e) => formatCardNumber(e.target));
  paymentElements.expiryInput.addEventListener('input', (e) => formatExpiryDate(e.target));
  paymentElements.form.addEventListener('submit', handlePaymentSubmit);

  // Prevent form submission on Enter key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  });

  // Initialize order summary
  updateOrderSummary();
}
