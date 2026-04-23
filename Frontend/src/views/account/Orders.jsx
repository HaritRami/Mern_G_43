import { API_URL as GLOBAL_API_URL, DOMAIN_URL as GLOBAL_DOMAIN_URL } from '../../config/apiConfig';
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const OrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async (retries = 2) => {
    setLoading(true);
    setError(null);
    const savedUser = JSON.parse(localStorage.getItem('user'));
    
    if (!savedUser || !savedUser.tokens?.accessToken) {
      toast.error('Please login to view your orders.');
      navigate('/account/signin');
      return;
    }

    const authConfig = {
      headers: { Authorization: `Bearer ${savedUser.tokens.accessToken}` }
    };

    for (let i = 0; i <= retries; i++) {
        try {
            const resp = await axios.get(`${GLOBAL_API_URL}/order/user`, authConfig);
            if (resp.data?.success) {
                setOrders(resp.data.data || []);
                setLoading(false);
                return;
            } else {
                throw new Error("Failed to load orders");
            }
        } catch (err) {
            console.error(`Attempt ${i+1}/${retries+1} failed to fetch orders:`, err);
            if (i === retries) {
                setError(err.message || 'Network error fetching orders.');
                setLoading(false);
            } else {
                await new Promise(res => setTimeout(res, 1000));
            }
        }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ── On-demand invoice download ───────────────────────────────────────
  // Fetches PDF buffer from the backend (auth header required),
  // converts to a blob, and triggers a browser download — no pre-stored file needed.
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

  const TrackingStepper = ({ order }) => {
    // Determine Tracking Status from API payload
    const calculateSteps = () => {
        const steps = [
          { label: 'Placed', done: true, icon: 'bi-cart-check' },
          { label: 'Processing', done: false, icon: 'bi-box-seam' },
          { label: 'Shipped', done: false, icon: 'bi-truck' },
          { label: 'Delivered', done: false, icon: 'bi-house-check' },
        ];
        
        // Example Tracking Logic based on PaymentStatus/Dates
        if (order?.paymentStatus === 'Completed' || order?.paymentStatus === 'Paid' || order?.paymentStatus === 'COD') {
            steps[1].done = true;
        }

        const now = new Date();
        const trackingDate = order?.trackingDate ? new Date(order.trackingDate) : null;
        
        if (trackingDate && now >= trackingDate) {
            steps[1].done = true;
            steps[2].done = true;
        }
        
        // Simulating subsequent step timing (e.g delivered 3 days after shipping)
        if (trackingDate && now >= new Date(trackingDate.getTime() + 3*24*60*60*1000)) {
            steps[3].done = true;
        }
        
        return steps;
    };

    const steps = calculateSteps();

    return (
      <div className="mt-4 pb-2 border-top pt-3">
        <h6 className="mb-3 text-secondary">Tracking Status</h6>
        <div className="d-flex justify-content-between align-items-center position-relative w-100 px-2">
            {/* Background Line */}
            <div className="position-absolute bg-light w-100" style={{ height: "4px", top: "25%", zIndex: 0, left: 0 }}></div>
            
            {/* Active Foreground Line representing progress */}
            <div className="position-absolute bg-success" style={{ 
                height: "4px", top: "25%", zIndex: 0, left: 0, 
                width: `${(steps.filter(s => s.done).length - 1) * 33.33}%`,
                transition: "width 0.4s ease"
            }}></div>

            {steps.map((step, idx) => (
                <div key={idx} className="text-center position-relative" style={{ zIndex: 1, flex: 1 }}>
                    <div 
                        className={`rounded-circle d-flex align-items-center justify-content-center mx-auto ${step.done ? 'bg-success text-white' : 'bg-light text-secondary border'}`} 
                        style={{ width: "40px", height: "40px", transition: "all 0.3s ease" }}
                    >
                        <i className={`fs-5 bi ${step.icon}`}></i>
                    </div>
                    <div className={`mt-2 small fw-bold ${step.done ? 'text-success' : 'text-muted'}`} style={{ fontSize: "0.8rem" }}>
                        {step.label}
                    </div>
                </div>
            ))}
        </div>
      </div>
    );
  };

  // Loading State UI
  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted fw-bold">Fetching your orders safely...</p>
      </div>
    );
  }

  // Error State UI
  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger text-center p-5 rounded-4 shadow-sm" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-1 text-danger mb-3"></i>
          <h4 className="alert-heading fw-bold">Oops! Something went wrong.</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-outline-danger px-4 py-2 mt-2 fw-bold" onClick={() => fetchOrders()}>
            <i className="bi bi-arrow-clockwise me-2"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty State UI
  if (!orders || orders.length === 0) {
    return (
      <div className="container my-5 text-center p-5 rounded-4 shadow-sm bg-white border">
        <i className="bi bi-cart-x fs-1 text-secondary mb-3"></i>
        <h4 className="fw-bold">No Orders Found</h4>
        <p className="text-muted">You haven't placed any orders yet. Ready to start shopping?</p>
        <Link to="/" className="btn btn-primary px-4 py-2 mt-3 fw-bold">
          Start Shopping
        </Link>
      </div>
    );
  }

  // Main UI
  return (
    <div className="container mb-5 mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">My Orders & Tracking</h4>
        <span className="badge bg-primary fs-6">{orders.length} Orders</span>
      </div>

      <div className="row g-4">
        {orders.map((order) => {
          const productDetail = order?.productDetail || {};
          const productImages = productDetail?.images || [];
          const displayImage = productImages.length > 0 
                                ? (productImages[0].startsWith('http') ? productImages[0] : `${GLOBAL_DOMAIN_URL}${productImages[0]}`) 
                                : 'https://via.placeholder.com/150?text=No+Image';

          return (
            <div className="col-lg-6" key={order._id}>
              <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="card-header bg-light border-bottom d-flex justify-content-between align-items-center py-3">
                  <div className="small fw-bold text-secondary">
                    <i className="bi bi-hash me-1"></i>
                    {order.orderId}
                  </div>
                  <div className="small text-muted">
                    <i className="bi bi-calendar3 me-2"></i>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-4 col-sm-3 text-center">
                            <img
                            src={displayImage}
                            className="img-fluid rounded shadow-sm w-100 object-fit-cover"
                            style={{ height: "120px" }}
                            alt={productDetail?.name || "Product"}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                            />
                        </div>
                        <div className="col-8 col-sm-9 d-flex flex-column justify-content-center">
                            <h6 className="fw-bold text-dark mb-1 text-truncate">
                                {productDetail?.name || 'Product No Longer Available'}
                            </h6>
                            
                            <div className="d-flex align-items-center mt-2 small">
                                <span className="bg-light text-dark px-2 py-1 rounded me-3 border fw-semibold">
                                     Qty: {productDetail?.quantity || 1}
                                </span>
                                <span className="text-secondary fw-bold fs-6">
                                     ₹{order?.totalAmt || order?.subTotalAmt || '0.00'}
                                </span>
                            </div>

                            <div className="mt-3">
                                <span className="text-muted small me-2">Payment Status:</span>
                                <span className={`badge ${order?.paymentStatus === 'Completed' || order?.paymentStatus === 'COD' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                    {order?.paymentStatus || 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                  
                    {/* Embedded dynamic tracking bar */}
                    <TrackingStepper order={order} />

                </div>

                <div className="card-footer bg-white border-top d-flex justify-content-between py-3 px-4">
                  <div>
                    {order?.orderId?.startsWith('ORD-') && (
                      <button
                        onClick={() => handleDownloadInvoice(order.orderId)}
                        className="btn btn-outline-success btn-sm fw-bold rounded-pill px-3"
                        id={`invoice-btn-${order._id}`}
                      >
                        <i className="bi bi-receipt-cutoff me-2"></i>Download Invoice
                      </button>
                    )}
                  </div>
                  <div>
                    <Link to={`/track/${order._id}`} className="btn btn-primary btn-sm fw-bold rounded-pill px-3">
                        Full Tracking <i className="bi bi-arrow-right-short"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersView;
