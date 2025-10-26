// AI Chatbot for HomeGo - Powered by Google Gemini API
// Integrates with MongoDB backend for personalized responses

class HomeGoChatbot {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.conversationHistory = [];
    this.userData = null;
    this.isOpen = false;
    
    // Role-based access control
    this.allowedRoles = options.allowedRoles || ['customer', 'seller', 'admin', 'support'];
    
    // Initialize user session
    this.initUserSession();
    
    // Check if user is authorized to use chatbot
    if (!this.isUserAuthorized()) {
      console.log('Chatbot not available for current user role');
      return;
    }
    
    // Create chatbot UI
    this.createChatbotUI();
    
    // Load conversation history from localStorage
    this.loadConversationHistory();
  }

  initUserSession() {
    const session = localStorage.getItem('userSession');
    if (session) {
      this.userData = JSON.parse(session);
    }
  }

  isUserAuthorized() {
    // If no user session, chatbot is available for guests (customers)
    if (!this.userData || !this.userData.role) {
      return this.allowedRoles.includes('customer');
    }
    
    // Check if user's role is in allowed roles
    return this.allowedRoles.includes(this.userData.role);
  }

  createChatbotUI() {
    // Create chatbot container
    const chatbotHTML = `
      <div id="homego-chatbot" class="chatbot-container">
        <!-- Chatbot Toggle Button -->
        <button id="chatbot-toggle" class="chatbot-toggle" aria-label="Toggle chat">
          <svg class="chat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <svg class="close-icon hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span class="notification-badge hidden">1</span>
        </button>

        <!-- Chatbot Window -->
        <div id="chatbot-window" class="chatbot-window hidden">
          <!-- Header -->
          <div class="chatbot-header">
            <div class="flex items-center space-x-3">
              <div class="chatbot-avatar">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
              <div>
                <h3 class="chatbot-title">HomeGo Assistant</h3>
                <p class="chatbot-status">Online</p>
              </div>
            </div>
            <button id="chatbot-close" class="chatbot-close-btn" aria-label="Close chat">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Messages Area -->
          <div id="chatbot-messages" class="chatbot-messages">
            <div class="message bot-message">
              <div class="message-avatar">🏠</div>
              <div class="message-content">
                <p>Hi ${this.userData?.name || 'there'}! 👋</p>
                <p>I'm your HomeGo assistant. I can help you with:</p>
                <ul>
                  <li>🛋️ Finding furniture</li>
                  <li>📦 Tracking orders</li>
                  <li>💰 Checking prices</li>
                  <li>❓ Answering questions</li>
                </ul>
                <p>How can I assist you today?</p>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div id="quick-actions" class="quick-actions">
            <button class="quick-action-btn" data-action="Browse products">🛋️ Browse Products</button>
            <button class="quick-action-btn" data-action="Track my order">📦 Track Order</button>
            <button class="quick-action-btn" data-action="Contact support">💬 Support</button>
          </div>

          <!-- Input Area -->
          <div class="chatbot-input-area">
            <textarea 
              id="chatbot-input" 
              class="chatbot-input" 
              placeholder="Type your message..."
              rows="1"
            ></textarea>
            <button id="chatbot-send" class="chatbot-send-btn" aria-label="Send message">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    // Inject CSS
    this.injectStyles();

    // Inject HTML
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    // Attach event listeners
    this.attachEventListeners();
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .chatbot-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .chatbot-toggle {
        position: relative;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        border: none;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .chatbot-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.6);
      }

      .chatbot-toggle svg {
        width: 28px;
        height: 28px;
        color: white;
      }

      .notification-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #ef4444;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        border: 2px solid white;
      }

      .hidden {
        display: none !important;
      }

      .chatbot-window {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 380px;
        height: 600px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .chatbot-header {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .chatbot-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .chatbot-avatar svg {
        width: 24px;
        height: 24px;
      }

      .chatbot-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
      }

      .chatbot-status {
        font-size: 12px;
        opacity: 0.9;
        margin: 0;
      }

      .chatbot-close-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .chatbot-close-btn svg {
        width: 24px;
        height: 24px;
      }

      .chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #f9fafb;
      }

      .message {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        animation: fadeIn 0.3s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
      }

      .bot-message .message-avatar {
        background: #f59e0b;
      }

      .user-message {
        flex-direction: row-reverse;
      }

      .user-message .message-avatar {
        background: #3b82f6;
        color: white;
        font-size: 14px;
      }

      .message-content {
        background: white;
        padding: 12px 16px;
        border-radius: 12px;
        max-width: 75%;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .user-message .message-content {
        background: #3b82f6;
        color: white;
      }

      .message-content p {
        margin: 0 0 8px 0;
      }

      .message-content p:last-child {
        margin-bottom: 0;
      }

      .message-content ul {
        margin: 8px 0;
        padding-left: 20px;
      }

      .message-content li {
        margin: 4px 0;
      }

      .typing-indicator {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
      }

      .typing-indicator span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #9ca3af;
        animation: typing 1.4s infinite;
      }

      .typing-indicator span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .typing-indicator span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-10px); }
      }

      .quick-actions {
        padding: 12px 16px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        border-top: 1px solid #e5e7eb;
        background: white;
      }

      .quick-action-btn {
        padding: 8px 12px;
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .quick-action-btn:hover {
        background: #f59e0b;
        color: white;
        border-color: #f59e0b;
      }

      .chatbot-input-area {
        padding: 16px;
        background: white;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 8px;
      }

      .chatbot-input {
        flex: 1;
        padding: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        font-size: 14px;
        resize: none;
        font-family: inherit;
        max-height: 100px;
      }

      .chatbot-input:focus {
        outline: none;
        border-color: #f59e0b;
      }

      .chatbot-send-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #f59e0b;
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      }

      .chatbot-send-btn:hover {
        transform: scale(1.1);
      }

      .chatbot-send-btn svg {
        width: 20px;
        height: 20px;
      }

      @media (max-width: 480px) {
        .chatbot-window {
          width: calc(100vw - 40px);
          height: calc(100vh - 100px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  attachEventListeners() {
    const toggleBtn = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chatbot-close');
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    const quickActions = document.querySelectorAll('.quick-action-btn');

    toggleBtn.addEventListener('click', () => this.toggleChat());
    closeBtn.addEventListener('click', () => this.closeChat());
    sendBtn.addEventListener('click', () => this.sendMessage());
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    quickActions.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        this.handleQuickAction(action);
      });
    });
  }

  toggleChat() {
    const window = document.getElementById('chatbot-window');
    const chatIcon = document.querySelector('.chat-icon');
    const closeIcon = document.querySelector('.close-icon');
    
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      window.classList.remove('hidden');
      chatIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');
      document.querySelector('.notification-badge')?.classList.add('hidden');
    } else {
      window.classList.add('hidden');
      chatIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
    }
  }

  closeChat() {
    this.isOpen = false;
    document.getElementById('chatbot-window').classList.add('hidden');
    document.querySelector('.chat-icon').classList.remove('hidden');
    document.querySelector('.close-icon').classList.add('hidden');
  }

  async sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to UI
    this.addMessage(message, 'user');
    
    // Clear input
    input.value = '';
    
    // Show typing indicator
    this.showTypingIndicator();
    
    try {
      // Get context from MongoDB if needed
      const context = await this.getContextFromMongoDB(message);
      
      // Generate AI response
      const response = await this.generateAIResponse(message, context);
      
      // Remove typing indicator
      this.removeTypingIndicator();
      
      // Add bot response
      this.addMessage(response, 'bot');
      
      // Save conversation
      this.saveConversation();
      
    } catch (error) {
      console.error('Chatbot error:', error);
      this.removeTypingIndicator();
      this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    }
  }

  async generateAIResponse(userMessage, context) {
    const systemPrompt = `You are HomeGo Assistant, a helpful AI assistant for the HomeGo furniture e-commerce platform.

Current user context:
- User name: ${this.userData?.name || 'Guest'}
- User type: ${this.userData?.userType || 'customer'}
- User email: ${this.userData?.email || 'Not logged in'}

Additional context from database:
${context}

Instructions:
- Be friendly, helpful, and concise
- Provide specific information about products, orders, and services
- If asked about specific products or orders, use the context provided
- For support requests, guide users appropriately
- Use emojis sparingly to keep responses professional yet friendly
- Keep responses under 150 words unless detailed information is specifically requested

User message: ${userMessage}

Provide a helpful response:`;

    const requestBody = {
      contents: [{
        parts: [{
          text: systemPrompt
        }]
      }]
    };

    const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async getContextFromMongoDB(message) {
    const lowerMessage = message.toLowerCase();
    let context = '';

    try {
      // Check if asking about products
      if (lowerMessage.includes('product') || lowerMessage.includes('furniture') || 
          lowerMessage.includes('sofa') || lowerMessage.includes('chair') || 
          lowerMessage.includes('table')) {
        const products = await API.getProducts();
        context += `\nAvailable products: ${products.slice(0, 5).map(p => `${p.name} ($${p.price})`).join(', ')}`;
      }

      // Check if asking about orders
      if (this.userData && (lowerMessage.includes('order') || lowerMessage.includes('purchase'))) {
        const orders = await API.getOrders({ customerId: this.userData.userId });
        if (orders.length > 0) {
          context += `\nUser has ${orders.length} order(s). Latest order: ${orders[0].id}, status: ${orders[0].status}`;
        }
      }

      // Check if seller asking about stats
      if (this.userData?.userType === 'seller' && (lowerMessage.includes('sales') || lowerMessage.includes('stats'))) {
        const stats = await API.getSellerStats(this.userData.userId);
        context += `\nSeller stats: ${stats.totalProducts} products, ${stats.totalOrders} orders, $${stats.totalSales} in sales`;
      }

    } catch (error) {
      console.error('Error fetching context:', error);
    }

    return context;
  }

  async handleQuickAction(action) {
    this.addMessage(action, 'user');
    this.showTypingIndicator();
    
    let response = '';
    
    try {
      if (action === 'Browse products') {
        const products = await API.getProducts();
        response = `I found ${products.length} products for you! Here are some featured items:\n\n`;
        response += products.slice(0, 3).map(p => `🛋️ ${p.name} - $${p.price}`).join('\n');
        response += '\n\nWould you like to see more or search for something specific?';
      } else if (action === 'Track my order') {
        if (this.userData) {
          const orders = await API.getOrders({ customerId: this.userData.userId });
          if (orders.length > 0) {
            response = `Your recent order:\n📦 Order ${orders[0].id}\nStatus: ${orders[0].status}\nTotal: $${orders[0].total}`;
          } else {
            response = 'You don\'t have any orders yet. Would you like to browse our products?';
          }
        } else {
          response = 'Please log in to track your orders.';
        }
      } else if (action === 'Contact support') {
        response = 'I can help you with:\n\n1. Product questions\n2. Order issues\n3. Technical support\n\nWhat do you need help with?';
      }
      
      this.removeTypingIndicator();
      this.addMessage(response, 'bot');
      
    } catch (error) {
      console.error('Quick action error:', error);
      this.removeTypingIndicator();
      this.addMessage('Sorry, I couldn\'t process that action. Please try again.', 'bot');
    }
  }

  addMessage(content, type) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const avatar = type === 'user' ? (this.userData?.name?.charAt(0) || '👤') : '🏠';
    
    const messageHTML = `
      <div class="message ${type}-message">
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
          ${content.split('\n').map(line => `<p>${line}</p>`).join('')}
        </div>
      </div>
    `;
    
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Store in conversation history
    this.conversationHistory.push({ type, content, timestamp: new Date().toISOString() });
  }

  showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages');
    const typingHTML = `
      <div class="message bot-message typing-message">
        <div class="message-avatar">🏠</div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  removeTypingIndicator() {
    const typingMessage = document.querySelector('.typing-message');
    if (typingMessage) {
      typingMessage.remove();
    }
  }

  saveConversation() {
    localStorage.setItem('chatbot_history', JSON.stringify(this.conversationHistory));
  }

  loadConversationHistory() {
    const saved = localStorage.getItem('chatbot_history');
    if (saved) {
      this.conversationHistory = JSON.parse(saved);
    }
  }
}

// Export for use in pages
if (typeof window !== 'undefined') {
  window.HomeGoChatbot = HomeGoChatbot;
}
