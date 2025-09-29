// Session Management Module for HomeGo
class SessionManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.token = localStorage.getItem('token');
        
        // Bind methods
        this.checkAuth = this.checkAuth.bind(this);
        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
        this.logout = this.logout.bind(this);
        this.getUser = this.getUser.bind(this);
        this.isLoggedIn = this.isLoggedIn.bind(this);
        
        // Initialize
        this.init();
    }

    async init() {
        if (this.token) {
            await this.checkAuth();
        }
    }

    async checkAuth() {
        if (!this.token) {
            this.isAuthenticated = false;
            return false;
        }

        try {
            const response = await fetch('http://localhost:3000/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const user = await response.json();
                this.currentUser = user;
                this.isAuthenticated = true;
                this.onAuthStateChange('SIGNED_IN', { user });
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Auth check error:', error);
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
