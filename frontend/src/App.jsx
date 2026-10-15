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
  const [currentTab, setCurrentTab] = useState('storefront'); // 'storefront' | 'profile' | 'admin'
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, isAdmin } = useAuth();

  const handleOrderPlaced = () => {
    // Optional navigation to profile upon order placement
  };

  return (
    <div className="app-container">
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
