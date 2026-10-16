import React from 'react';

export const Footer = () => {
  return (
    <footer className="compliance-footer">
      <div className="compliance-inner">
        {/* Top Header Line */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>shield</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
              SecureCart
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-secondary)', fontSize: '12px', fontWeight: 600 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>task_alt</span>
            <span>PCI-DSS Level 1 Ready</span>
          </div>
        </div>

        {/* Technical Badges Grid */}
        <div className="tech-badges-grid">
          <div className="tech-badge-card">
            <span style={{ fontSize: '10px', color: 'var(--color-on-surface-variant)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              OpenAPI
            </span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-on-surface)', fontFamily: 'var(--font-mono)' }}>
              v3.0.3 Spec
            </span>
          </div>

          <div className="tech-badge-card">
            <span style={{ fontSize: '10px', color: 'var(--color-on-surface-variant)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Flyway DB
            </span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-on-surface)', fontFamily: 'var(--font-mono)' }}>
              Schema V14
            </span>
          </div>

          <div className="tech-badge-card">
            <span style={{ fontSize: '10px', color: 'var(--color-on-surface-variant)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Status
            </span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}>
              Production
            </span>
          </div>
        </div>

        {/* Bottom Technical Session Tracker */}
        <div style={{
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--color-surface-container)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          textAlign: 'center',
          fontSize: '11px',
          color: 'var(--color-on-surface-variant)'
        }}>
          <span>© 2026 SecureCart Inc. Cryptographic store architecture.</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-outline)' }}>
            Deterministic UUID session: d94f-281b-cc02
          </span>
        </div>
      </div>
    </footer>
  );
};
