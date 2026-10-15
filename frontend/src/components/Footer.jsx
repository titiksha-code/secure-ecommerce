import React from 'react';
import { ShieldCheck, Lock, RefreshCw, Cpu } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      background: 'rgba(11, 15, 25, 0.95)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '3rem 1.5rem 2rem',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
      }}>
        {/* Security Trust Badges Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          paddingBottom: '2.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2rem',
        }}>
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
              flexShrink: 0,
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>Pessimistic Stock Lock</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Database row locks prevent overselling during flash-sales and high concurrency.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22d3ee',
              flexShrink: 0,
            }}>
              <RefreshCw size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>Idempotent Checkout</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                UUID deduplication headers protect against double charges upon network retries.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
              flexShrink: 0,
            }}>
              <Lock size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>Hardened JWT & Cookies</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                15-minute access tokens with HttpOnly rotated refresh cookies and login throttling.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24',
              flexShrink: 0,
            }}>
              <Cpu size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>Spring Security 6</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Zero-trust RBAC architecture, SQL injection prevention, and CORS policies.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-faint)',
        }}>
          <div>
            © {new Date().getFullYear()} <strong style={{ color: 'var(--text-muted)' }}>SecureCart Inc.</strong> All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span style={{ color: 'var(--text-faint)' }}>OpenAPI Specification 3.0</span>
            <span>•</span>
            <span style={{ color: 'var(--text-faint)' }}>Flyway Versioned Schema</span>
            <span>•</span>
            <span style={{ color: 'var(--accent-emerald)' }}>Production Grade</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
