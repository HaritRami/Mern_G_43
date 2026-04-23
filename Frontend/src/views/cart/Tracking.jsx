import { API_URL as GLOBAL_API_URL, DOMAIN_URL as GLOBAL_DOMAIN_URL } from '../../config/apiConfig';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const trackingStyles = `
  :root {
    --track-primary: #667eea;
    --track-secondary: #764ba2;
    --track-success: #38b2ac;
    --track-bg: #f8f9fa;
    --track-text: #2d3748;
    --track-muted: #a0aec0;
    --track-border: #e2e8f0;
  }

  .tracking-container {
    background: var(--track-bg);
    min-height: calc(100vh - 80px);
    padding: 2rem 1rem;
    font-family: 'Inter', system-ui, sans-serif;
  }

  /* Animations */
  @keyframes fadeSlideUp {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulseGlow {
    0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
    100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
  }

  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  @keyframes fillLineHorizontal {
    0% { width: 0; }
    100% { width: 100%; }
  }
  
  @keyframes fillLineVertical {
    0% { height: 0; }
    100% { height: 100%; }
  }

  .animate-stagger {
    opacity: 0;
    animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .skeleton {
    background: #f6f7f8;
    background-image: linear-gradient(90deg, #f6f7f8 0px, #edeef1 40px, #f6f7f8 80px);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite linear forwards;
    border-radius: 4px;
    opacity: 0.7;
  }

  /* Cards */
  .premium-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.03);
    border: 1px solid rgba(0,0,0,0.05);
    padding: 2rem;
    margin-bottom: 1.5rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .premium-card:hover {
    box-shadow: 0 15px 35px rgba(0,0,0,0.05);
    transform: translateY(-2px);
  }

  /* Stepper UI */
  .stepper-wrapper {
    display: flex;
    justify-content: space-between;
    position: relative;
    margin: 3rem 0;
  }

  .stepper-bg-line {
    position: absolute;
    top: 24px;
    left: 10%;
    right: 10%;
    height: 3px;
    background: var(--track-border);
    z-index: 1;
  }

  .stepper-fill-line {
    position: absolute;
    top: 24px;
    left: 10%;
    height: 3px;
    background: linear-gradient(90deg, var(--track-primary), var(--track-success));
    z-index: 2;
    animation: fillLineHorizontal 1s ease-out forwards;
    transform-origin: left;
  }

  .stepper-item {
    position: relative;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 20%;
    opacity: 0;
    animation: fadeSlideUp 0.5s ease forwards;
  }

  .stepper-circle {
    width: 50px;
    height: 50px;
    background: #fff;
    border: 3px solid var(--track-border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: var(--track-muted);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 4;
  }

  .stepper-item.completed .stepper-circle {
    border-color: var(--track-success);
    background: var(--track-success);
    color: white;
  }

  .stepper-item.active .stepper-circle {
    border-color: var(--track-primary);
    color: var(--track-primary);
    animation: pulseGlow 2s infinite;
  }

  .stepper-label {
    margin-top: 1rem;
    font-weight: 600;
    color: var(--track-text);
    text-align: center;
    font-size: 0.9rem;
  }

  .stepper-date {
    font-size: 0.75rem;
    color: var(--track-muted);
    margin-top: 0.25rem;
  }

  /* Responsive Timeline */
  @media (max-width: 768px) {
    .stepper-wrapper {
      flex-direction: column;
      align-items: flex-start;
      margin: 2rem 0;
      padding-left: 2rem;
    }

    .stepper-bg-line {
      top: 5%;
      bottom: 5%;
      left: 20px;
      width: 3px;
      height: auto;
      right: auto;
    }

    .stepper-fill-line {
      top: 5%;
      left: 20px;
      width: 3px;
      animation: fillLineVertical 1s ease-out forwards;
      transform-origin: top;
    }

    .stepper-item {
      width: 100%;
      flex-direction: row;
      align-items: center;
      margin-bottom: 2rem;
    }

    .stepper-item:last-child {
      margin-bottom: 0;
    }

    .stepper-circle {
      width: 40px;
      height: 40px;
      position: absolute;
      left: -20px;
    }

    .stepper-label-wrapper {
      margin-left: 2rem;
      text-align: left;
    }
    
    .stepper-label {
      margin-top: 0;
      text-align: left;
    }
  }

  /* Product Map */
  .product-img-wrap {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    background: #f8f9fa;
  }
  
  .product-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Tracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = async (retries = 2) => {
    setLoading(true);
    setError(null);
    try {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (!savedUser || !savedUser.tokens?.accessToken) {
        toast.error('Please log in securely to access tracking.');
        navigate('/account/signin');
        return;
      }
      const authConfig = { headers: { Authorization: `Bearer ${savedUser.tokens.accessToken}` } };

      let resp;
      for (let i = 0; i <= retries; i++) {
        try {
          resp = await axios.get(`${GLOBAL_API_URL}/order/${id}`, authConfig);
          break;
        } catch (err) {
          if (i === retries) throw err;
          await new Promise(r => setTimeout(r, 1000));
        }
      }
      setOrder(resp.data);
    } catch (err) {
      console.error("Fetch tracking error:", err);
      setError("Unable to locate your order right now. It may have been relocated or network failed.");
    } finally {
      // Add slight synthetic delay to allow skeleton rendering to be visible to build trust visually
      setTimeout(() => setLoading(false), 600);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  // ── On-demand invoice download ───────────────────────────────────────
  const handleDownloadInvoice = async (orderId) => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      const token = savedUser?.tokens?.accessToken;
      if (!token) {
        toast.error('Please log in to download your invoice.');
        navigate('/account/signin');
        return;
      }
      toast.info('Preparing invoice...', { autoClose: 2000 });
      const res = await fetch(`/api/order/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('[Invoice] Download error:', e);
      toast.error('Could not download invoice. Please try again.');
    }
  };

  // Loading Skeleton Component
  const TrackingSkeleton = () => (
    <div className="container tracking-container">
      <div className="premium-card skeleton" style={{ height: '60px', marginBottom: '2rem' }}></div>
      <div className="premium-card skeleton" style={{ height: '300px' }}></div>
      <div className="premium-card skeleton" style={{ height: '200px' }}></div>
    </div>
  );

  // Error State Layout
  const TrackingError = () => (
    <div className="container tracking-container d-flex justify-content-center align-items-center">
      <div className="premium-card text-center animate-stagger" style={{ maxWidth: "500px", width: "100%" }}>
        <i className="bi bi-shield-x text-danger mb-3" style={{ fontSize: "4rem" }}></i>
        <h3 className="fw-bold text-dark">Tracking Unavailable</h3>
        <p className="text-muted">{error}</p>
        <button className="btn btn-primary fw-bold px-4 py-2 mt-3 shadow-sm rounded-pill" onClick={() => fetchOrder()}>
          <i className="bi bi-arrow-clockwise me-2"></i>Retry Connection
        </button>
      </div>
    </div>
  );

  // Empty State Layout
  const TrackingEmpty = () => (
    <div className="container tracking-container d-flex justify-content-center align-items-center">
      <div className="premium-card text-center animate-stagger" style={{ maxWidth: "500px", width: "100%" }}>
        <i className="bi bi-search text-secondary mb-3" style={{ fontSize: "4rem" }}></i>
        <h3 className="fw-bold text-dark">Order Not Found</h3>
        <p className="text-muted">We couldn't track this ID. Ensure the link is correct or you are logged into the right account.</p>
        <Link to="/" className="btn btn-primary fw-bold px-4 py-2 mt-3 shadow-sm rounded-pill">
          Go To Home
        </Link>
      </div>
    </div>
  );

  if (loading) return <> <style>{trackingStyles}</style> <TrackingSkeleton /> </>;
  if (error) return <> <style>{trackingStyles}</style> <TrackingError /> </>;
  if (!order) return <> <style>{trackingStyles}</style> <TrackingEmpty /> </>;

  // Compute logic safely
  const trackingDate = order?.trackingDate ? new Date(order.trackingDate) : null;
  const now = new Date();

  // Create Step Objects
  const steps = [
    { label: 'Order Placed', icon: 'bi-cart-check-fill', iconEmpty: 'bi-cart' },
    { label: 'Processing', icon: 'bi-box-seam-fill', iconEmpty: 'bi-box-seam' },
    { label: 'Shipped', icon: 'bi-truck', iconEmpty: 'bi-truck' },
    { label: 'Out for Delivery', icon: 'bi-signpost-fill', iconEmpty: 'bi-signpost' },
    { label: 'Delivered', icon: 'bi-house-heart-fill', iconEmpty: 'bi-house' }
  ];

  // Logic mapping against dates
  const determineStepStatus = () => {
    let completedCount = 0;

    if (order?.paymentStatus !== 'Failed' && order?.paymentStatus !== 'Cancelled') {
      completedCount = 1; // Placed
      steps[0].dateStr = new Date(order.createdAt).toLocaleDateString();
    }

    if (order?.paymentStatus === 'Completed' || order?.paymentStatus === 'COD' || order?.paymentStatus === 'Paid') {
      completedCount = 2; // Processing
    }

    if (trackingDate && now >= trackingDate) {
      completedCount = 3; // Shipped
      steps[2].dateStr = trackingDate.toLocaleDateString();
    }

    if (trackingDate && now >= new Date(trackingDate.getTime() + 1 * 24 * 60 * 60 * 1000)) {
      completedCount = 4; // Out for Delivery
    }

    if (trackingDate && now >= new Date(trackingDate.getTime() + 2 * 24 * 60 * 60 * 1000)) {
      completedCount = 5; // Delivered
      steps[4].dateStr = new Date(trackingDate.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString();
    }

    return completedCount;
  };

  const completedCount = determineStepStatus();
  // Fill length percentage for desktop mode
  const fillPercentage = completedCount <= 1 ? 0 : ((completedCount - 1) / (steps.length - 1)) * 100;

  // Destructure with fallbacks
  const productDetail = order?.productDetail || {};
  const productImages = productDetail?.images || [];
  const displayImage = productImages.length > 0
    ? (productImages[0].startsWith('http') ? productImages[0] : `${GLOBAL_DOMAIN_URL}${productImages[0]}`)
    : 'https://via.placeholder.com/80?text=No+Img';

  return (
    <div className="tracking-container">
      <style>{trackingStyles}</style>

      {/* Header section (fades in quickly) */}
      <div className="container animate-stagger" style={{ animationDelay: '0.1s' }}>
        <div className="d-flex justify-content-between align-items-center mb-4 px-2">
          <div>
            <h4 className="fw-bold mb-1" style={{ color: 'var(--track-text)' }}>Track Your Shipment</h4>
            <p className="text-muted mb-0">ID: <span className="fw-semibold text-dark">{order?.orderId || "Unknown"}</span></p>
          </div>
          {order?.orderId?.startsWith('ORD-') && (
            <button
              onClick={() => handleDownloadInvoice(order.orderId)}
              className="btn btn-outline-primary rounded-pill fw-bold"
              id="tracking-invoice-btn"
            >
              <i className="bi bi-receipt me-2"></i>Invoice
            </button>
          )}
        </div>
      </div>

      {/* Stepper Timeline Card */}
      <div className="container animate-stagger" style={{ animationDelay: '0.2s' }}>
        <div className="premium-card">
          <h5 className="fw-bold mb-1">Status: <span className="text-primary">{steps[Math.min(completedCount === 0 ? 0 : completedCount - 1, 4)]?.label}</span></h5>
          <p className="text-muted small mb-0">
            {completedCount >= 5 ? 'Your package has arrived safely!' : 'Your package is making its way to you.'}
          </p>

          <div className="stepper-wrapper">
            <div className="stepper-bg-line"></div>
            <div className="stepper-fill-line" style={{ '--fill-target': `${fillPercentage}%` }}>
              <style>{`
                    @keyframes fillLineHorizontal { 0% { width: 0; } 100% { width: ${fillPercentage}%; } }
                    @keyframes fillLineVertical { 0% { height: 0; } 100% { height: ${fillPercentage}%; } }
                 `}</style>
            </div>

            {steps.map((step, idx) => {
              const isCompleted = idx < completedCount;
              const isActive = idx === (completedCount === 0 ? 0 : completedCount - 1);

              let itemClass = "stepper-item";
              if (isCompleted && !isActive) itemClass += " completed";
              if (isActive) itemClass += " active completed";

              return (
                <div key={idx} className={itemClass} style={{ animationDelay: `${0.3 + (idx * 0.15)}s` }}>
                  <div className="stepper-circle shadow-sm">
                    <i className={`bi ${isCompleted ? step.icon : step.iconEmpty}`}></i>
                  </div>
                  <div className="stepper-label-wrapper">
                    <div className="stepper-label">{step.label}</div>
                    {step.dateStr && <div className="stepper-date d-none d-md-block text-center">{step.dateStr}</div>}
                    {step.dateStr && <div className="stepper-date d-md-none text-start">{step.dateStr}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          {/* Product Info Card */}
          <div className="col-lg-7 animate-stagger" style={{ animationDelay: '0.6s' }}>
            <div className="premium-card h-100">
              <h5 className="fw-bold mb-4 border-bottom pb-2">Item Details</h5>

              <div className="d-flex align-items-center mb-3">
                <div className="product-img-wrap me-3 border shadow-sm">
                  <img
                    src={displayImage}
                    alt={productDetail?.name || 'Product'}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Img'; }}
                  />
                </div>
                <div className="flex-grow-1">
                  <h6 className="fw-bold text-dark mb-1">{productDetail?.name || 'Product No Longer Available'}</h6>
                  <div className="text-muted small mb-2">Quantity: <span className="fw-bold text-dark">{productDetail?.quantity || 1}</span></div>
                  <h5 className="fw-bold text-success mb-0">₹{order?.totalAmt || order?.subTotalAmt || '0.00'}</h5>
                </div>
              </div>
            </div>
          </div>

          {/* Order Settings Card */}
          <div className="col-lg-5 animate-stagger mt-3 mt-lg-0" style={{ animationDelay: '0.7s' }}>
            <div className="premium-card h-100 bg-light">
              <h5 className="fw-bold mb-4 border-bottom pb-2">Order Summary</h5>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Payment Status</span>
                <span className={`fw-bold ${order?.paymentStatus === 'Completed' || order?.paymentStatus === 'COD' || order?.paymentStatus === 'Paid' ? 'text-success' : 'text-warning'}`}>
                  {order?.paymentStatus || 'Pending'}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Order Date</span>
                <span className="fw-bold text-dark">{new Date(order?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>

              {/* Only render Address Block if exists structurally safely */}
              {order?.deliveryAddress && (
                <div className="mt-4 pt-3 border-top">
                  <h6 className="fw-bold text-dark mb-2">Shipping To</h6>
                  <div className="small text-muted">
                    <div className="mb-1"><i className="bi bi-geo-alt-fill me-2"></i>{order.deliveryAddress.address_line || 'No address provided'}</div>
                    <div><i className="bi bi-telephone-fill me-2"></i>{order.deliveryAddress.mobile || 'No contact provided'}</div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Back Action */}
        <div className="mt-4 animate-stagger" style={{ animationDelay: '0.9s' }}>
          <Link to="/account/orders" className="btn btn-dark rounded-pill px-4 fw-bold shadow-sm">
            <i className="bi bi-arrow-left me-2"></i> Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
