import { API_URL as GLOBAL_API_URL, DOMAIN_URL as GLOBAL_DOMAIN_URL } from '../../config/apiConfig';
import { lazy, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Add CSS styles for the cart
const cartStyles = `
  .cart-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem 0;
    margin-bottom: 2rem;
    color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .cart-title {
    font-size: 2rem;
    font-weight: 600;
    margin: 0;
  }

  .cart-item {
    transition: all 0.3s ease;
    border-bottom: 1px solid #eee;
    padding: 1rem 0;
  }

  .cart-item:hover {
    background-color: #f8f9fa;
  }

  .product-image {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }

  .product-image:hover {
    transform: scale(1.05);
  }

  .product-name {
    color: #2d3748;
    font-weight: 600;
    font-size: 1.1rem;
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .product-name:hover {
    color: #4a5568;
  }

  .quantity-control {
    display: inline-flex;
    align-items: center;
    background: #f7fafc;
    border-radius: 8px;
    padding: 0.25rem;
    border: 2px solid #e2e8f0;
  }

  .quantity-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    border: none;
    background: white;
    color: #4a5568;
    transition: all 0.2s ease;
  }

  .quantity-btn:hover:not(:disabled) {
    background: #edf2f7;
    color: #2d3748;
  }

  .quantity-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .quantity-input {
    width: 40px;
    text-align: center;
    border: none;
    background: transparent;
    font-weight: 600;
    color: #2d3748;
  }

  .remove-btn {
    padding: 0.5rem;
    border-radius: 6px;
    border: none;
    background: #fff5f5;
    color: #e53e3e;
    transition: all 0.2s ease;
  }

  .remove-btn:hover {
    background: #fed7d7;
    color: #c53030;
  }

  .price-tag {
    font-weight: 600;
    color: #2d3748;
    font-size: 1.1rem;
  }

  .unit-price {
    color: #718096;
    font-size: 0.875rem;
  }

  .summary-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 1rem;
  }

  .summary-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 1rem;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    color: #4a5568;
  }

  .summary-total {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
  }

  .checkout-btn {
    width: 100%;
    padding: 0.75rem;
    background: #4299e1;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .checkout-btn:hover {
    background: #3182ce;
    transform: translateY(-1px);
  }

  .continue-shopping {
    color: #4a5568;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: color 0.2s ease;
  }

  .continue-shopping:hover {
    color: #2d3748;
  }

  .empty-cart {
    text-align: center;
    padding: 3rem 1rem;
  }

  .empty-cart-icon {
    font-size: 4rem;
    color: #a0aec0;
    margin-bottom: 1rem;
  }

  .empty-cart-text {
    color: #4a5568;
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .shop-now-btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: #4299e1;
    color: white;
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .shop-now-btn:hover {
    background: #3182ce;
    transform: translateY(-1px);
  }

  .delivery-info {
    background: #f0fff4;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #2f855a;
  }

  @media (max-width: 768px) {
    .cart-item {
      padding: 0.5rem 0;
    }

    .product-image {
      width: 80px;
      height: 80px;
    }

    .product-name {
      font-size: 1rem;
    }

    .quantity-control {
      padding: 0.125rem;
    }

    .quantity-btn {
      width: 28px;
      height: 28px;
    }
  }
`;

const CartView = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const getAuthConfig = () => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser || !savedUser.tokens?.accessToken) {
      toast.error('Please login to add items to cart');
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

  const handleQuantityChange = async (cartProductId, newQuantity) => {
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const response = await axios.put(
        `${GLOBAL_API_URL}/cart/cart/${cartProductId}`,
        { quantity: newQuantity },
        authConfig
      );

      if (response.data.success) {
        fetchCartItems(); // Refresh cart items
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || 'Error updating cart');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/account/signin');
      } else {
        toast.error(error.response?.data?.message || 'Error updating cart');
      }
    }
  };

  const handleRemoveItem = async (cartProductId) => {
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const response = await axios.delete(
        `${GLOBAL_API_URL}/cart/cart/${cartProductId}`,
        authConfig
      );

      if (response.data.success) {
        fetchCartItems(); // Refresh cart items
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || 'Error removing item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/account/signin');
      } else {
        toast.error(error.response?.data?.message || 'Error removing item from cart');
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{cartStyles}</style>
      <ToastContainer />

      <div className="cart-header">
        <div className="container">
          <h1 className="cart-title">Your Shopping Cart</h1>
        </div>
      </div>

      <div className="container mb-5">
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <i className="bi bi-cart-x"></i>
            </div>
            <h2 className="empty-cart-text">Your cart is empty</h2>
            <Link to="/" className="shop-now-btn">
              Start Shopping <i className="bi bi-arrow-right ms-2"></i>
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-lg-8">
              {cartItems.map((item) => {
                if (!item.productId) {
                  return (
                    <div key={item._id} className="cart-item">
                      <div className="row align-items-center">
                        <div className="col-md-9 text-danger fw-bold">
                          This product is no longer available.
                        </div>
                        <div className="col-md-3 text-end">
                          <button
                            className="remove-btn"
                            onClick={() => handleRemoveItem(item._id)}
                            title="Remove item"
                          >
                            <i className="bi bi-trash"></i> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={item._id} className="cart-item">
                    <div className="row align-items-center">
                      <div className="col-md-3">
                        <img
                          src={item?.productId?.images?.[0]?.startsWith('http')
                            ? item.productId.images[0]
                            : item?.productId?.images?.[0] ? `${GLOBAL_DOMAIN_URL}${item.productId.images[0]}` : 'https://via.placeholder.com/120'}
                          className="product-image"
                          alt={item?.productId?.name || 'Product'}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/120';
                          }}
                        />
                      </div>
                      <div className="col-md-9">
                        <div className="row align-items-center">
                          <div className="col-md-5">
                            <Link
                              to={`/product/${item?.productId?._id}`}
                              className="product-name"
                            >
                              {item?.productId?.name || 'Unknown Product'}
                            </Link>
                            <p className="text-muted mb-0 small">
                              {item?.productId?.description || 'No description available.'}
                            </p>
                          </div>
                          <div className="col-md-3">
                            <div className="quantity-control">
                              <button
                                className="quantity-btn"
                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <input
                                type="text"
                                className="quantity-input"
                                value={item.quantity}
                                readOnly
                              />
                              <button
                                className="quantity-btn"
                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                disabled={item.quantity >= item.productId.stock}
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="price-tag">
                              ${((item?.productId?.price || 0) * (item?.quantity || 1)).toFixed(2)}
                            </div>
                            <div className="unit-price">
                              ${(item?.productId?.price || 0).toFixed(2)} each
                            </div>
                          </div>
                          <div className="col-md-1">
                            <button
                              className="remove-btn"
                              onClick={() => handleRemoveItem(item._id)}
                              title="Remove item"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="delivery-info mt-4">
                <i className="bi bi-truck"></i>
                Free Delivery within 1-2 weeks
              </div>

              <div className="mt-4">
                <Link to="/category" className="continue-shopping">
                  <i className="bi bi-arrow-left"></i>
                  Continue Shopping
                </Link>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="summary-card p-4">
                <h3 className="summary-title mb-4">Order Summary</h3>

                <div className="summary-item">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>

                <div className="summary-item text-success">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>

                <div className="summary-item">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>

                <hr />

                <div className="summary-item summary-total">
                  <span>Total</span>
                  <span>${(totalPrice - discount).toFixed(2)}</span>
                </div>
                {/* /checkout */}
                <Link
                  className="checkout-btn btn mt-4" to="/checkout"
                >
                  Proceed to Checkout
                  <i className="bi bi-arrow-right ms-2"></i>
                </Link>

                <div className="text-center mt-4">
                  <img
                    src="../../images/payment/payments.webp"
                    alt="Payment methods"
                    height={26}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartView;
