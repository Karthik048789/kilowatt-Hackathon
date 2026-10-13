const API_BASE = '/api';

export const api = {
  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.status) query.append('status', params.status);
    if (params.syncStatus) query.append('syncStatus', params.syncStatus);
    if (params.needsAttention) query.append('needsAttention', params.needsAttention);
    
    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch products');
    const data = await res.json();
    // Handle both paginated {products, total} and flat array response shapes
    return Array.isArray(data) ? data : (data.products || []);
  },

  async getProductStats() {
    const res = await fetch(`${API_BASE}/products/stats`);
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch stats');
    return res.json();
  },

  async getProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch product');
    return res.json();
  },

  async createProduct(data) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to create product');
    return res.json();
  },

  async updateProduct(id, data) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to update product');
    return res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete product');
    return res.json();
  },

  async auditProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}/audit`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to audit product');
    return res.json();
  },

  async resetDemoData() {
    const res = await fetch(`${API_BASE}/products/reset-demo`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to reset demo catalogue');
    return res.json();
  },

  // Agent
  async runAgentChat(prompt, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);
    try {
      const res = await fetch(`${API_BASE}/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...options }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error((await res.json()).error || 'Agent run failed');
      return res.json();
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') throw new Error('Agent request timed out after 35 seconds.');
      throw err;
    }
  },

  async getProposals() {
    const res = await fetch(`${API_BASE}/agent/proposals`);
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch proposals');
    return res.json();
  },

  async approveProposal(id) {
    const res = await fetch(`${API_BASE}/agent/proposals/${id}/approve`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to approve proposal');
    return res.json();
  },

  async rejectProposal(id, reason = '') {
    const res = await fetch(`${API_BASE}/agent/proposals/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to reject proposal');
    return res.json();
  },

  async approveAllProposals() {
    const res = await fetch(`${API_BASE}/agent/proposals/approve-all`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to approve all proposals');
    return res.json();
  },

  async clearProposals() {
    const res = await fetch(`${API_BASE}/agent/proposals`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to clear proposals');
    return res.json();
  },

  // WooCommerce
  async getWooCommerceStatus() {
    const res = await fetch(`${API_BASE}/woocommerce/status`);
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to check WooCommerce status');
    return res.json();
  },

  async syncProduct(id) {
    const res = await fetch(`${API_BASE}/woocommerce/sync/${id}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to sync product');
    return res.json();
  },

  async syncAllProducts() {
    const res = await fetch(`${API_BASE}/woocommerce/sync-all`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to sync all products');
    return res.json();
  },

  async importWooCommerceProducts() {
    const res = await fetch(`${API_BASE}/woocommerce/import`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to import products');
    return res.json();
  },

  // Logs
  async getLogs(limit = 100) {
    const res = await fetch(`${API_BASE}/logs?limit=${limit}`);
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch logs');
    return res.json();
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch settings');
    return res.json();
  },

  async updateSettings(data) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to update settings');
    return res.json();
  },

  async testMongoConnection(mongoUri) {
    const res = await fetch(`${API_BASE}/settings/test-mongo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mongoUri })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'MongoDB connection test failed');
    return res.json();
  }
};
