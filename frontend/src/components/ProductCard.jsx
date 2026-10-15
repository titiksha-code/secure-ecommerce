import React from 'react';
import { ShoppingCart, Eye, AlertCircle, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product, onViewDetails }) => {
  const { addToCart, loading } = useCart();
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

  const defaultImages = [
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80'
  ];

  const imageUrl = product.imageUrl || defaultImages[(product.id || 0) % defaultImages.length];

  return (
    <div 
      className="glass-card" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(99, 102, 241, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      {/* Product Image Box */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          height: '210px',
          background: '#0f172a',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onClick={() => onViewDetails(product)}
      >
        <img
          src={imageUrl}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onError={(e) => {
            e.target.src = defaultImages[0];
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        />

        {/* Category Pill Tag */}
        {product.categoryName && (
          <span 
            className="badge badge-primary"
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backdropFilter: 'blur(8px)',
            }}
          >
            {product.categoryName}
          </span>
        )}

        {/* Stock Status Badge */}
        {isOutOfStock ? (
          <span 
            className="badge badge-rose"
            style={{ position: 'absolute', top: '12px', right: '12px' }}
          >
            Sold Out
          </span>
        ) : isLowStock ? (
          <span 
            className="badge badge-amber"
            style={{ position: 'absolute', top: '12px', right: '12px' }}
          >
            Only {product.stockQuantity} Left
          </span>
        ) : (
          <span 
            className="badge badge-emerald"
            style={{ position: 'absolute', top: '12px', right: '12px' }}
          >
            In Stock ({product.stockQuantity})
          </span>
        )}
      </div>

      {/* Content Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 
          onClick={() => onViewDetails(product)}
          style={{
            fontSize: '1.05rem',
            marginBottom: '0.4rem',
            cursor: 'pointer',
            lineHeight: 1.35,
          }}
        >
          {product.name}
        </h3>

        <p style={{
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: '1rem',
          flex: 1,
        }}>
          {product.description || 'Premium certified item built with security and high performance standards.'}
        </p>

        {/* Price & Action Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Price</div>
            <div style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-main)',
            }}>
              ${Number(product.price).toFixed(2)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => onViewDetails(product)}
              className="btn btn-secondary btn-icon"
              title="Quick View Details"
              style={{ width: '36px', height: '36px' }}
            >
              <Eye size={16} />
            </button>

            <button
              disabled={isOutOfStock || loading}
              onClick={() => addToCart(product.id, 1)}
              className={`btn ${isOutOfStock ? 'btn-secondary' : 'btn-primary'}`}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.82rem',
                opacity: isOutOfStock ? 0.5 : 1,
              }}
            >
              <ShoppingCart size={15} />
              <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
