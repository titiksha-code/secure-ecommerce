import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = ({ 
  currentTab, 
  setCurrentTab, 
  searchQuery, 
  setSearchQuery, 
  onSearch 
}) => {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const { totalItemCount, setIsCartOpen } = useCart();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <header className="stitch-header">
      <div className="stitch-header-inner">
        {/* Brand Logo & Title */}
        <div 
          onClick={() => setCurrentTab('storefront')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-surface-container)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>verified_user</span>
          </div>
          <div>
            <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-on-surface)', letterSpacing: '-0.02em' }}>
              Secure<span style={{ color: 'var(--color-primary)' }}>Cart</span>
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ flex: 1, maxWidth: '420px', display: 'flex', alignItems: 'center' }}>
          <form onSubmit={handleSearchSubmit} style={{ width: '100%', position: 'relative' }}>
            <span 
              className="material-symbols-outlined" 
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: 'var(--color-on-surface-variant)',
                pointerEvents: 'none'
              }}
            >
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search verified hardware, appliances, keys..."
              style={{
                width: '100%',
                height: '38px',
                padding: '0 0.85rem 0 2.2rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-container-low)',
                border: '1px solid var(--color-surface-container)',
                color: 'var(--color-on-surface)',
                fontSize: '13px',
                outline: 'none',
                transition: 'all 0.15s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-surface-container)'}
            />
          </form>
        </div>

        {/* Right Actions Cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Cart Icon with Live Count Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Shopping cart"
            style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'transparent',
              color: 'var(--color-on-surface-variant)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-container)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>shopping_bag</span>
            {totalItemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'var(--color-secondary)',
                color: 'var(--color-on-secondary)',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {totalItemCount}
              </span>
            )}
          </button>

          {/* User Account Button & Dropdown */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                {user?.firstName ? user.firstName[0].toUpperCase() : <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>}
              </button>

              {isUserMenuOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '44px',
                  width: '200px',
                  background: 'var(--color-surface-container-lowest)',
                  border: '1px solid var(--color-surface-container)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  padding: '0.4rem',
                  zIndex: 200
                }}>
                  <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--color-surface-container)' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-on-surface)' }}>
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', truncate: true }}>
                      {user?.email}
                    </p>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => { setCurrentTab('admin'); setIsUserMenuOpen(false); }}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '12px',
                        color: 'var(--color-on-surface)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-container)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>admin_panel_settings</span>
                      Admin Dashboard
                    </button>
                  )}

                  <button
                    onClick={() => { setCurrentTab('profile'); setIsUserMenuOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '12px',
                      color: 'var(--color-on-surface)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-container)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>receipt_long</span>
                    Order History
                  </button>

                  <button
                    onClick={() => { logout(); setIsUserMenuOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '12px',
                      color: 'var(--color-outline)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      borderTop: '1px solid var(--color-surface-container)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-container)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              style={{
                height: '36px',
                padding: '0 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary-container)',
                color: 'var(--color-on-primary)',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>login</span>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
