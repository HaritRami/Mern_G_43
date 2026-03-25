import { API_URL as GLOBAL_API_URL } from '../../config/apiConfig';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

const checkoutStyles = `
  .checkout-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem 0;
    margin-bottom: 2rem;
    color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .checkout-title {
    font-size: 2rem;
    font-weight: 600;
    margin: 0;
  }

  .form-card {
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    margin-bottom: 1.5rem;
    border: none;
  }

  .form-card .card-header {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    padding: 1rem;
    font-weight: 600;
    color: #2d3748;
    border-radius: 12px 12px 0 0;
  }

  .form-card .card-header i {
    color: #4a5568;
    margin-right: 0.5rem;
  }

  .form-control, .form-select {
    border-radius: 8px;
    padding: 0.75rem;
    border-color: #e2e8f0;
    transition: all 0.2s ease;
  }

  .form-control:focus, .form-select:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .payment-card {
    border-color: #4299e1 !important;
  }

  .payment-card .card-header {
    background: #ebf8ff !important;
    border-bottom-color: #4299e1 !important;
    color: #2b6cb0;
  }

  .payment-method {
    padding: 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .payment-method:hover {
    border-color: #4299e1;
    background: #f7fafc;
  }

  .payment-method.selected {
    border-color: #4299e1;
    background: #ebf8ff;
  }

  .cart-summary {
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 1rem;
  }

  .cart-summary .card-header {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    font-weight: 600;
    color: #2d3748;
  }

  .cart-item {
    padding: 1rem 0;
    border-bottom: 1px solid #e2e8f0;
  }

  .cart-item:last-child {
    border-bottom: none;
  }

  .pay-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 1rem;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .pay-button:hover {
    opacity: 0.95;
    transform: translateY(-1px);
  }

  .pay-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const CheckoutView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address_line: '',
    city: '',
    state: '',
    country: '',
    mobile: ''
  });
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    paymentMethod: 'razorpay'
  });

  useEffect(() => {
    fetchCartItems();
    fetchAddresses();
    
    // Auto-fill user identity securely
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      if (!savedUser.mobile) {
        toast.error("Please add a mobile number in your profile before checking out.");
        navigate('/account/profile');
      } else {
        setFormData(prev => ({
          ...prev,
          email: savedUser.email || '',
          mobile: savedUser.mobile || ''
        }));
      }
    } else {
      toast.error('Session expired. Please login again');
      navigate('/account/signin');
    }
  }, []);

  const fetchAddresses = async () => {
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;
      const savedUser = JSON.parse(localStorage.getItem("user"));
      const response = await axios.get(`${GLOBAL_API_URL}/address/user/${savedUser.id}`, authConfig);
      if (response.data.success) {
        setAddresses(response.data.data);
        if (response.data.data.length === 0) {
          setShowAddressForm(true);
        } else {
          const defaultAddr = response.data.data.find(a => a.isDefault);
          setSelectedAddressId(defaultAddr ? defaultAddr._id : response.data.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const authConfig = getAuthConfig();
      const savedUser = JSON.parse(localStorage.getItem("user"));
      const response = await axios.post(`${GLOBAL_API_URL}/address`, {
        ...newAddress, user: savedUser.id
      }, authConfig);
      if (response.data.success) {
        toast.success('Address added successfully!');
        setNewAddress({ address_line: '', city: '', state: '', country: '', mobile: '' });
        setShowAddressForm(false);
        fetchAddresses();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding address');
    } finally {
      setLoading(false);
    }
  };

  const getAuthConfig = () => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser || !savedUser.tokens?.accessToken) {
      toast.error('Please login to proceed with checkout');
      navigate('/account/signin');
      return null;
    }
    return {
      headers: {
        "Authorization": `Bearer ${savedUser.tokens.accessToken}`
      }
    };
  };

  const fetchCartItems = async () => {
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const savedUser = JSON.parse(localStorage.getItem("user"));
      const userId = savedUser.id;

      const response = await axios.get(
        `${GLOBAL_API_URL}/cart/${userId}/cart`,
        authConfig
      );

      if (response.data.success) {
        setCartItems(response.data.data);
        setTotalPrice(response.data.cartTotals.totalPrice);
        setDiscount(response.data.cartTotals.totalDiscount);
      } else {
        toast.error(response.data.message || 'Error loading cart items');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/account/signin');
      } else {
        toast.error(error.response?.data?.message || 'Error loading cart items');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // If sameAsBilling is checked, copy shipping details to billing
    if (name === 'sameAsBilling' && checked) {
      setFormData(prev => ({
        ...prev,
        billingName: prev.shippingName,
        billingAddress1: prev.shippingAddress1,
        billingAddress2: prev.shippingAddress2,
        billingCountry: prev.shippingCountry,
        billingState: prev.shippingState,
        billingZip: prev.shippingZip
      }));
    }
  };

  const applyCoupon = async () => {
    if (!couponCodeInput) return;
    setLoading(true);
    try {
      const authConfig = getAuthConfig();
      const res = await axios.post(`${GLOBAL_API_URL}/coupon/validate`, {
        code: couponCodeInput,
        cartTotal: totalPrice
      }, authConfig);
      
      if (res.data.success) {
        setAppliedCouponCode(res.data.data.code);
        setCouponDiscount(res.data.data.discountAmount);
        toast.success(res.data.message || 'Coupon applied!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon');
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCouponCode('');
    setCouponDiscount(0);
    setCouponCodeInput('');
    toast.info('Coupon removed');
  };

  const axiosRetry = async (url, payload, config, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
        try {
            return await axios.post(url, payload, config);
        } catch (error) {
            if (i === retries) throw error;
            console.warn(`Retrying API call to ${url} (${i + 1}/${retries})...`);
            // wait 1000ms before retrying
            await new Promise(res => setTimeout(res, 1000));
        }
    }
  };

  const handleRazorpay = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const amount = totalPrice - (discount + couponDiscount);

      const { data } = await axios.post(`${GLOBAL_API_URL}/payment/razor/create-order`, {
        amount
      }, authConfig);

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: "INR",
        name: "NextMart Store",
        description: "Order Payment",
        order_id: data.order.id,
        handler: async function (response) {
          toast.success("Payment Successful!");
          setLoading(true);
          try {
            const savedUser = JSON.parse(localStorage.getItem("user"));
            const addr = addresses.find(a => a._id === selectedAddressId);
            const deliveryAddress = {
              address_line: addr.address_line,
              city: addr.city,
              state: addr.state,
              country: addr.country,
              mobile: addr.mobile
            };

            const checkoutPayload = {
              cartItems,
              paymentId: response.razorpay_payment_id,
              paymentStatus: "PAID",
              deliveryAddress,
              subTotalAmt: totalPrice,
              totalAmt: amount,
              discount: discount + couponDiscount,
              couponCode: appliedCouponCode,
              email: formData.email,
              mobile: formData.mobile
            };

            const resData = await axiosRetry(`${GLOBAL_API_URL}/order/checkout`, checkoutPayload, authConfig);
            
            if (!resData.data.success) {
               throw new Error(resData.data.message || "Failed to process checkout");
            }

            setCartItems([]);
            // show Swal and then redirect
            await Swal.fire({
              icon: 'success',
              title: 'Order placed successfully!',
              text: 'Redirecting to tracking page...',
              timer: 2000,
              showConfirmButton: false
            });
            const masterOrder = resData.data.data.orders[0];
            navigate(`/track/${masterOrder?._id}`);
          } catch (err) {
            console.error('Error saving order', err);
            toast.error(err.response?.data?.message || err.message || "Error confirming order on server");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          email: formData.email,
          contact: formData.mobile
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error('Razorpay order error', error.response || error);
      toast.error(
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        "Payment Failed"
      );
      setLoading(false); // only disable loader if failing before Razorpay opens
    }
  };

  const handleCod = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;
      const savedUser = JSON.parse(localStorage.getItem("user"));
      const addr = addresses.find(a => a._id === selectedAddressId);
      const deliveryAddress = {
        address_line: addr.address_line,
        city: addr.city,
        state: addr.state,
        country: addr.country,
        mobile: addr.mobile
      };

      const checkoutPayload = {
        cartItems,
        paymentStatus: "COD",
        deliveryAddress,
        subTotalAmt: totalPrice,
        totalAmt: totalPrice - (discount + couponDiscount),
        discount: discount + couponDiscount,
        couponCode: appliedCouponCode,
        email: formData.email,
        mobile: formData.mobile
      };

      const resData = await axiosRetry(`${GLOBAL_API_URL}/order/checkout`, checkoutPayload, authConfig);
      
      if (!resData.data.success) {
         throw new Error(resData.data.message || "Failed to place order");
      }

      setCartItems([]);
      // show Swal then redirect
      await Swal.fire({
        icon: 'success',
        title: 'Order placed successfully!',
        text: 'Redirecting to tracking page...',
        timer: 2000,
        showConfirmButton: false
      });
      const masterOrder = resData.data.data.orders[0];
      navigate(`/track/${masterOrder?._id}`);

    } catch (error) {
      console.error('COD order error', error.response || error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to place order"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error('Your cart is empty. Please add items to proceed.');
      return;
    }
    if (!selectedAddressId) {
      toast.error('Please select or add a delivery address first.');
      return;
    }
    if (formData.paymentMethod === 'cod') {
      handleCod(e);
    } else {
      handleRazorpay(e);
    }
  };


  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Processing checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{checkoutStyles}</style>
      <ToastContainer />
      
      <div className="checkout-header">
        <div className="container">
          <h1 className="checkout-title">Checkout</h1>
        </div>
      </div>

      <div className="container mb-5">
        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            <div className="col-lg-8">
              {/* Contact Information */}
              <div className="card form-card">
                <div className="card-header">
                  <i className="bi bi-envelope"></i> Contact Information
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted small mb-1">Authenticated Email</label>
                      <input
                        type="email"
                        className="form-control bg-light"
                        name="email"
                        value={formData.email}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small mb-1">Authenticated Mobile</label>
                      <input
                        type="tel"
                        className="form-control bg-light"
                        name="mobile"
                        value={formData.mobile}
                        readOnly
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="card form-card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div><i className="bi bi-truck"></i> Delivery Address</div>
                  {!showAddressForm && (
                     <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setShowAddressForm(true)}>
                       + Add New Address
                     </button>
                  )}
                </div>
                <div className="card-body">
                  {showAddressForm ? (
                    <div className="bg-light p-3 rounded border">
                      <h5 className="mb-3">Add New Address</h5>
                      <div className="row g-3">
                        <div className="col-12">
                          <input type="text" className="form-control" placeholder="Address Line" value={newAddress.address_line} onChange={(e) => setNewAddress({...newAddress, address_line: e.target.value})} />
                        </div>
                        <div className="col-md-6">
                          <input type="text" className="form-control" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} />
                        </div>
                        <div className="col-md-6">
                          <input type="text" className="form-control" placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} />
                        </div>
                        <div className="col-md-6">
                          <input type="text" className="form-control" placeholder="Country" value={newAddress.country} onChange={(e) => setNewAddress({...newAddress, country: e.target.value})} />
                        </div>
                        <div className="col-md-6">
                          <input type="tel" className="form-control" placeholder="Mobile" value={newAddress.mobile} onChange={(e) => setNewAddress({...newAddress, mobile: e.target.value})} />
                        </div>
                        <div className="col-12 mt-3">
                          <button type="button" className="btn btn-primary me-2" onClick={handleAddNewAddress} disabled={!newAddress.address_line || !newAddress.city || !newAddress.state || !newAddress.country || !newAddress.mobile}>Save Address</button>
                          {addresses.length > 0 && (
                            <button type="button" className="btn btn-secondary" onClick={() => setShowAddressForm(false)}>Cancel</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {addresses.map(addr => (
                        <div key={addr._id} className="col-12">
                          <div className={`p-3 border rounded ${selectedAddressId === addr._id ? 'border-primary bg-primary bg-opacity-10' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setSelectedAddressId(addr._id)}>
                            <div className="form-check">
                              <input type="radio" className="form-check-input" checked={selectedAddressId === addr._id} readOnly />
                              <label className="form-check-label w-100">
                                <div className="d-flex justify-content-between">
                                  <strong>{addr.address_line}</strong>
                                  {addr.isDefault && <span className="badge bg-success">Default</span>}
                                </div>
                                <div>{addr.city}, {addr.state}, {addr.country}</div>
                                <div><i className="bi bi-telephone"></i> {addr.mobile}</div>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="card form-card payment-card">
                <div className="card-header">
                  <i className="bi bi-credit-card"></i> Payment Method
                </div>
                <div className="card-body">
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <div 
                        className={`payment-method ${formData.paymentMethod === 'razorpay' ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'razorpay' }))}
                      >
                        <div className="form-check">
                          <input
                            type="radio"
                            className="form-check-input"
                            name="paymentMethod"
                            value="razorpay"
                            checked={formData.paymentMethod === 'razorpay'}
                            onChange={handleInputChange}
                            required
                          />
                          <label className="form-check-label">
                            Razorpay
                            <img
                              src="../../images/payment/cards.webp"
                              alt="Razorpay"
                              className="ms-2"
                              height={24}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div 
                        className={`payment-method ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cod' }))}
                      >
                        <div className="form-check">
                          <input
                            type="radio"
                            className="form-check-input"
                            name="paymentMethod"
                            value="cod"
                            checked={formData.paymentMethod === 'cod'}
                            onChange={handleInputChange}
                            required
                          />
                          <label className="form-check-label">
                            Cash on Delivery
                            <i className="bi bi-cash-stack ms-2"></i>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* no extra fields for razorpay at this step */}

                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="col-lg-4">
              <div className="card cart-summary">
                <div className="card-header">
                  <i className="bi bi-cart3"></i> Order Summary
                  <span className="badge bg-primary float-end">
                    {cartItems.length} items
                  </span>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {cartItems.map((item) => (
                      <div key={item._id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="my-0">{item?.productId?.name || 'Unknown Product'}</h6>
                            <small className="text-muted">
                              Quantity: {item?.quantity || 1}
                            </small>
                          </div>
                          <span className="text-muted">
                            ${((item?.productId?.price || 0) * (item?.quantity || 1)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}

                    <div className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <span>Subtotal</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="list-group-item p-3 bg-light">
                      <div className="input-group">
                        <input type="text" className="form-control" placeholder="Enter Coupon Code" value={couponCodeInput} onChange={(e) => setCouponCodeInput(e.target.value)} disabled={appliedCouponCode} />
                        {appliedCouponCode ? (
                          <button className="btn btn-outline-danger" type="button" onClick={removeCoupon}>Remove</button>
                        ) : (
                          <button className="btn btn-primary" type="button" onClick={applyCoupon} disabled={!couponCodeInput || loading}>Apply</button>
                        )}
                      </div>
                    </div>

                    {couponDiscount > 0 && (
                      <div className="list-group-item">
                        <div className="d-flex justify-content-between text-success">
                          <span>Coupon Discount ({appliedCouponCode})</span>
                          <span>-${couponDiscount.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {discount > 0 && (
                      <div className="list-group-item">
                        <div className="d-flex justify-content-between text-success">
                          <span>Discount</span>
                          <span>-${discount.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    <div className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                    </div>

                    <div className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <strong>Total</strong>
                        <strong>${(totalPrice - (discount + couponDiscount)).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                {formData.paymentMethod === 'cod' && selectedAddressId && addresses.find(a => a._id === selectedAddressId) && (
                  <div className="card mb-4 alert alert-info">
                    <strong>Review address:</strong>
                    {(() => {
                      const addr = addresses.find(a => a._id === selectedAddressId);
                      return (
                        <>
                          <p className="mb-1">{addr.address_line}</p>
                          <p className="mb-1">{addr.city}, {addr.state}, {addr.country}</p>
                          <p className="mb-0">Tel: {addr.mobile}</p>
                        </>
                      );
                    })()}
                    <small className="text-muted mt-2 d-block">We will deliver to this address and you will be charged on delivery.</small>
                  </div>
                )}

                <div className="card-footer">
                  <button 
                    type="submit"
                    className="btn pay-button w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        {formData.paymentMethod === 'cod' ? 'Confirm Order' : `Pay $${(totalPrice - (discount + couponDiscount)).toFixed(2)}`}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CheckoutView;
