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
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    shippingName: '',
    shippingAddress1: '',
    shippingAddress2: '',
    shippingCountry: '',
    shippingState: '',
    shippingZip: '',
    sameAsBilling: true,
    billingName: '',
    billingAddress1: '',
    billingAddress2: '',
    billingCountry: '',
    billingState: '',
    billingZip: '',
    paymentMethod: 'razorpay',
    // card fields retained for future use but hidden
    cardName: '',
    cardNumber: '',
    expirationMonth: '',
    expirationYear: '',
    cvv: ''
  });

  useEffect(() => {
    fetchCartItems();
  }, []);

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
        `http://localhost:5000/api/cart/${userId}/cart`,
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

  const handleRazorpay = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const amount = totalPrice - discount;

      const { data } = await axios.post("http://localhost:5000/api/payment/razor/create-order", {
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
          // create order record on server
          try {
            const savedUser = JSON.parse(localStorage.getItem("user"));
            const orderPayload = {
              userId: [savedUser.id],
              orderId: "order_" + Date.now(),
              paymentId: response.razorpay_payment_id,
              paymentStatus: "PAID",
              deliveryAddress: {
                address_line: formData.shippingAddress1 + (formData.shippingAddress2 ? ", " + formData.shippingAddress2 : ""),
                city: formData.shippingState,
                state: formData.shippingState,
                country: formData.shippingCountry,
                mobile: formData.mobile
              },
              subTotalAmt: totalPrice,
              totalAmt: totalPrice - discount,
            };
            const resp = await axios.post("http://localhost:5000/api/order", orderPayload, authConfig);
            localStorage.setItem('lastOrder', JSON.stringify(resp.data.newOrder));
            // show Swal and then redirect
            await Swal.fire({
              icon: 'success',
              title: 'Order placed successfully!',
              text: 'Redirecting to tracking page...',
              timer: 2000,
              showConfirmButton: false
            });
            navigate(`/track/${resp.data.newOrder._id}`);
          } catch (err) {
            console.error('Error saving order', err);
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
    } finally {
      setLoading(false);
    }
  };

  const handleCod = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;
      const savedUser = JSON.parse(localStorage.getItem("user"));
      const orderPayload = {
        userId: [savedUser.id],
        orderId: "order_" + Date.now(),
        paymentStatus: "COD",
        deliveryAddress: {
          address_line: formData.shippingAddress1 + (formData.shippingAddress2 ? ", " + formData.shippingAddress2 : ""),
          city: formData.shippingState,
          state: formData.shippingState,
          country: formData.shippingCountry,
          mobile: formData.mobile
        },
        subTotalAmt: totalPrice,
        totalAmt: totalPrice - discount,
      };
      const resp = await axios.post("http://localhost:5000/api/order", orderPayload, authConfig);
      localStorage.setItem('lastOrder', JSON.stringify(resp.data.newOrder));
      // show Swal then redirect
      await Swal.fire({
        icon: 'success',
        title: 'Order placed successfully!',
        text: 'Redirecting to tracking page...',
        timer: 2000,
        showConfirmButton: false
      });
      navigate(`/track/${resp.data.newOrder._id}`);

    } catch (error) {
      console.error('COD order error', error.response || error);
      toast.error(
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        "Failed to place order"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
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
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email Address"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="tel"
                        className="form-control"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        placeholder="Mobile Number"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="card form-card">
                <div className="card-header">
                  <i className="bi bi-truck"></i> Shipping Information
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <input
                        type="text"
                        className="form-control"
                        name="shippingName"
                        value={formData.shippingName}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        name="shippingAddress1"
                        value={formData.shippingAddress1}
                        onChange={handleInputChange}
                        placeholder="Address Line 1"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        name="shippingAddress2"
                        value={formData.shippingAddress2}
                        onChange={handleInputChange}
                        placeholder="Address Line 2 (Optional)"
                      />
                    </div>
                    <div className="col-md-4">
                      <select 
                        className="form-select"
                        name="shippingCountry"
                        value={formData.shippingCountry}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Country</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <select 
                        className="form-select"
                        name="shippingState"
                        value={formData.shippingState}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select State</option>
                        <option value="CA">California</option>
                        <option value="NY">New York</option>
                        <option value="TX">Texas</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        name="shippingZip"
                        value={formData.shippingZip}
                        onChange={handleInputChange}
                        placeholder="ZIP Code"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              {/* <div className="card form-card">
                <div className="card-header d-flex align-items-center">
                  <i className="bi bi-receipt"></i> Billing Information
                  <div className="form-check ms-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="sameAsBilling"
                      checked={formData.sameAsBilling}
                      onChange={handleInputChange}
                      id="sameAsBilling"
                    />
                    <label className="form-check-label" htmlFor="sameAsBilling">
                      Same as Shipping Information
                    </label>
                  </div>
                </div>
                <div className="card-body">
                  {!formData.sameAsBilling && (
                    <div className="row g-3">
                      <div className="col-12">
                        <input
                          type="text"
                          className="form-control"
                          name="billingName"
                          value={formData.billingName}
                          onChange={handleInputChange}
                          placeholder="Full Name"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          type="text"
                          className="form-control"
                          name="billingAddress1"
                          value={formData.billingAddress1}
                          onChange={handleInputChange}
                          placeholder="Address Line 1"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          type="text"
                          className="form-control"
                          name="billingAddress2"
                          value={formData.billingAddress2}
                          onChange={handleInputChange}
                          placeholder="Address Line 2 (Optional)"
                        />
                      </div>
                      <div className="col-md-4">
                        <select 
                          className="form-select"
                          name="billingCountry"
                          value={formData.billingCountry}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Country</option>
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="UK">United Kingdom</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <select 
                          className="form-select"
                          name="billingState"
                          value={formData.billingState}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select State</option>
                          <option value="CA">California</option>
                          <option value="NY">New York</option>
                          <option value="TX">Texas</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <input
                          type="text"
                          className="form-control"
                          name="billingZip"
                          value={formData.billingZip}
                          onChange={handleInputChange}
                          placeholder="ZIP Code"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div> */}

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
                            <h6 className="my-0">{item.productId.name}</h6>
                            <small className="text-muted">
                              Quantity: {item.quantity}
                            </small>
                          </div>
                          <span className="text-muted">
                            ${(item.productId.price * item.quantity).toFixed(2)}
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
                        <strong>${(totalPrice - discount).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                {formData.paymentMethod === 'cod' && (
                  <div className="card mb-4 alert alert-info">
                    <strong>Review address:</strong>
                    <p className="mb-1">{formData.shippingName}</p>
                    <p className="mb-1">{formData.shippingAddress1}{formData.shippingAddress2 && ", " + formData.shippingAddress2}</p>
                    <p className="mb-1">{formData.shippingState}, {formData.shippingCountry}, {formData.shippingZip}</p>
                    <p className="mb-0">{formData.mobile}</p>
                    <small className="text-muted">We will deliver to this address and you will be charged on delivery.</small>
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
                        {formData.paymentMethod === 'cod' ? 'Confirm Order' : `Pay $${(totalPrice - discount).toFixed(2)}`}
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
