// Session Management Module for HomeGo
class SessionManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.token = localStorage.getItem('token');
        this.initPromise = null;
        
        // Bind methods
        this.checkAuth = this.checkAuth.bind(this);
        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
        this.logout = this.logout.bind(this);
        this.getUser = this.getUser.bind(this);
        this.isLoggedIn = this.isLoggedIn.bind(this);
        
        // Initialize
        this.initPromise = this.init();
    }

    async init() {
        console.log('🔐 SessionManager: Initializing...');
        if (this.token) {
            console.log('🔑 Token found, checking authentication...');
            await this.checkAuth();
        } else {
            console.log('⚠️ No token found, user not authenticated');
        }
        console.log(`✅ SessionManager initialized. Authenticated: ${this.isAuthenticated}`);
        return this.isAuthenticated;
    }

    async checkAuth() {
        if (!this.token) {
            this.isAuthenticated = false;
            return false;
        }

        try {
            console.log('🔍 Checking authentication with server...');
            const response = await fetch('http://localhost:3000/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const user = await response.json();
                this.currentUser = user;
                this.isAuthenticated = true;
                console.log('✅ Authentication successful:', user.email, `(${user.userType})`);
                this.onAuthStateChange('SIGNED_IN', { user });
                return true;
            } else {
                console.warn('❌ Authentication failed, status:', response.status);
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('❌ Auth check error:', error);
            this.logout();
            return false;
        }
    }

    async login(email, password) {
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            this.token = data.token;
            localStorage.setItem('token', this.token);
            this.currentUser = data.user;
            this.isAuthenticated = true;
            this.onAuthStateChange('SIGNED_IN', { user: data.user });

            return data;
        } catch (error) {
            throw error;
        }
    }

    async register(email, password, fullName, userType = 'customer') {
        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, fullName, userType })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            this.token = data.token;
            localStorage.setItem('token', this.token);
            this.currentUser = data.user;
            this.isAuthenticated = true;
            this.onAuthStateChange('SIGNED_IN', { user: data.user });

            return data;
        } catch (error) {
            throw error;
        }
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('token');
        this.onAuthStateChange('SIGNED_OUT', null);
        window.location.href = 'login.html';
    }

    // Require authentication and redirect to appropriate dashboard if not on correct page
    async requireAuth() {
        console.log('🔒 Checking authentication requirement...');
        // Wait for initialization to complete
        await this.initPromise;
        
        if (!this.isAuthenticated) {
            console.warn('⛔ User not authenticated, redirecting to login...');
            window.location.href = 'login.html';
            return false;
        }
        console.log('✅ User authenticated, continuing...');
        return true;
    }

    getUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.isAuthenticated;
    }

    getUserEmail() {
        return this.currentUser?.email || null;
    }

    getUserName() {
        return this.currentUser?.fullName || 'User';
    }
    
    getUserType() {
        return this.currentUser?.userType || 'customer';
    }

    // Check if user has specific role
    hasRole(role) {
        return this.getUserType() === role;
    }

    isCustomer() {
        return this.hasRole('customer');
    }

    isSeller() {
        return this.hasRole('seller');
    }

    isAdmin() {
        return this.hasRole('admin');
    }

    // Get appropriate dashboard URL based on user role
    getDashboardUrl() {
        const userType = this.getUserType();
        switch(userType) {
            case 'admin':
                return 'admin-dashboard.html';
            case 'seller':
                return 'seller-dashboard.html';
            case 'customer':
            default:
                return 'customer-dashboard.html';
        }
    }

    onAuthStateChange(event, session) {
        // Dispatch custom event for other parts of the app to listen to
        const authEvent = new CustomEvent('authStateChanged', {
            detail: {
                event,
                session,
                user: this.currentUser,
                isAuthenticated: this.isAuthenticated
            }
        });
        document.dispatchEvent(authEvent);
        
        // Update UI based on auth state
        this.updateUI();
    }

    updateUI() {
        // Update navigation based on auth state
        const userButton = document.querySelector('[data-user-button]');
        const loginLink = document.querySelector('[data-login-link]');
        const userMenu = document.querySelector('[data-user-menu]');
        
        if (this.isAuthenticated) {
            // User is logged in
            if (loginLink) loginLink.style.display = 'none';
            if (userButton) {
                userButton.style.display = 'flex';
                userButton.innerHTML = `
                    <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            ${this.getUserName().charAt(0).toUpperCase()}
                        </div>
                        <span class="hidden md:block text-sm text-gray-700">${this.getUserName()}</span>
                        <i data-lucide="chevron-down" class="w-4 h-4 text-gray-500"></i>
                    </div>
                `;
            }
        } else {
            // User is not logged in
            if (loginLink) loginLink.style.display = 'block';
            if (userButton) userButton.style.display = 'none';
        }
        
        // Recreate icons after DOM update
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Get auth headers for API calls
    getAuthHeaders() {
        if (!this.isAuthenticated) return {};
        
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
}

// Export for use in other modules
window.SessionManager = SessionManager;
