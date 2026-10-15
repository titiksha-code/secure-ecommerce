import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Check, 
  X, 
  Layers, 
  Package, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export const AdminDashboard = () => {
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics' | 'products' | 'categories' | 'orders'
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Products state
  const [adminProducts, setAdminProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // New/Edit Product Form
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');

  // Category State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Orders State
  const [adminOrders, setAdminOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoadingMetrics(true);
      const data = await api.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics', err);
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
      if (data.length > 0 && !prodCategoryId) {
        setProdCategoryId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }, [prodCategoryId]);

  const fetchAdminProducts = useCallback(async () => {
    try {
      const data = await api.getAdminProducts({ size: 50 });
      setAdminProducts(data.content || []);
    } catch (err) {
      console.error('Failed to load admin products', err);
    }
  }, []);

  const fetchAdminOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const data = await api.getAdminOrders(0, 50);
      setAdminOrders(data.content || []);
    } catch (err) {
      console.error('Failed to load admin orders', err);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    fetchCategories();
    fetchAdminProducts();
    fetchAdminOrders();
  }, [fetchMetrics, fetchCategories, fetchAdminProducts, fetchAdminOrders]);

  const handleCreateOrUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: prodName.trim(),
        description: prodDesc ? prodDesc.trim() : '',
        price: parseFloat(prodPrice),
        stockQuantity: parseInt(prodStock, 10),
        categoryId: parseInt(prodCategoryId, 10),
        imageUrl: prodImageUrl ? prodImageUrl.trim() : null,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, {
          ...payload,
          active: editingProduct.active,
        });
        success('Product updated successfully!');
      } else {
        await api.createProduct(payload);
        success('New product added to catalog!');
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
      fetchAdminProducts();
      fetchMetrics();
    } catch (err) {
      error(err.message || 'Failed to save product');
    }
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdDesc(prod.description || '');
    setProdPrice(prod.price);
    setProdStock(prod.stockQuantity);
    setProdCategoryId(prod.categoryId || (categories[0]?.id || ''));
    setProdImageUrl(prod.imageUrl || '');
    setIsProductModalOpen(true);
  };

  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdStock(10);
    setProdCategoryId(categories[0]?.id || '');
    setProdImageUrl('');
    setIsProductModalOpen(true);
  };

  const handleToggleProductStatus = async (id) => {
    try {
      await api.toggleProductStatus(id);
      success('Product status updated');
      fetchAdminProducts();
    } catch (err) {
      error(err.message || 'Failed to toggle status');
    }
  };

  const handleStockAdjust = async (id, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      await api.updateStock(id, newStock);
      success(`Stock updated to ${newStock}`);
      fetchAdminProducts();
      fetchMetrics();
    } catch (err) {
      error(err.message || 'Failed to update stock');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.createCategory({ name: catName.trim(), description: catDesc.trim() });
      success('Category created successfully!');
      setCatName('');
      setCatDesc('');
      setIsCatModalOpen(false);
      fetchCategories();
    } catch (err) {
      error(err.message || 'Failed to create category');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      success(`Order status updated to ${newStatus}`);
      fetchAdminOrders();
      fetchMetrics();
    } catch (err) {
      error(err.message || 'Failed to transition order status');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <LayoutDashboard size={28} color="var(--accent-amber)" /> Admin Control Center
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Live enterprise operations telemetry, inventory locking, and order processing.
          </p>
        </div>

        <button
          onClick={() => { fetchMetrics(); fetchAdminProducts(); fetchAdminOrders(); }}
          className="btn btn-secondary"
          style={{ gap: '0.5rem' }}
        >
          <RefreshCw size={15} /> Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '2rem',
      }}>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`btn ${activeTab === 'metrics' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: 'none' }}
        >
          <DollarSign size={16} /> Overview & Telemetry
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: 'none' }}
        >
          <Package size={16} /> Products & Inventory ({adminProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: 'none' }}
        >
          <Layers size={16} /> Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: 'none' }}
        >
          <ShoppingBag size={16} /> Customer Orders ({adminOrders.length})
        </button>
      </div>

      {/* TAB 1: METRICS */}
      {activeTab === 'metrics' && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}>
            {/* Total Revenue */}
            <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-emerald)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Revenue</span>
                <DollarSign size={20} color="var(--accent-emerald)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                ${Number(metrics?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
                Verified captured volume
              </div>
            </div>

            {/* Total Orders */}
            <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Orders</span>
                <ShoppingBag size={20} color="var(--accent-primary)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                {metrics?.totalOrders || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
                {metrics?.pendingOrders || 0} currently processing
              </div>
            </div>

            {/* Total Customers */}
            <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Registered Users</span>
                <Users size={20} color="var(--accent-cyan)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                {metrics?.totalCustomers || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '0.25rem' }}>
                Customers & Admins
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-amber)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Low Stock Alert</span>
                <AlertTriangle size={20} color="var(--accent-amber)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: metrics?.lowStockCount > 0 ? '#f59e0b' : 'inherit' }}>
                {metrics?.lowStockCount || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '0.25rem' }}>
                Products with ≤ 5 units left
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Inventory & Catalog Management</h3>
            <button onClick={handleOpenNewProduct} className="btn btn-primary" style={{ gap: '0.4rem' }}>
              <Plus size={16} /> Add New Product
            </button>
          </div>

          <div className="glass-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '1rem' }}>Product</th>
                  <th style={{ padding: '1rem' }}>Category</th>
                  <th style={{ padding: '1rem' }}>Price</th>
                  <th style={{ padding: '1rem' }}>Stock Quantity</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminProducts.map((prod) => (
                  <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img 
                          src={prod.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100'} 
                          alt="" 
                          style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} 
                        />
                        <div>
                          <div>{prod.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>ID: #{prod.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{prod.categoryName}</td>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>${Number(prod.price).toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleStockAdjust(prod.id, prod.stockQuantity, -1)}
                          className="btn btn-secondary"
                          style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                        >
                          -1
                        </button>
                        <span style={{
                          fontWeight: 700,
                          minWidth: '28px',
                          textAlign: 'center',
                          color: prod.stockQuantity <= 5 ? 'var(--accent-amber)' : 'inherit',
                        }}>
                          {prod.stockQuantity}
                        </span>
                        <button
                          onClick={() => handleStockAdjust(prod.id, prod.stockQuantity, 5)}
                          className="btn btn-secondary"
                          style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                        >
                          +5
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => handleToggleProductStatus(prod.id)}
                        className={`badge ${prod.active ? 'badge-emerald' : 'badge-rose'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle active status"
                      >
                        {prod.active ? 'Active' : 'Archived'}
                      </button>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="btn btn-secondary btn-icon"
                        style={{ width: '30px', height: '30px' }}
                        title="Edit product"
                      >
                        <Edit size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {activeTab === 'categories' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Store Categories</h3>
            <button onClick={() => setIsCatModalOpen(true)} className="btn btn-primary" style={{ gap: '0.4rem' }}>
              <Plus size={16} /> New Category
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {categories.map((cat) => (
              <div key={cat.id} className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1.1rem' }}>{cat.name}</h4>
                  <span className="badge badge-primary">ID #{cat.id}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {cat.description || 'No description provided.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS */}
      {activeTab === 'orders' && (
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>All System Orders</h3>
          <div className="glass-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '1rem' }}>Order #</th>
                  <th style={{ padding: '1rem' }}>Customer</th>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Amount</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Transition State</th>
                </tr>
              </thead>
              <tbody>
                {adminOrders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {ord.orderNumber}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>{ord.userEmail || `User #${ord.userId}`}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ord.shippingAddress}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 800 }}>${Number(ord.totalAmount).toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${ord.status === 'DELIVERED' ? 'badge-emerald' : ord.status === 'CANCELLED' ? 'badge-rose' : 'badge-amber'}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="input-field"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', width: 'auto', cursor: 'pointer' }}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Product */}
      {isProductModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Catalog Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdateProduct}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="input-label">Product Name *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. YubiKey 5C NFC Security Key"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Category *</label>
                  <select
                    className="input-field"
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="input-group">
                    <label className="input-label">Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0.01"
                      className="input-field"
                      placeholder="49.99"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="input-field"
                      placeholder="25"
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Image URL (Optional)</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://images.unsplash.com/..."
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Description (Optional)</label>
                  <textarea
                    rows={3}
                    className="input-field"
                    placeholder="Provide technical specifications and features..."
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Save Updates' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Category */}
      {isCatModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCatModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Category</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateCategory}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="input-label">Category Name *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Biometric Hardware"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Description (Optional)</label>
                  <textarea
                    rows={3}
                    className="input-field"
                    placeholder="Category overview..."
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsCatModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
