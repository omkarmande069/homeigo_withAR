// Session Management Module for HomeGo
class SessionManager {
  constructor() {
    // Use config if available, otherwise fallback to defaults
    this.supabaseUrl = (window.config?.supabase?.url) || 'https://your-project.supabase.co';
    this.supabaseKey = (window.config?.supabase?.anonKey) || 'your-anon-key';
    this.currentUser = null;
    this.isAuthenticated = false;
    
    // Initialize Supabase client
    this.supabase = window.supabase || null;
    
    // Bind methods
    this.checkAuth = this.checkAuth.bind(this);
    this.logout = this.logout.bind(this);
    this.getUser = this.getUser.bind(this);
    this.isLoggedIn = this.isLoggedIn.bind(this);
    
    // Initialize
    this.init();
  }

  async init() {
    // Wait for Supabase to be available
    if (typeof window.supabase === 'undefined') {
      // Load Supabase if not already loaded
      await this.loadSupabase();
    }
    
    this.supabase = window.supabase;
    
    // Set up auth state listener
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session) {
        this.currentUser = session.user;
        this.isAuthenticated = true;
        this.onAuthStateChange('SIGNED_IN', session);
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.onAuthStateChange('SIGNED_OUT', null);
      }
    });

    // Check initial auth state
    await this.checkAuth();
  }

  async loadSupabase() {
    return new Promise((resolve) => {
      if (typeof window.supabase !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = () => {
        // Initialize Supabase with your credentials
        window.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  async checkAuth() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        return false;
      }
      
      if (session) {
        this.currentUser = session.user;
        this.isAuthenticated = true;
        this.onAuthStateChange('SIGNED_IN', session);
        return true;
      } else {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.onAuthStateChange('SIGNED_OUT', null);
        return false;
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  async logout() {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        return false;
      }
      
      this.currentUser = null;
      this.isAuthenticated = false;
      this.onAuthStateChange('SIGNED_OUT', null);
      
      // Redirect to login page
      window.location.href = 'login.html';
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
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
    return this.currentUser?.user_metadata?.full_name || 
           this.currentUser?.user_metadata?.display_name || 
           this.currentUser?.email || 
           'User';
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

  // Protected route helper
  requireAuth(redirectUrl = 'login.html') {
    if (!this.isAuthenticated) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }

  // Get auth headers for API calls
  getAuthHeaders() {
    if (!this.isAuthenticated) return {};
    
    return {
      'Authorization': `Bearer ${this.supabase.auth.session()?.access_token}`,
      'Content-Type': 'application/json'
    };
  }
}

// Export for use in other modules
window.SessionManager = SessionManager;
