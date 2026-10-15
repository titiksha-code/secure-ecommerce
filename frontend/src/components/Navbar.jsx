import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShoppingBag, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Package, 
  Search, 
  Menu, 
  X,
  Lock
} from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentTab('storefront')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
          }}>
            <ShieldCheck size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}>
              <span>Secure</span>
              <span className="text-gradient">Cart</span>
            </div>
            <div style={{
              fontSize: '0.65rem',
              color: 'var(--accent-emerald)',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              marginTop: '-2px'
            }}>
              <Lock size={9} /> 256-Bit Encrypted
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <form 
          onSubmit={handleSearchSubmit}
          style={{
            flex: '1',
            maxWidth: '480px',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <Search 
            size={18} 
            color="var(--text-faint)" 
            style={{ position: 'absolute', left: '12px' }} 
          />
          <input
            type="text"
            placeholder="Search verified hardware, electronics, accessories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.4rem',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-main)',
              fontSize: '0.88rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </form>

        {/* Nav Links & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={() => setCurrentTab('storefront')}
            className={`btn ${currentTab === 'storefront' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Store
          </button>

          {isAdmin && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`btn ${currentTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                border: currentTab === 'admin' ? 'none' : '1px solid rgba(245, 158, 11, 0.4)',
                color: currentTab === 'admin' ? '#fff' : '#fcd34d',
              }}
            >
              <LayoutDashboard size={15} />
              Admin
            </button>
          )}

          {/* Cart Icon with badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="btn btn-secondary btn-icon"
            style={{ position: 'relative' }}
            title="Open Shopping Cart"
          >
            <ShoppingBag size={20} />
            {totalItemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--accent-primary)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
                borderRadius: '50%',
                width: '19px',
                height: '19px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(99, 102, 241, 0.8)',
              }}>
                {totalItemCount}
              </span>
            )}
          </button>

          {/* Auth Button or User Menu */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="btn btn-secondary"
                style={{
                  padding: '0.45rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  borderColor: isAdmin ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-subtle)',
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isAdmin ? 'var(--accent-amber)' : 'var(--accent-primary)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}>
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
                <span>{user?.firstName}</span>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div 
                  onClick={() => setIsUserMenuOpen(false)}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '210px',
                    background: '#111827',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '0.5rem',
                    zIndex: 200,
                  }}
                >
                  <div style={{
                    padding: '0.6rem 0.75rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: '0.4rem',
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user?.firstName} {user?.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{user?.email}</div>
                  </div>

                  <button
                    onClick={() => setCurrentTab('profile')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.55rem 0.75rem',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Package size={16} color="var(--accent-cyan)" />
                    <span>My Profile & Orders</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setCurrentTab('admin')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.55rem 0.75rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LayoutDashboard size={16} color="var(--accent-amber)" />
                      <span>Admin Management</span>
                    </button>
                  )}

                  <button
                    onClick={logout}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.55rem 0.75rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#f87171',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      marginTop: '0.25rem',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => openAuthModal('login')}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="btn btn-primary"
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
