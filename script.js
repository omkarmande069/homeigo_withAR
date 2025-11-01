// Ensure navigation is visible immediately
document.addEventListener('DOMContentLoaded', () => {
  // Make navigation visible immediately
  const nav = document.getElementById('navigation');
  if (nav) {
    nav.style.display = 'block';
    nav.style.opacity = '1';
    nav.style.visibility = 'visible';
  }
  // Initialize Session Manager
  const sessionManager = new SessionManager();
  
  // Initialize Currency Manager
  const currencyManager = new CurrencyManager();
  const currencySelector = new CurrencySelectorComponent(currencyManager);
  
  // State Management
  const state = {
    currentPage: 'home',
    cartItems: sessionManager.getCart(),
    searchQuery: '',
    selectedCategory: 'all',
    priceRange: [0, 2000],
    arMode: false,
    selectedProduct: null,
    products: [
      { id: 1, name: 'Modern Sectional Sofa', price: 1299, category: 'sofas', rating: 4.8, image: 'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=300&h=250&dpr=1', featured: true },
      { id: 2, name: 'Minimalist Coffee Table', price: 399, category: 'tables', rating: 4.6, image: 'https://images.pexels.com/photos/3148452/pexels-photo-3148452.jpeg?auto=compress&cs=tinysrgb&w=300&h=250&dpr=1', featured: true },
      { id: 3, name: 'Queen Platform Bed', price: 899, category: 'bedroom', rating: 4.9, image: 'https://images.pexels.com/photos/6480198/pexels-photo-6480198.jpeg?auto=compress&cs=tinysrgb&w=300&h=250&dpr=1', featured: false },
      { id: 4, name: 'Arc Floor Lamp', price: 189, category: 'lighting', rating: 4.7, image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=300&h=250&dpr=1', featured: true },
      { id: 5, name: 'Dining Table Set', price: 799, category: 'tables', rating: 4.5, image: 'https://images.pexels.com/photos/2092058/pexels-photo-2092058.jpeg?auto=compress&cs=tinysrgb&w=300&h=250&dpr=1', featured: false },
      { id: 6, name: 'Accent Chair', price: 449, category: 'sofas', rating: 4.4, image: 'https://images.pexels.com/photos/2762247/pexels-photo-2762247.jpeg?auto=compress&cs=tinysrgb&w=300&h=250&dpr=1', featured: false }
    ],
  };

  // Utility Functions
  const getCartTotal = () => sessionManager.isLoggedIn() ? state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0) : 0;
  const getCartCount = () => sessionManager.isLoggedIn() ? state.cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;
  
  const updateCart = (items) => {
    state.cartItems = items;
    sessionManager.updateCart(items);
    renderNavigation();
  };

  // DOM References
  const navigationEl = document.getElementById('navigation');
  const homePageEl = document.getElementById('home-page');
  const productsPageEl = document.getElementById('products-page');
  const cartPageEl = document.getElementById('cart-page');
  const aboutPageEl = document.getElementById('about-page');
  const contactPageEl = document.getElementById('contact-page');
  const footerEl = document.getElementById('footer');
  const arViewerEl = document.getElementById('ar-viewer');
  const arUiEl = document.getElementById('ar-ui');

  const pageEls = {
    home: homePageEl,
    products: productsPageEl,
    cart: cartPageEl,
    about: aboutPageEl,
    contact: contactPageEl,
  };

  // Render Functions
  const render = () => {
    renderNavigation();
    renderHomePage();
    renderProductsPage();
    renderCartPage();
    renderAboutPage();
    renderContactPage();
    renderFooter();
    renderCurrentPage();
    lucide.createIcons();
  };

  // Listen for auth state changes
  document.addEventListener('authStateChanged', (event) => {
    console.log('Auth state changed in main app:', event.detail);
    renderNavigation(); // Re-render navigation when auth state changes
    lucide.createIcons();
  });
  
  // Listen for currency changes
  document.addEventListener('currencyChanged', (event) => {
    console.log('💱 Currency changed:', event.detail);
    // Re-render pages to update prices
    renderHomePage();
    renderProductsPage();
    renderCartPage();
    renderCurrentPage();
  });

  const renderCurrentPage = () => {
    Object.values(pageEls).forEach(el => el.classList.add('hidden'));
    if (pageEls[state.currentPage]) {
      pageEls[state.currentPage].classList.remove('hidden');
    }
  };

  const renderNavigation = () => {
    const isLoggedIn = sessionManager.isLoggedIn();
    const userName = sessionManager.getUserName();
    
    // Mark navigation as loaded to hide skeleton
    navigationEl.classList.add('loaded');
    
    navigationEl.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <button data-page="home" class="nav-link text-2xl font-bold text-amber-600">HomeGo</button>
          <div class="flex items-center space-x-8">
            <button data-page="home" class="nav-link text-gray-700 hover:text-amber-600 transition-colors">Home</button>
            <button data-page="products" class="nav-link text-gray-700 hover:text-amber-600 transition-colors">Products</button>
            <button data-page="about" class="nav-link text-gray-700 hover:text-amber-600 transition-colors">About</button>
            <button data-page="contact" class="nav-link text-gray-700 hover:text-amber-600 transition-colors">Contact</button>
            ${!isLoggedIn ? '<a href="login.html" data-login-link class="nav-link text-gray-700 hover:text-amber-600 transition-colors">Login</a>' : ''}
          </div>
          <div class="flex items-center space-x-4">
            <!-- Currency Selector -->
            <div id="currency-selector"></div>
            
            <div class="relative hidden md:block">
              <i data-lucide="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"></i>
              <input id="search-input" type="text" placeholder="Search furniture..." value="${state.searchQuery}" class="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-amber-500">
            </div>
          <button data-page="cart" class="cart-button nav-link p-2 text-gray-700 hover:text-amber-600 transition-colors relative">
            <i data-lucide="shopping-cart" class="w-5 h-5"></i>
            ${getCartCount() > 0 ? `<span class="cart-badge cart-badge-update">${getCartCount()}</span>` : ''}
            </button>
            
            <!-- User Menu -->
            ${isLoggedIn ? `
              <div class="relative">
                <button data-user-button class="flex items-center space-x-2 p-2 text-gray-700 hover:text-amber-600 transition-colors">
                  <div class="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    ${userName.charAt(0).toUpperCase()}
                  </div>
                  <span class="hidden md:block text-sm text-gray-700">${userName}</span>
                  <i data-lucide="chevron-down" class="w-4 h-4 text-gray-500"></i>
                </button>
                
                <!-- Dropdown Menu -->
                <div data-user-menu class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden">
                  <div class="px-4 py-2 text-sm text-gray-700 border-b">
                    <div class="font-medium">${userName}</div>
                    <div class="text-gray-500">${sessionManager.getUserEmail()}</div>
                  </div>
                    <a href="${sessionManager.getDashboardUrl()}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</a>
                  <a href="#" data-page="profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                  <a href="#" data-page="orders" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</a>
                  <a href="#" data-page="wishlist" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Wishlist</a>
                  <div class="border-t"></div>
                  <button data-logout class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Sign Out</button>
                </div>
              </div>
            ` : `
              <button class="p-2 text-gray-700 hover:text-amber-600 transition-colors">
                <i data-lucide="user" class="w-5 h-5"></i>
              </button>
            `}
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners for user menu
    const userButton = navigationEl.querySelector('[data-user-button]');
    const userMenu = navigationEl.querySelector('[data-user-menu]');
    const logoutButton = navigationEl.querySelector('[data-logout]');
    
    if (userButton && userMenu) {
      userButton.addEventListener('click', () => {
        userMenu.classList.toggle('hidden');
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!userButton.contains(e.target) && !userMenu.contains(e.target)) {
          userMenu.classList.add('hidden');
        }
      });
    }
    
    if (logoutButton) {
      logoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await sessionManager.logout();
      });
    }
    
    // Render currency selector after navigation is rendered
    setTimeout(() => {
      currencySelector.render('currency-selector');
    }, 0);
  };

  const renderHomePage = () => {
    const featuredProducts = state.products.filter(p => p.featured);
    homePageEl.innerHTML = `
      <section class="bg-gradient-to-br from-amber-50 to-orange-50 py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 class="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">Transform Your <span class="text-amber-600 block">Home Today</span></h1>
              <p class="text-xl text-gray-600 mb-8 leading-relaxed">Discover premium furniture that combines style, comfort, and functionality.</p>
              <button data-page="products" class="nav-link bg-amber-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-amber-700 transition-colors">Shop Collection</button>
            </div>
            <div><img src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600&h=500&dpr=1" alt="Modern living room" class="rounded-3xl shadow-2xl"></div>
          </div>
        </div>
      </section>
      <section class="py-16 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12"><h2 class="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2></div>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${featuredProducts.map(product => `
              <div class="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
                <div class="relative">
                  <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover">
                  <button data-product-id="${product.id}" class="ar-button absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                    <i data-lucide="smartphone" class="w-4 h-4"></i>
                  </button>
                </div>
                <div class="p-6">
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">${product.name}</h3>
                  <p class="text-2xl font-bold text-amber-600 mb-4">${currencyManager.format(product.price)}</p>
                  <button class="w-full bg-gray-900 text-white py-3 rounded-full hover:bg-gray-800 transition-colors font-semibold">View Details</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  };

  const renderProductsPage = () => {
    const filteredProducts = state.products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(state.searchQuery.toLowerCase());
        const matchesCategory = state.selectedCategory === 'all' || product.category === state.selectedCategory;
        const matchesPrice = product.price >= state.priceRange[0] && product.price <= state.priceRange[1];
        return matchesSearch && matchesCategory && matchesPrice;
    });
    
    productsPageEl.innerHTML = `
      <div class="py-12 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">Our Products</h2>
            <p class="text-xl text-gray-600 mb-8">Discover our collection of beautiful furniture</p>
          </div>
          
          <!-- Filters -->
          <div class="flex flex-wrap gap-4 mb-8 justify-center">
            <button class="px-4 py-2 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors">All</button>
            <button class="px-4 py-2 rounded-full bg-white text-gray-700 hover:bg-amber-100 transition-colors">Living Room</button>
            <button class="px-4 py-2 rounded-full bg-white text-gray-700 hover:bg-amber-100 transition-colors">Bedroom</button>
            <button class="px-4 py-2 rounded-full bg-white text-gray-700 hover:bg-amber-100 transition-colors">Kitchen</button>
          </div>

          <!-- Products Grid -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            ${filteredProducts.map(product => `
              <div class="card group relative">
                <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg">
                  <img src="${product.image}" alt="${product.name}" 
                       class="h-64 w-full object-cover object-center group-hover:opacity-90 transition-opacity">
                  <div class="absolute top-4 right-4 space-y-2">
                    <button data-product-id="${product.id}" 
                            class="ar-button bg-white p-2 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-all">
                      <i data-lucide="smartphone" class="w-5 h-5"></i>
                    </button>
                    <button class="bg-white p-2 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all">
                      <i data-lucide="heart" class="w-5 h-5"></i>
                    </button>
                  </div>
                </div>
                <div class="p-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">${product.name}</h3>
                  <div class="flex items-center mb-4">
                    <div class="flex text-amber-400">
                      ${Array(5).fill().map((_, i) => 
                        `<i data-lucide="star" class="w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : ''}"></i>`
                      ).join('')}
                    </div>
                    <span class="ml-2 text-sm text-gray-600">(${product.rating})</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <p class="text-2xl font-bold text-amber-600">${currencyManager.format(product.price)}</p>
                    <button data-add-product="${product.id}" 
                            class="add-to-cart-btn px-4 py-2 bg-gray-900 text-white rounded-full 
                                   hover:bg-amber-600 transition-colors flex items-center gap-2">
                      <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    productsPageEl.innerHTML = `
      <div class="py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-8">All Products</h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${filteredProducts.map(product => `
              <div class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div class="relative">
                  <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
                  <button data-product-id="${product.id}" class="ar-button absolute top-3 right-3 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                    <i data-lucide="smartphone" class="w-3 h-3"></i>
                  </button>
                </div>
                <div class="p-4">
                  <h3 class="font-semibold text-gray-900 mb-2">${product.name}</h3>
                  <p class="text-lg font-bold text-amber-600">${currencyManager.format(product.price)}</p>
                  <button class="add-to-cart-btn w-full mt-2 bg-amber-600 text-white py-2 rounded-lg font-semibold hover:bg-amber-700 transition-colors" data-add-product="${product.id}">Add to Cart</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    setTimeout(() => {
      productsPageEl.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          if (!sessionManager.isLoggedIn()) {
            window.location.href = 'login.html?redirect=products';
            return;
          }
          
          const id = parseInt(btn.getAttribute('data-add-product'));
          const prod = state.products.find(p => p.id === id);
          const existing = state.cartItems.find(item => item.id === id);
          
          let newCartItems;
          if (existing) {
            newCartItems = state.cartItems.map(item => 
              item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            );
          } else {
            newCartItems = [...state.cartItems, { ...prod, quantity: 1 }];
          }
          
          updateCart(newCartItems);
          
          // Show success message
          const toast = document.createElement('div');
          toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
          toast.textContent = 'Item added to cart!';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 2000);
        });
      });
    }, 0);
  };

  const renderCartPage = () => {
    if (!sessionManager.isLoggedIn()) {
      cartPageEl.innerHTML = `
        <div class="py-8">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h2>
            <div class="text-center py-12">
              <i data-lucide="lock" class="w-16 h-16 text-gray-300 mx-auto mb-4"></i>
              <p class="text-xl text-gray-600 mb-4">Please log in to view your cart</p>
              <a href="login.html" class="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors">
                Sign In
              </a>
            </div>
          </div>
        </div>
      `;
      return;
    }
    
    if (state.cartItems.length === 0) {
      cartPageEl.innerHTML = `
        <div class="py-8">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h2>
            <div class="text-center py-12">
              <i data-lucide="shopping-cart" class="w-16 h-16 text-gray-300 mx-auto mb-4"></i>
              <p class="text-xl text-gray-600">Your cart is empty</p>
            </div>
          </div>
        </div>
      `;
    } else {
      cartPageEl.innerHTML = `
        <div class="py-8">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h2>
            <div class="space-y-4">
              ${state.cartItems.map(item => `
                <div class="bg-white p-6 rounded-2xl shadow-md flex items-center space-x-4">
                  <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg">
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900">${item.name}</h3>
                    <p class="text-gray-600">${currencyManager.format(item.price)}</p>
                  </div>
                  <div class="flex items-center space-x-3">
                    <button data-item-id="${item.id}" data-change="-1" class="cart-quantity-btn p-1 rounded-full bg-gray-100 hover:bg-gray-200"><i data-lucide="minus" class="w-4 h-4"></i></button>
                    <span class="font-semibold">${item.quantity}</span>
                    <button data-item-id="${item.id}" data-change="1" class="cart-quantity-btn p-1 rounded-full bg-gray-100 hover:bg-gray-200"><i data-lucide="plus" class="w-4 h-4"></i></button>
                  </div>
                  <button data-remove-item="${item.id}" class="ml-4 text-red-500 hover:text-red-700">Remove</button>
                  <p class="font-bold text-lg text-amber-600">${currencyManager.format(item.price * item.quantity)}</p>
                </div>
              `).join('')}
              <div class="text-right mt-6">
                <p class="text-2xl font-bold mb-4">Total: ${currencyManager.format(getCartTotal())}</p>
                <button id="checkout-btn" class="bg-amber-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-amber-700 transition-colors">Proceed to Checkout</button>
              </div>
            </div>
          </div>
        </div>
      `;
      setTimeout(() => {
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
          checkoutBtn.addEventListener('click', () => {
            window.location.href = 'payment.html';
          });
        }
        cartPageEl.querySelectorAll('[data-remove-item]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const id = parseInt(btn.getAttribute('data-remove-item'));
            state.cartItems = state.cartItems.filter(item => item.id !== id);
            renderCartPage();
            renderNavigation();
            lucide.createIcons();
          });
        });
      }, 0);
    }
  };

  const renderAboutPage = () => {
    aboutPageEl.innerHTML = `
      <div class="py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">About HomeGo</h1>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">We're passionate about helping you create beautiful, functional spaces.</p>
          </div>
        </div>
      </div>
    `;
  };

  const renderContactPage = () => {
    contactPageEl.innerHTML = `
      <div class="py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-4 text-center">Contact Us</h1>
          <div class="max-w-2xl mx-auto">
            <form class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input type="text" class="w-full p-3 border border-gray-300 rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" class="w-full p-3 border border-gray-300 rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea rows="5" class="w-full p-3 border border-gray-300 rounded-lg"></textarea>
              </div>
              <button type="submit" class="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    `;
  };

  const renderFooter = () => {
    footerEl.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 class="text-2xl font-bold text-amber-400 mb-4">HomeGo</h3>
        <p class="text-gray-300 mb-4">Transform your house into a home.</p>
        <p class="text-gray-400">&copy; 2025 HomeGo. All rights reserved.</p>
      </div>
    `;
  };

  // Event Handlers
  const handleNavClick = (e) => {
    const target = e.target.closest('.nav-link');
    if (target && target.dataset.page) {
      e.preventDefault();
      state.currentPage = target.dataset.page;
      renderCurrentPage();
      
      // Update URL without page reload
      const url = new URL(window.location);
      url.searchParams.set('page', target.dataset.page);
      window.history.pushState({}, '', url);
      
      // Scroll to top
      window.scrollTo(0, 0);
    }
  };

  const handleSearch = (e) => {
    state.searchQuery = e.target.value;
    if (state.currentPage === 'products') {
      renderProductsPage();
      lucide.createIcons();
    }
  };

  const handleCartQuantity = (e) => {
    const target = e.target.closest('.cart-quantity-btn');
    if (target) {
      const itemId = parseInt(target.dataset.itemId);
      const change = parseInt(target.dataset.change);
      state.cartItems = state.cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
      ).filter(item => item.quantity > 0);
      renderCartPage();
      renderNavigation();
      lucide.createIcons();
    }
  };

  const handleArClick = (e) => {
    const target = e.target.closest('.ar-button');
    if (target) {
      const productId = parseInt(target.dataset.productId);
      state.selectedProduct = state.products.find(p => p.id === productId);
      toggleArMode(true);
    }
  };

  // AR Viewer Logic
  let scene, camera, renderer, furniture;

  const initArScene = () => {
    const canvas = document.getElementById('ar-canvas');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 4);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    const geometry = new THREE.BoxGeometry(2, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    furniture = new THREE.Mesh(geometry, material);
    furniture.position.y = 0.5;
    scene.add(furniture);

    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
  };

  const animateAr = () => {
    if (!state.arMode) return;
    requestAnimationFrame(animateAr);
    furniture.rotation.y += 0.01;
    renderer.render(scene, camera);
  };

  const toggleArMode = (show) => {
    state.arMode = show;
    if (show) {
      arViewerEl.classList.remove('hidden');
      renderArUI();
      lucide.createIcons();
      if (!scene) {
        initArScene();
      }
      animateAr();
    } else {
      arViewerEl.classList.add('hidden');
    }
  };

  const renderArUI = () => {
    arUiEl.innerHTML = `
      <div class="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div class="bg-black bg-opacity-50 backdrop-blur-sm rounded-full px-4 py-2">
          <div class="flex items-center space-x-2 text-white">
            <i data-lucide="smartphone" class="w-4 h-4"></i>
            <span class="text-sm font-medium">AR View</span>
          </div>
        </div>
        <button id="close-ar-btn" class="bg-black bg-opacity-50 backdrop-blur-sm rounded-full p-3 text-white hover:bg-opacity-70 transition-all">
          <i data-lucide="x" class="w-6 h-6"></i>
        </button>
      </div>
      <div class="absolute bottom-4 left-4 right-4">
        <div class="bg-black bg-opacity-50 backdrop-blur-sm rounded-2xl p-4">
          <div class="flex items-center justify-between mb-4">
            <div class="text-white">
              <h3 class="font-semibold">${state.selectedProduct?.name || 'Product'}</h3>
              <p class="text-sm opacity-80">$${state.selectedProduct?.price || 0}</p>
            </div>
          </div>
          <div class="flex space-x-3">
            <button id="ar-add-to-cart-btn" class="flex-1 bg-amber-600 text-white py-3 rounded-full font-semibold hover:bg-amber-700 transition-colors">Add to Cart</button>
            <button class="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-opacity-30 transition-all"><i data-lucide="camera" class="w-5 h-5"></i></button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('close-ar-btn').addEventListener('click', () => toggleArMode(false));
    document.getElementById('ar-add-to-cart-btn').addEventListener('click', () => {
      const prod = state.selectedProduct;
      if (!prod) return;
      const existing = state.cartItems.find(item => item.id === prod.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.cartItems.push({ ...prod, quantity: 1 });
      }
      renderNavigation();
    });
  };

  // Event Listeners
  const initializeEventListeners = () => {
    // Navigation clicks
    document.body.addEventListener('click', (e) => {
      handleNavClick(e);
      handleCartQuantity(e);
      handleArClick(e);
    });

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      const params = new URLSearchParams(window.location.search);
      const page = params.get('page') || 'home';
      state.currentPage = page;
      renderCurrentPage();
    });

    // Check initial URL params
    const params = new URLSearchParams(window.location.search);
    const initialPage = params.get('page');
    if (initialPage && pageEls[initialPage]) {
      state.currentPage = initialPage;
      renderCurrentPage();
    }
  };

  document.body.addEventListener('input', (e) => {
    if (e.target.id === 'search-input') {
      handleSearch(e);
    }
  });

  // Initial Render
  render();
  initializeEventListeners();
});
