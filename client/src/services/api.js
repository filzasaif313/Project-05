const API_BASE = 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('stocksense_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async demoLogin(role) {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Items
  async getItems(search = '', section = 'All') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (section && section !== 'All') params.append('section', section);

    const res = await fetch(`${API_BASE}/items?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async updateItemPrice(id, sellingPrice, costPrice) {
    const res = await fetch(`${API_BASE}/items/${id}/price`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ selling_price: sellingPrice, cost_price: costPrice })
    });
    return res.json();
  },

  async updateItemDetails(id, details) {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(details)
    });
    return res.json();
  },

  // Stock
  async recordManualMovement(movementData) {
    const res = await fetch(`${API_BASE}/stock/manual`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(movementData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update stock');
    return data;
  },

  async confirmStockChange(confirmationId) {
    const res = await fetch(`${API_BASE}/stock/confirm`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ confirmationId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to confirm stock change');
    return data;
  },

  async cancelStockChange(confirmationId) {
    const res = await fetch(`${API_BASE}/stock/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ confirmationId })
    });
    return res.json();
  },

  async getMovements(itemId = '', limit = 50) {
    const params = new URLSearchParams();
    if (itemId) params.append('itemId', itemId);
    params.append('limit', limit);

    const res = await fetch(`${API_BASE}/stock/movements?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Reports (Manager only)
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/reports/analytics`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Permission denied');
    return data;
  },

  async getPriceHistory() {
    const res = await fetch(`${API_BASE}/reports/price-history`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // AI Chat & Persistent History
  async sendChatMessage(message, sessionId, simulatedFailure = false, conversationId = null) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, sessionId, simulatedFailure, conversationId })
    });
    return res.json();
  },

  async getChatConversations() {
    const res = await fetch(`${API_BASE}/chat/conversations`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async createChatConversation(title = 'New Conversation') {
    const res = await fetch(`${API_BASE}/chat/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title })
    });
    return res.json();
  },

  async getChatConversation(id) {
    const res = await fetch(`${API_BASE}/chat/conversations/${id}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async deleteChatConversation(id) {
    const res = await fetch(`${API_BASE}/chat/conversations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // System
  async getSystemStatus() {
    const res = await fetch(`${API_BASE}/system/status`);
    return res.json();
  }
};

