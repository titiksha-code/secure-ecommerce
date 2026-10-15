import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Mail, 
  Package, 
  Calendar, 
  Truck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Save
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProfilePage = () => {
  const { user, fetchCurrentUser } = useAuth();
  const { success, error } = useToast();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isSaving, setIsSaving] = useState(false);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const res = await api.getUserOrders(0, 20);
      setOrders(res.content || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
      await fetchCurrentUser();
      success('Profile updated successfully!');
    } catch (err) {
      error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="badge badge-emerald"><CheckCircle2 size={12} /> Delivered</span>;
      case 'SHIPPED':
        return <span className="badge badge-primary"><Truck size={12} /> In Transit</span>;
      case 'PROCESSING':
        return <span className="badge badge-amber"><Clock size={12} /> Processing</span>;
      case 'CANCELLED':
        return <span className="badge badge-rose"><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="badge badge-primary"><Clock size={12} /> {status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Customer Profile & Orders</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage your account information and view your real-time order history.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {/* Profile Card */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#fff',
            }}>
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>{user?.firstName} {user?.lastName}</h3>
              <span className="badge badge-primary">{user?.roles?.[0] || 'ROLE_CUSTOMER'}</span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="input-group">
              <label className="input-label">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                className="input-field"
                value={user?.email || ''}
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="input-group">
                <label className="input-label">First Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Last Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <Save size={16} />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Security & Activity Stats */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Account Security Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Authentication Mode</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent-emerald)' }}>
                  Active JWT + HttpOnly Cookie Refresh
                </div>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Total Placed Orders</div>
                <div style={{ fontWeight: 700, fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
                  {orders.length} Completed Checkout(s)
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '1rem' }}>
            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026'}
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={22} color="var(--accent-cyan)" /> Order History
        </h2>

        {loadingOrders ? (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <h3>No orders placed yet</h3>
            <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Explore the catalog and place your first secure order.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              return (
                <div 
                  key={order.id} 
                  className="glass-card"
                  style={{ overflow: 'hidden' }}
                >
                  <div 
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-cyan)' }}>
                          {order.orderNumber}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} /> {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>Total Amount</div>
                        <div style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
                          ${Number(order.totalAmount).toFixed(2)}
                        </div>
                      </div>

                      <button 
                        className="btn btn-secondary btn-icon"
                        style={{ width: '32px', height: '32px' }}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Order Details Accordion */}
                  {isExpanded && (
                    <div style={{
                      padding: '1.25rem 1.5rem',
                      background: 'rgba(15, 23, 42, 0.5)',
                      borderTop: '1px solid var(--border-subtle)',
                    }}>
                      <div style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Shipping Address:</div>
                        <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>{order.shippingAddress}</div>
                      </div>

                      {order.orderNotes && (
                        <div style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                          <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Order Notes:</div>
                          <div style={{ color: 'var(--text-main)', fontStyle: 'italic' }}>{order.orderNotes}</div>
                        </div>
                      )}

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Purchased Line Items
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {order.items?.map((item) => (
                          <div 
                            key={item.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.5rem 0.75rem',
                              background: 'rgba(255, 255, 255, 0.02)',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                            }}
                          >
                            <span>
                              <strong style={{ color: 'var(--text-main)' }}>{item.quantity}x</strong> {item.productName}
                            </span>
                            <span style={{ fontWeight: 600 }}>
                              ${Number(item.subtotal).toFixed(2)} (${Number(item.unitPrice).toFixed(2)} each)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
