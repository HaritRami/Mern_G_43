import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const confirmationStyles = `
  .success-page-wrapper {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    background: #f8f9fa;
  }
  .confirmation-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    padding: 3rem 2rem;
    max-width: 550px;
    width: 100%;
    text-align: center;
    animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes slideUpFade {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .success-icon-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
  }
  .success-icon {
    font-size: 5rem;
    color: #198754;
    animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    animation-delay: 0.2s;
    opacity: 0;
    transform: scale(0.5);
  }
  @keyframes scaleIn {
    0% { opacity: 0; transform: scale(0.5); }
    100% { opacity: 1; transform: scale(1); }
  }
  .order-total-display {
    background: rgba(25, 135, 84, 0.05);
    border: 1px dashed rgba(25, 135, 84, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1.5rem 0;
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
      <div className="success-page-wrapper">
        <div className="confirmation-card">

          <div className="success-icon-wrapper">
            <i className="bi bi-check-circle-fill success-icon"></i>
          </div>

          <h2 className="fw-bold mb-3 text-dark">Payment Successful!</h2>
          <p className="text-muted mb-4 px-md-4">
            Thank you for shopping with NexaMart! Your order has been securely processed and is being prepared for shipment.
          </p>

          <div className="order-total-display">
            <div className="row">
              <div className="col-6 text-start border-end">
                <small className="text-muted text-uppercase fw-bold d-block mb-1">Order Number</small>
                <div className="fw-bold text-dark">{order.orderId}</div>
              </div>
              <div className="col-6 text-end">
                <small className="text-muted text-uppercase fw-bold d-block mb-1">Amount Paid</small>
                <div className="fw-bold text-success fs-4">₹{order.totalAmt?.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="d-flex flex-column gap-3 mt-4">
            <Link to="/account/orders" className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm w-100 py-3">
              <i className="bi bi-box-seam me-2"></i> Track Your Order
            </Link>
            <Link to="/products" className="btn btn-outline-secondary btn-lg rounded-pill fw-bold w-100 py-3">
              <i className="bi bi-arrow-left me-2"></i> Continue Shopping
            </Link>
          </div>

          <p className="text-muted small mt-4 mb-0">
            A confirmation email will be sent to your registered email address shortly. Estimated tracking start: <span className="fw-bold text-dark">{formattedDate}</span>.
          </p>
        </div>
      </div>
    </>
  );
};

export default OrderConfirmation;
