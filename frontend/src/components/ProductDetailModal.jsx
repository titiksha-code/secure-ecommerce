import React, { useState } from 'react';
import { X, ShoppingCart, ShieldCheck, Check, Truck, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductDetailModal = ({ product, onClose }) => {
  const { addToCart, loading } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

  const defaultImages = [
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
  ];
  const imageUrl = product.imageUrl || defaultImages[(product.id || 0) % defaultImages.length];

  const handleAdd = async () => {
    const success = await addToCart(product.id, quantity);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container" 
        style={{ maxWidth: '780px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-primary">{product.categoryName || 'Product'}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>SKU: #{product.id.toString().padStart(5, '0')}</span>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-secondary btn-icon"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {/* Image */}
          <div style={{
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            background: '#0f172a',
            height: '320px',
            border: '1px solid var(--border-subtle)',
          }}>
            <img 
              src={imageUrl} 
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.src = defaultImages[0]; }}
            />
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', lineHeight: 1.25 }}>
              {product.name}
            </h2>

            <div style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--accent-cyan)',
              marginBottom: '1rem',
            }}>
              ${Number(product.price).toFixed(2)}
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {product.description || 'Enterprise grade tested merchandise featuring secure lifecycle validation and instant checkout availability.'}
            </p>

            {/* Stock status indicator */}
            <div style={{ marginBottom: '1.5rem' }}>
              {isOutOfStock ? (
                <div style={{ color: '#f43f5e', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <X size={16} /> Currently Out of Stock
                </div>
              ) : isLowStock ? (
                <div style={{ color: '#f59e0b', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} /> Low Inventory: Only {product.stockQuantity} remaining
                </div>
              ) : (
                <div style={{ color: '#10b981', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} /> In Stock ({product.stockQuantity} units available)
                </div>
              )}
            </div>

            {/* Quantity Stepper & Add Button */}
            {!isOutOfStock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px',
                }}>
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      padding: '6px 10px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 700 }}>
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= product.stockQuantity}
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      padding: '6px 10px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  disabled={loading}
                  onClick={handleAdd}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.75rem 1.25rem' }}
                >
                  <ShoppingCart size={18} />
                  <span>Add {quantity > 1 ? `(${quantity})` : ''} to Cart</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feature row */}
        <div style={{
          padding: '1rem 1.75rem',
          background: 'rgba(15, 23, 42, 0.4)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Truck size={14} color="var(--accent-cyan)" /> Fast Express Shipping
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="var(--accent-emerald)" /> Idempotent Transaction Guard
          </span>
        </div>
      </div>
    </div>
  );
};
