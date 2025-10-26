// API Helper for HomeGo - Connects frontend to MongoDB backend
const API_BASE_URL = 'http://localhost:3000/api';

class API {
  // Generic fetch wrapper
  static async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ========== SELLERS ==========
  static async getSellers() {
    return this.request('/sellers');
  }

  static async getSellerById(id) {
    return this.request(`/sellers/${id}`);
  }

  static async createSeller(data) {
    return this.request('/sellers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async updateSellerStatus(id, status) {
    return this.request(`/sellers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // ========== PRODUCTS ==========
  static async getProducts(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/products?${params}`);
  }

  static async getProductById(id) {
    return this.request(`/products/${id}`);
  }

  static async createProduct(data) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async updateProduct(id, data) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  static async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== ORDERS ==========
  static async getOrders(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/orders?${params}`);
  }

  static async createOrder(data) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async updateOrderStatus(id, status) {
    return this.request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // ========== TRANSACTIONS ==========
  static async getTransactions() {
    return this.request('/transactions');
  }

  static async createTransaction(data) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ========== PROMOTIONS ==========
  static async getPromotions() {
    return this.request('/promotions');
  }

  static async createPromotion(data) {
    return this.request('/promotions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async deletePromotion(id) {
    return this.request(`/promotions/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== SUPPORT TICKETS ==========
  static async getSupportTickets(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/support-tickets?${params}`);
  }

  static async getSupportTicketById(id) {
    return this.request(`/support-tickets/${id}`);
  }

  static async createSupportTicket(data) {
    return this.request('/support-tickets', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async updateTicketStatus(id, status) {
    return this.request(`/support-tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  static async addTicketResponse(id, response) {
    return this.request(`/support-tickets/${id}/responses`, {
      method: 'POST',
      body: JSON.stringify(response)
    });
  }

  // ========== STATISTICS ==========
  static async getSellerStats(sellerId) {
    return this.request(`/stats/seller/${sellerId}`);
  }

  static async getAdminStats() {
    return this.request('/stats/admin');
  }

  // ========== CONTENT ==========
  static async getContent(key) {
    return this.request(`/content/${key}`);
  }

  static async updateContent(key, data) {
    return this.request(`/content/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
}

// Export for use in frontend
if (typeof window !== 'undefined') {
  window.API = API;
}
