import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard, 
  Truck, 
  FileText, 
  RefreshCw, 
  PackageCheck,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api, generateIdempotencyKey } from '../api/client';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const CheckoutModal = ({ onOrderPlaced }) => {
  const { isCheckoutOpen, setIsCheckoutOpen, cart, totalAmount, fetchCart } = useCart();
  const { error, success } = useToast();

  const [shippingAddress, setShippingAddress] = useState('1240 Silicon Parkway, Suite 400, San Jose, CA 95134');
  const [orderNotes, setOrderNotes] = useState('Please leave package at the front desk with reception.');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    if (isCheckoutOpen) {
      setIdempotencyKey(generateIdempotencyKey());
      setPlacedOrder(null);
    }
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const handleRegenerateKey = () => {
    setIdempotencyKey(generateIdempotencyKey());
  };

  const handleSubmitCheckout = async (e) => {
    e.preventDefault();
    if (!shippingAddress || shippingAddress.trim().length < 5) {
      error('Please provide a valid shipping address (minimum 5 characters).');
      return;
    }

    try {
      setIsSubmitting(true);
      const order = await api.checkout(
        {
          shippingAddress: shippingAddress.trim(),
          orderNotes: orderNotes ? orderNotes.trim() : null,
        },
        idempotencyKey
      );

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'],
        });
      } catch {
        // ignore
      }

      setPlacedOrder(order);
      fetchCart();
      success(`Order placed successfully! #${order.orderNumber}`);
      if (onOrderPlaced) onOrderPlaced(order);
    } catch (err) {
      error(err.message || 'Checkout failed. Please check stock or retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !isSubmitting && setIsCheckoutOpen(false)}>
      <div 
        className="modal-container" 
        style={{ maxWidth: '620px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={22} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: '1.2rem' }}>
              {placedOrder ? 'Order Confirmed!' : 'Secure Checkout & Payment'}
            </h3>
          </div>
          {!isSubmitting && (
            <button 
              onClick={() => setIsCheckoutOpen(false)}
              className="btn btn-secondary btn-icon"
              style={{ width: '32px', height: '32px' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {placedOrder ? (
          /* Order Confirmation Screen */
          <div className="modal-body" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: 'var(--accent-emerald)',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.3)',
            }}>
              <CheckCircle2 size={40} />
            </div>

            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Thank You For Your Order!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Your order has been atomically verified against warehouse stock and processed.
            </p>

            {/* Receipt Summary Card */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '1.75rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Order Number:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{placedOrder.orderNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span className="badge badge-amber">{placedOrder.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                  ${Number(placedOrder.totalAmount).toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Shipping To:</span>
                <span style={{ color: 'var(--text-main)', maxWidth: '60%', textAlign: 'right', fontSize: '0.82rem' }}>
                  {placedOrder.shippingAddress}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              <span>Continue Shopping</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitCheckout}>
            <div className="modal-body">
              {/* Idempotency Protection Telemetry Banner */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Idempotency-Key Header Attached
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {idempotencyKey}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRegenerateKey}
                  className="btn btn-secondary btn-icon"
                  style={{ width: '28px', height: '28px', flexShrink: 0 }}
                  title="Regenerate UUID"
                >
                  <RefreshCw size={12} />
                </button>
              </div>

              {/* Order Items Preview */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem',
                marginBottom: '1.25rem',
                maxHeight: '130px',
                overflowY: 'auto',
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Items in checkout ({cart?.items?.length || 0})
                </div>
                {cart?.items?.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '3px 0' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{item.quantity}x {item.productName}</span>
                    <span style={{ fontWeight: 600 }}>${Number(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Shipping Address */}
              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Truck size={14} color="var(--accent-cyan)" />
                  Shipping Destination Address *
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  required
                  placeholder="Enter full street, apartment/suite, city, state, zip code..."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Order Notes */}
              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FileText size={14} color="var(--accent-emerald)" />
                  Delivery Instructions / Notes (Optional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Gate code, reception contact, special notes..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </div>

              {/* Mock Payment Selector */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CreditCard size={20} color="var(--accent-primary)" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Zero-Liability Mock Payment</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Card ending in •••• 4242 (Instant authorization)</div>
                  </div>
                </div>
                <span className="badge badge-emerald">Ready</span>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payable Amount</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                  ${Number(totalAmount).toFixed(2)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsCheckoutOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !cart?.items || cart.items.length === 0}
                  className="btn btn-primary"
                  style={{ minWidth: '160px' }}
                >
                  {isSubmitting ? (
                    <span>Securing Stock...</span>
                  ) : (
                    <>
                      <PackageCheck size={18} />
                      <span>Confirm & Pay</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
