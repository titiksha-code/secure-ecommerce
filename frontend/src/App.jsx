import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { StorefrontPage } from './pages/StorefrontPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { CartDrawer } from './pages/CartDrawer';
import { CheckoutModal } from './pages/CheckoutModal';
import { AuthModal } from './pages/AuthModal';

function MainAppContent() {
  const [currentTab, setCurrentTab] = useState('storefront'); // 'storefront' | 'profile' | 'admin' | 'security'
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, isAdmin, openAuthModal } = useAuth();

  const handleOrderPlaced = () => {
    setCurrentTab('profile');
  };

  return (
    <div className="app-shell">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={() => setCurrentTab('storefront')}
      />

      <main className="main-content">
        {currentTab === 'storefront' && (
          <StorefrontPage searchQuery={searchQuery} />
        )}

        {currentTab === 'profile' && (
          isAuthenticated ? (
            <ProfilePage />
          ) : (
            <StorefrontPage searchQuery={searchQuery} />
          )
        )}

        {currentTab === 'admin' && (
          isAdmin ? (
            <AdminDashboard />
          ) : (
            <StorefrontPage searchQuery={searchQuery} />
          )
        )}
      </main>

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal onOrderPlaced={handleOrderPlaced} />
      <AuthModal />
      <Footer />

      {/* Stitch Mobile & Desktop Bottom Navigation Bar */}
      <nav className="stitch-bottom-nav">
        <div className="stitch-bottom-nav-inner">
          <div 
            className={`bottom-nav-item ${currentTab === 'storefront' ? 'active' : ''}`}
            onClick={() => {
              setCurrentTab('storefront');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span className="material-symbols-outlined">home</span>
            <span>Home</span>
          </div>

          <div 
            className="bottom-nav-item"
            onClick={() => {
              setCurrentTab('storefront');
              const el = document.getElementById('stitch-catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="material-symbols-outlined">grid_view</span>
            <span>Catalog</span>
          </div>

          <div 
            className="bottom-nav-item"
            onClick={() => {
              window.open('https://pleasant-learning-production-a5fd.up.railway.app/swagger-ui.html', '_blank');
            }}
          >
            <span className="material-symbols-outlined">shield_lock</span>
            <span>Security</span>
          </div>

          <div 
            className={`bottom-nav-item ${currentTab === 'profile' ? 'active' : ''}`}
            onClick={() => {
              if (isAuthenticated) {
                setCurrentTab('profile');
              } else {
                openAuthModal();
              }
            }}
          >
            <span className="material-symbols-outlined">receipt_long</span>
            <span>Orders</span>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <MainAppContent />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
