import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const confirmationStyles = `
  .confirmation-header {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    color: #fff;
    padding: 2rem 0;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
  }
  .confirmation-card {
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
  }
  .confirmation-card h2 {
    margin-bottom: 1.5rem;
    color: #2d3748;
  }
  .confirmation-card p {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
  .btn-home {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    display: inline-block;
    margin-top: 1rem;
  }
`;

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('lastOrder');
    if (stored) {
      setOrder(JSON.parse(stored));
    } else {
      // nothing to show, redirect to home or cart
      navigate('/');
    }
  }, [navigate]);

  if (!order) return null;

  const formattedDate = order.trackingDate
    ? new Date(order.trackingDate).toLocaleDateString()
    : 'in a few days';

  return (
    <>
      <style>{confirmationStyles}</style>
      <div className="confirmation-header">
        <h1>Thank you for your order!</h1>
      </div>
      <div className="confirmation-card">
        <h2>Order #{order.orderId}</h2>
        <p><strong>Status:</strong> {order.paymentStatus}</p>
        <p><strong>Total:</strong> ₹{order.totalAmt?.toFixed(2)}</p>
        <p><strong>Estimated tracking start:</strong> {formattedDate}</p>
        <p>We will send you tracking details via email/SMS once your order ships.</p>
        <a className="btn-home" href="/">Continue Shopping</a>
      </div>
    </>
  );
};

export default OrderConfirmation;
