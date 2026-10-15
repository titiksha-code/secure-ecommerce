import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeItem, 
    clearCart,
    totalItemCount,
    totalAmount,
    setIsCheckoutOpen,
    loading 
  } = useCart();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const defaultImage = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&auto=format&fit=crop&q=80';

  return (
    <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '440px',
          background: '#0f172a',
          borderLeft: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1100,
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.15rem' }}>Your Cart ({totalItemCount})</h3>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="btn btn-secondary btn-icon"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Items List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          {!cart?.items || cart.items.length === 0 ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'var(--text-muted)',
              gap: '1rem',
              padding: '2rem 0',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-faint)',
              }}>
                <ShoppingBag size={28} />
              </div>
              <div>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '0.25rem' }}>Your cart is empty</h4>
                <p style={{ fontSize: '0.85rem' }}>Browse the catalog and add high-performance gear to your bag.</p>
              </div>
            </div>
          ) : (
            cart.items.map((item) => (
              <div 
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '0.85rem',
                  padding: '0.85rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  alignItems: 'center',
                }}
              >
                <img
                  src={item.productImageUrl || defaultImage}
                  alt={item.productName}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '6px',
                    objectFit: 'cover',
                    background: '#0b0f19',
                  }}
                  onError={(e) => { e.target.src = defaultImage; }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '2px',
                  }}>
                    {item.productName}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    ${Number(item.unitPrice).toFixed(2)}
                  </div>

                  {/* Quantity Stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                    }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-main)',
                          padding: '2px 6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-main)',
                          padding: '2px 6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subtotal & Delete */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-faint)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    title="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                    ${Number(item.subtotal).toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout Action */}
        {cart?.items && cart.items.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(11, 15, 25, 0.6)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <span>Subtotal</span>
              <span>${Number(totalAmount).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <span>Shipping</span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>FREE</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              fontSize: '1.2rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '0.5rem',
            }}>
              <span>Total</span>
              <span className="text-gradient">${Number(totalAmount).toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={clearCart}
                className="btn btn-secondary"
                style={{ padding: '0.75rem', fontSize: '0.82rem' }}
                title="Empty Cart"
              >
                Clear
              </button>
              <button
                onClick={handleCheckoutClick}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                <span>Checkout</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div style={{
              marginTop: '0.75rem',
              fontSize: '0.72rem',
              color: 'var(--text-faint)',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}>
              <ShieldCheck size={12} color="var(--accent-emerald)" />
              Secured with Idempotency UUID guard
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
