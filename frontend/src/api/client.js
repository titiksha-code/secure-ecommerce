// API Client with automatic JWT handling, token refresh, and Idempotency keys

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://pleasant-learning-production-a5fd.up.railway.app') + '/api/v1';

let accessToken = localStorage.getItem('securecart_access_token') || null;

export const setAccessToken = (token) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('securecart_access_token', token);
  } else {
    localStorage.removeItem('securecart_access_token');
  }
};

export const getAccessToken = () => accessToken;

// Generate UUID v4 for Idempotency
export const generateIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

async function fetchWithAuth(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Include HttpOnly cookies (refresh token)
  };

  let response = await fetch(`${API_BASE}${endpoint}`, config);

  // If 401 Unauthorized, try refreshing access token once
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setAccessToken(data.accessToken);
        headers['Authorization'] = `Bearer ${data.accessToken}`;
        response = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers,
          credentials: 'include',
        });
      } else {
        setAccessToken(null);
      }
    } catch {
      setAccessToken(null);
    }
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: `Request failed with status ${response.status}` };
    }
    const error = new Error(errorData.message || errorData.error || 'Something went wrong');
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  refresh: () => fetchWithAuth('/auth/refresh', { method: 'POST' }),
  logout: () => fetchWithAuth('/auth/logout', { method: 'POST' }),
  getMe: () => fetchWithAuth('/auth/me', { method: 'GET' }),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.page !== undefined) query.append('page', params.page);
    if (params.size) query.append('size', params.size);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.direction) query.append('direction', params.direction);
    return fetchWithAuth(`/products?${query.toString()}`, { method: 'GET' });
  },
  getProductById: (id) => fetchWithAuth(`/products/${id}`, { method: 'GET' }),

  // Categories
  getCategories: () => fetchWithAuth('/categories', { method: 'GET' }),
  getCategoryById: (id) => fetchWithAuth(`/categories/${id}`, { method: 'GET' }),

  // Cart
  getCart: () => fetchWithAuth('/cart', { method: 'GET' }),
  addToCart: (productId, quantity = 1) => fetchWithAuth('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateCartItem: (itemId, quantity) => fetchWithAuth(`/cart/items/${itemId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
  removeCartItem: (itemId) => fetchWithAuth(`/cart/items/${itemId}`, { method: 'DELETE' }),
  clearCart: () => fetchWithAuth('/cart', { method: 'DELETE' }),

  // Orders
  checkout: (checkoutData, idempotencyKey) => {
    const headers = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    return fetchWithAuth('/orders/checkout', {
      method: 'POST',
      headers,
      body: JSON.stringify(checkoutData),
    });
  },
  getUserOrders: (page = 0, size = 10) => fetchWithAuth(`/orders?page=${page}&size=${size}`, { method: 'GET' }),

  // Profile
  getProfile: () => fetchWithAuth('/profile', { method: 'GET' }),
  updateProfile: (data) => fetchWithAuth('/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Admin
  getDashboardMetrics: () => fetchWithAuth('/admin/dashboard', { method: 'GET' }),
  getAdminProducts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.active !== undefined) query.append('active', params.active);
    if (params.page !== undefined) query.append('page', params.page);
    if (params.size) query.append('size', params.size);
    return fetchWithAuth(`/admin/products?${query.toString()}`, { method: 'GET' });
  },
  createProduct: (data) => fetchWithAuth('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => fetchWithAuth(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStock: (id, stockQuantity) => fetchWithAuth(`/admin/products/${id}/stock`, { method: 'PATCH', body: JSON.stringify({ stockQuantity }) }),
  toggleProductStatus: (id) => fetchWithAuth(`/admin/products/${id}/toggle-status`, { method: 'PATCH' }),
  
  createCategory: (data) => fetchWithAuth('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => fetchWithAuth(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getAdminOrders: (page = 0, size = 10) => fetchWithAuth(`/admin/orders?page=${page}&size=${size}`, { method: 'GET' }),
  getAdminOrderById: (id) => fetchWithAuth(`/admin/orders/${id}`, { method: 'GET' }),
  updateOrderStatus: (id, status) => fetchWithAuth(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
