import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  SlidersHorizontal, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  PackageSearch
} from 'lucide-react';
import { api } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';

export const StorefrontPage = ({ searchQuery }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [direction, setDirection] = useState('desc');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getProducts({
        categoryId: selectedCategory,
        keyword: searchQuery || undefined,
        page,
        size: 8,
        sortBy,
        direction,
      });
      setProducts(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, page, sortBy, direction]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSortChange = (e) => {
    const val = e.target.value;
    if (val === 'price_asc') {
      setSortBy('price');
      setDirection('asc');
    } else if (val === 'price_desc') {
      setSortBy('price');
      setDirection('desc');
    } else if (val === 'name_asc') {
      setSortBy('name');
      setDirection('asc');
    } else {
      setSortBy('createdAt');
      setDirection('desc');
    }
    setPage(0);
  };

  return (
    <div>
      {/* Hero Showcase Banner */}
      <div 
        className="glass-card" 
        style={{
          padding: '2.5rem 2rem',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.3rem 0.8rem',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#a5b4fc',
            marginBottom: '1rem',
          }}>
            <Sparkles size={14} /> Enterprise E-Commerce 2026
          </div>

          <h1 style={{
            fontSize: '2.4rem',
            lineHeight: 1.15,
            marginBottom: '0.85rem',
            letterSpacing: '-0.03em',
          }}>
            Protected Commerce, <br />
            <span className="text-gradient">Engineered for Reliability</span>
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text-muted)',
            marginBottom: '1.5rem',
            lineHeight: 1.5,
          }}>
            Experience bulletproof shopping with cryptographic idempotency, pessimistic inventory reservation, and sub-millisecond JWT authentication.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <span className="badge badge-emerald">
              <ShieldCheck size={12} /> Idempotent Checkout
            </span>
            <span className="badge badge-primary">
              <ShieldCheck size={12} /> Real-Time Stock Locking
            </span>
            <span className="badge badge-amber">
              <ShieldCheck size={12} /> Instant Refresh Rotation
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Sorting Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => { setSelectedCategory(null); setPage(0); }}
            className={`btn ${selectedCategory === null ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', borderRadius: 'var(--radius-full)' }}
          >
            All Categories ({totalElements})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setPage(0); }}
              className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', borderRadius: 'var(--radius-full)' }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SlidersHorizontal size={16} color="var(--text-faint)" />
          <select
            className="input-field"
            style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.82rem', cursor: 'pointer' }}
            onChange={handleSortChange}
            value={`${sortBy}_${direction}`}
          >
            <option value="createdAt_desc">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Product Grid / Loading / Empty */}
      {loading ? (
        <div className="products-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card" style={{ height: '360px', opacity: 0.5, animation: 'pulseGlow 1.5s infinite' }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <PackageSearch size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3>No matching products found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Try searching for another keyword or selecting "All Categories".
          </p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={setSelectedProduct}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          marginTop: '3rem',
        }}>
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="btn btn-secondary btn-icon"
          >
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="btn btn-secondary btn-icon"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Modal detail */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};
