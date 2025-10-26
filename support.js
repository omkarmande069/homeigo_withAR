// Support Ticket Management System
class SupportTicketManager {
  constructor() {
    this.tickets = this.loadTickets();
  }

  loadTickets() {
    return JSON.parse(localStorage.getItem('supportTickets') || '[]');
  }

  saveTickets() {
    localStorage.setItem('supportTickets', JSON.stringify(this.tickets));
  }

  createTicket(data) {
    const ticket = {
      id: 'TKT-' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase(),
      subject: data.subject,
      message: data.message,
      userType: data.userType, // 'customer' or 'seller'
      userName: data.userName,
      userEmail: data.userEmail,
      status: 'open', // 'open', 'in-progress', 'resolved', 'closed'
      priority: data.priority || 'medium', // 'low', 'medium', 'high', 'urgent'
      category: data.category || 'general',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: []
    };
    this.tickets.unshift(ticket);
    this.saveTickets();
    return ticket;
  }

  getTicketById(id) {
    return this.tickets.find(t => t.id === id);
  }

  getTicketsByUser(userEmail) {
    return this.tickets.filter(t => t.userEmail === userEmail);
  }

  getTicketsByType(userType) {
    return this.tickets.filter(t => t.userType === userType);
  }

  getTicketsByStatus(status) {
    return this.tickets.filter(t => t.status === status);
  }

  updateTicketStatus(ticketId, status) {
    const ticket = this.getTicketById(ticketId);
    if (ticket) {
      ticket.status = status;
      ticket.updatedAt = new Date().toISOString();
      this.saveTickets();
      return true;
    }
    return false;
  }

  addResponse(ticketId, response) {
    const ticket = this.getTicketById(ticketId);
    if (ticket) {
      ticket.responses.push({
        message: response.message,
        responderName: response.responderName,
        responderType: response.responderType, // 'admin' or 'user'
        timestamp: new Date().toISOString()
      });
      ticket.updatedAt = new Date().toISOString();
      this.saveTickets();
      return true;
    }
    return false;
  }

  deleteTicket(ticketId) {
    const index = this.tickets.findIndex(t => t.id === ticketId);
    if (index !== -1) {
      this.tickets.splice(index, 1);
      this.saveTickets();
      return true;
    }
    return false;
  }

  getStatistics() {
    return {
      total: this.tickets.length,
      open: this.tickets.filter(t => t.status === 'open').length,
      inProgress: this.tickets.filter(t => t.status === 'in-progress').length,
      resolved: this.tickets.filter(t => t.status === 'resolved').length,
      closed: this.tickets.filter(t => t.status === 'closed').length,
      byUserType: {
        customer: this.tickets.filter(t => t.userType === 'customer').length,
        seller: this.tickets.filter(t => t.userType === 'seller').length
      }
    };
  }
}

// Initialize global support manager
if (typeof window !== 'undefined') {
  window.supportTicketManager = new SupportTicketManager();
}
