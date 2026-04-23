import { API_URL as GLOBAL_API_URL, DOMAIN_URL as GLOBAL_DOMAIN_URL } from '../../config/apiConfig';
import { lazy, useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductReviews, { StarDisplay } from '../../components/ProductReviews';

const ProductDetailView = () => {
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [quantity, setQuantity] = useState(1);
  const { productId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top automatically when changing products
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const loadProductData = async () => {
      try {
        setLoading(true);
        if (!productId) {
           setLoading(false);
           return;
        }

        // 1. Fetch exact product
        const response = await axios.get(`${GLOBAL_API_URL}/product/${productId}`);
        const product = response.data;
        
        if (product) {
          setSelectedProduct(product);

          // Manage Recently Viewed in LocalStorage
          let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
          viewed = viewed.filter(p => p._id !== product._id); // remove duplicates
          viewed.unshift({
             _id: product._id,
             name: product.name,
             price: product.price,
             images: product.images,
             category: product.category || [],
             discount: product.discount || 0
          }); 
          if (viewed.length > 8) viewed = viewed.slice(0, 8); // memory constrain
          localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
          setRecentlyViewed(viewed);

          // 2. Fetch Related (same category)
          try {
             const catId = product.category?.[0]?._id || product.category?.[0];
             if (catId) {
               const relResp = await axios.get(`${GLOBAL_API_URL}/product?category=${catId}&limit=5`);
               if (relResp.data?.success) {
                 const related = relResp.data.data.filter(p => p._id !== product._id).slice(0, 4);
                 setRelatedProducts(related); 
               }
             }
          } catch(e) { }
        }

      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [productId]);

  const getAuthConfig = () => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser || !savedUser.tokens?.accessToken) {
      toast.error('Please login to checkout');
      navigate('/account/signin');
      return null;
    }
    return {
      headers: {
        "Authorization": `Bearer ${savedUser.tokens.accessToken}`
      }
    };
  };

  // Add to cart function
  const handleAddToCart = async () => {
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const savedUser = JSON.parse(localStorage.getItem("user"));
      const userId = savedUser.id;

      const response = await axios.post(
        `${GLOBAL_API_URL}/cart/${userId}/cart`,
        {
          productId: selectedProduct._id,
          quantity: quantity
        },
        authConfig
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Product added to cart successfully!');
        setQuantity(1); // Reset quantity after successful addition
      } else {
        toast.error(response.data.message || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/account/signin');
      } else {
        toast.error(error.response?.data?.message || 'Error adding product to cart');
      }
    }
  };

  // Handle quantity change
  const handleQuantityChange = (increment) => {
    setQuantity(prevQuantity => {
      const newQuantity = prevQuantity + increment;
      if (newQuantity < 1) return 1;
      if (newQuantity > selectedProduct.stock) return selectedProduct.stock;
      return newQuantity;
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "80vh" }}>
        <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="container mt-5 py-5 text-center">
        <h2 className="fw-bold mb-3">Product Not Found</h2>
        <p className="text-muted mb-4">The item you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="btn btn-primary px-4 rounded-pill">View all products</Link>
      </div>
    );
  }

  // Update the image display in the main product section
  const renderMainImage = (product) => {
    const primaryImg = product.images?.[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${GLOBAL_DOMAIN_URL}${product.images[0]}`) : '/NO_IMG.png';
    const handleMouseMove = (e) => {
      if (!isZoomed) return;
      const { left, top, width, height } = e.target.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setMousePosition({ x, y });
    };

    return (
      <div
        className="product-image-container premium-shadow rounded-4 bg-white"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {product.discount > 0 && (
          <div className="corner-discount-badge shadow-lg">
            {product.discount}%<br/><small>OFF</small>
          </div>
        )}
        <img
          src={primaryImg}
          className="product-image"
          alt={product.name}
          style={{
            transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/600';
          }}
        />
        <div className="zoom-hint d-flex align-items-center gap-2">
           <i className="bi bi-zoom-in"></i> Hover to zoom
        </div>
      </div>
    );
  };

  // Update the product cards section for Recently Viewed / Similar
  const renderProductCard = (product) => {
    const primaryImg = product.images?.[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${GLOBAL_DOMAIN_URL}${product.images[0]}`) : '/NO_IMG.png';
    return (
      <div
        className={`product-hover-card ${product.averageRating >= 4 && product.discount > 0 ? 'ai-recommended-glow' : ''}`}
        onClick={() => navigate(`/product/${product._id}`)}
      >
        <div className="image-container">
          {product.averageRating >= 4 && product.discount > 0 ? (
            <span className="discount-badge ai-pick-badge"> AI Pick</span>
          ) : product.discount > 0 ? (
            <span className="discount-badge">{product.discount}% OFF</span>
          ) : null}
          <img
            src={primaryImg}
            className="product-card-img"
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300';
            }}
          />
          <div className="card-overlay">
            <button className="quick-view-btn shadow" onClick={(e) => { e.stopPropagation(); navigate(`/product/${product._id}`); }}>
              <i className="bi bi-eye"></i> View Details
            </button>
          </div>
        </div>
        <div className="product-info">
          <span className="product-category text-truncate">{product.category?.[0]?.name || "Premium"}</span>
          <h3 className="product-title" title={product.name}>
             {product.name.length > 40 ? `${product.name.substring(0, 40)}...` : product.name}
          </h3>
          <div className="product-price-row mt-auto">
            <span className="product-price">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
            {product.averageRating > 0 && (
              <div className="d-flex align-items-center gap-1 bg-light rounded-pill px-2 py-1">
                <i className="bi bi-star-fill text-warning" style={{fontSize: '0.8rem'}}></i>
                <span className="small fw-bold text-dark">{product.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Add CSS styles to the component
  const productStyles = `
    .product-page-wrapper {
      background-color: #f8fafc;
      font-family: 'Inter', system-ui, sans-serif;
      padding-bottom: 5rem;
    }
    
    /* Product Container */
    .premium-container {
      background: white;
      border-radius: 24px;
      padding: 3rem;
      box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
      border: 1px solid rgba(0,0,0,0.02);
    }
    
    /* Image Gallery */
    .product-image-container {
      position: relative;
      width: 100%;
      height: 550px;
      overflow: hidden;
      cursor: crosshair;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .product-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: transform 0.15s ease-out;
    }
    .product-image-container:hover .product-image {
      transform: scale(2.5);
    }
    .corner-discount-badge {
      position: absolute;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
      color: white;
      width: 65px;
      height: 65px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.1rem;
      line-height: 1.1;
      z-index: 10;
      box-shadow: 0 10px 20px rgba(225, 29, 72, 0.3);
      border: 3px solid white;
    }
    .zoom-hint {
      position: absolute;
      bottom: 20px;
      right: 20px;
      background: rgba(255,255,255,0.9);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #64748b;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
      pointer-events: none;
      backdrop-filter: blur(4px);
    }
    
    /* Thumbnails */
    .thumbnail-container {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid #e2e8f0;
      transition: all 0.2s ease;
      background: white;
      padding: 5px;
    }
    .thumbnail-container:hover {
      border-color: #94a3b8;
      transform: translateY(-2px);
    }
    .thumbnail-container.active {
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102,126,234,0.2);
    }
    .thumbnail-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* Product Details Typography */
    .detail-title {
      font-size: 2.25rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
      letter-spacing: -0.5px;
      margin-bottom: 0.5rem;
    }
    .detail-price {
      font-size: 2.5rem;
      font-weight: 900;
      color: #667eea;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .detail-price-old {
      font-size: 1.25rem;
      color: #94a3b8;
      text-decoration: line-through;
      font-weight: 600;
    }
    
    /* Chips & Badges */
    .attribute-chip {
      background: #f1f5f9;
      padding: 10px 16px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #334155;
      font-size: 0.9rem;
    }
    .attribute-chip i {
      color: #667eea;
      font-size: 1.1rem;
    }
    
    /* Action Controls */
    .action-controls {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
    }
    .modern-qty-input {
      background: white;
      border-radius: 16px;
      padding: 0.5rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.02);
      border: 1px solid #e2e8f0;
      width: 140px;
    }
    .modern-qty-input .btn {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      border: none;
      background: #f1f5f9;
      color: #475569;
      font-weight: bold;
      transition: all 0.2s;
    }
    .modern-qty-input .btn:hover:not(:disabled) {
      background: #667eea;
      color: white;
    }
    .modern-qty-input input {
      border: none;
      background: transparent;
      font-weight: 700;
      font-size: 1.1rem;
      color: #1e293b;
    }
    .modern-qty-input input:focus {
      outline: none;
      box-shadow: none;
    }
    
    .btn-add-cart-premium {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 16px;
      font-weight: 700;
      font-size: 1.1rem;
      padding: 1rem 2rem;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      transition: all 0.3s ease;
      box-shadow: 0 10px 20px rgba(102,126,234,0.3);
    }
    .btn-add-cart-premium:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 15px 25px rgba(102,126,234,0.4);
      color: white;
    }
    .btn-add-cart-premium:disabled {
      background: #cbd5e1;
      box-shadow: none;
      transform: none;
    }

    /* Product Cards (Copied from ProductList for consistency) */
    .product-hover-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.03);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
      cursor: pointer;
    }
    .product-hover-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 30px -10px rgba(0,0,0,0.08);
      border-color: rgba(102,126,234,0.2);
    }
    .image-container {
      height: 220px;
      background-color: #f8fafc;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 1.5rem;
    }
    .product-card-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .product-hover-card:hover .product-card-img {
      transform: scale(1.1);
    }
    .discount-badge {
      position: absolute;
      top: 15px;
      left: 15px;
      background: linear-gradient(135deg, #f87171, #f43f5e);
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      box-shadow: 0 4px 10px rgba(244,63,94,0.3);
      z-index: 2;
    }
    .card-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
      height: 50%;
      display: flex;
      align-items: flex-end;
      padding: 1.5rem;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 10;
    }
    .product-hover-card:hover .card-overlay {
      opacity: 1;
    }
    .quick-view-btn {
      width: 100%;
      background: white;
      color: #1e293b;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      padding: 0.75rem;
      transform: translateY(20px);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .product-hover-card:hover .quick-view-btn {
      transform: translateY(0);
    }
    .quick-view-btn:hover {
      background: #667eea;
      color: white;
    }
    .product-info {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .product-category {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94a3b8;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .product-title {
      font-weight: 700;
      color: #1e293b;
      font-size: 1.05rem;
      margin-bottom: 1rem;
      line-height: 1.4;
    }
    .product-price-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .product-price {
      font-size: 1.25rem;
      font-weight: 800;
      color: #667eea;
    }
    
    .section-title {
      font-weight: 800;
      font-size: 2rem;
      color: #0f172a;
      position: relative;
      display: inline-block;
      margin-bottom: 2rem;
    }
    .section-title::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 0;
      width: 50%;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 2px;
    }

    /* AI Recommendation Specifics */
    .ai-pick-badge {
      background: linear-gradient(135deg, #8b5cf6, #c084fc);
      box-shadow: 0 4px 10px rgba(139, 92, 246, 0.4);
      border: 1px solid rgba(255,255,255,0.4);
      color: white;
    }
    .ai-recommended-glow {
      border: 1px solid rgba(139, 92, 246, 0.3);
      position: relative;
    }
    .ai-recommended-glow::before {
      content: '';
      position: absolute;
      top: -2px; left: -2px; right: -2px; bottom: -2px;
      background: linear-gradient(45deg, #8b5cf6, transparent, #c084fc, transparent);
      z-index: -1;
      border-radius: 22px;
      animation: glowing 3s linear infinite;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .ai-recommended-glow:hover::before {
      opacity: 1;
    }
    @keyframes glowing {
      0% { filter: blur(4px); }
      50% { filter: blur(8px); }
      100% { filter: blur(4px); }
    }
  `;

  return (
    <div className="product-page-wrapper">
      <ToastContainer position="bottom-right" />
      <style>{productStyles}</style>

      {/* Breadcrumb Navbar */}
      <div className="bg-white border-bottom py-3 mb-5">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 fw-medium">
              <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Home</Link></li>
              <li className="breadcrumb-item"><Link to="/products" className="text-decoration-none text-muted">Catalog</Link></li>
              <li className="breadcrumb-item active text-dark" aria-current="page">{selectedProduct.category?.[0]?.name || "Product"}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container">
        {/* Main Product Presentation */}
        <div className="premium-container mb-5">
          <div className="row g-5">
            {/* Left Column - Premium Gallery */}
            <div className="col-lg-6">
              {renderMainImage(selectedProduct)}
              
              {/* Thumbnails */}
              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div className="d-flex gap-3 justify-content-center mt-4">
                  {selectedProduct.images.map((img, index) => {
                    const isImgActive = selectedProduct.images[0] === img;
                    return (
                      <div 
                        key={index}
                        className={`thumbnail-container ${isImgActive ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedProduct({
                            ...selectedProduct,
                            images: [img, ...selectedProduct.images.filter(i => i !== img)]
                          });
                        }}
                      >
                        <img
                          src={img.startsWith('http') ? img : `${GLOBAL_DOMAIN_URL}${img}`}
                          className="thumbnail-image"
                          alt={`Thumbnail ${index + 1}`}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/80'; }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column - Beautiful Details */}
            <div className="col-lg-6 d-flex flex-column">
              {/* Header Info */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="badge bg-dark bg-opacity-10 text-dark fw-bold px-3 py-2 rounded-pill text-uppercase" style={{letterSpacing: '1px'}}>
                    {selectedProduct.category?.[0]?.name || "Premium Item"}
                  </span>
                  {selectedProduct.stock > 0 ? (
                    <span className="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-2 rounded-pill"><i className="bi bi-check-circle-fill me-1"></i> In Stock ({selectedProduct.stock})</span>
                  ) : (
                    <span className="badge bg-danger bg-opacity-10 text-danger fw-bold px-3 py-2 rounded-pill"><i className="bi bi-x-circle-fill me-1"></i> Out of Stock</span>
                  )}
                </div>
                
                <h1 className="detail-title">{selectedProduct.name}</h1>
                
                <div className="d-flex align-items-center gap-3 mt-3">
                  {selectedProduct.averageRating > 0 ? (
                    <>
                      <StarDisplay rating={selectedProduct.averageRating} size="lg" />
                      <span className="fw-bold fs-5">{selectedProduct.averageRating.toFixed(1)}</span>
                    </>
                  ) : (
                    <StarDisplay rating={0} size="lg" />
                  )}
                  <span className="text-muted fw-medium">
                    {selectedProduct.totalReviews > 0
                      ? `(${selectedProduct.totalReviews} ${selectedProduct.totalReviews === 1 ? 'review' : 'reviews'})`
                      : '(No reviews yet)'}
                  </span>
                </div>
              </div>

              <hr className="opacity-10 my-1" />

              {/* Price Row */}
              <div className="my-4">
                <div className="detail-price">
                  <span>₹{parseFloat(selectedProduct.price).toLocaleString('en-IN')}</span>
                  {selectedProduct.discount > 0 && (
                     <>
                        <span className="detail-price-old lh-1">
                          ₹{(selectedProduct.price / (1 - selectedProduct.discount / 100)).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                        <span className="badge bg-danger" style={{fontSize: '1rem', padding: '6px 12px'}}>
                          🔥 Save {selectedProduct.discount}%
                        </span>
                     </>
                  )}
                </div>
              </div>

              {/* Attributes Chips */}
              <div className="d-flex flex-wrap gap-3 mb-5">
                 <div className="attribute-chip">
                    <i className="bi bi-upc-scan"></i>
                    <span><strong>SKU:</strong> {selectedProduct.barcodeId || 'N/A'}</span>
                 </div>
                 <div className="attribute-chip">
                    <i className="bi bi-shield-check"></i>
                    <span><strong>Warranty:</strong> 1 Year</span>
                 </div>
                 <div className="attribute-chip">
                    <i className="bi bi-truck"></i>
                    <span><strong>Delivery:</strong> Free</span>
                 </div>
              </div>

              {/* Description Blocks */}
              <div className="mb-5 flex-grow-1">
                <h5 className="fw-bolder mb-3 text-dark">About This Item</h5>
                <p className="text-secondary lh-lg" style={{fontSize: '1.05rem'}}>
                  {selectedProduct.description || "Experience the perfect blend of innovation and elegance. This premium product is crafted to elevate your daily routine, featuring state-of-the-art materials and an intuitive design."}
                </p>
              </div>

              {/* Action Controls Footer */}
              <div className="action-controls mt-auto">
                <div className="d-flex flex-column flex-sm-row align-items-center gap-3">
                  <div className="input-group modern-qty-input shadow-sm">
                    <button type="button" className="btn" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                      <i className="bi bi-dash-lg"></i>
                    </button>
                    <input type="text" className="form-control text-center" value={quantity} readOnly />
                    <button type="button" className="btn" onClick={() => handleQuantityChange(1)} disabled={quantity >= selectedProduct.stock}>
                      <i className="bi bi-plus-lg"></i>
                    </button>
                  </div>
                  <button className="btn-add-cart-premium" onClick={handleAddToCart} disabled={selectedProduct.stock === 0}>
                    <i className="bi bi-bag-plus fs-4"></i>
                    {selectedProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-5 pt-4">
            <h2 className="section-title text-dark">
               <span style={{color: '#8b5cf6'}}></span> AI Recommended for You
            </h2>
            <div className="row g-4">
              {relatedProducts.map((product) => (
                <div key={product._id} className="col-12 col-sm-6 col-lg-3">
                  {renderProductCard(product)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Reviews Section ─────────────────────────────────────────────── */}
        <div className="premium-container mb-5">
          <ProductReviews 
            productId={selectedProduct._id} 
            productName={selectedProduct.name}
            discount={selectedProduct.discount}
            category={selectedProduct.category}
            onRatingUpdate={(newAvgRating, newTotalReviews) => {
              // Update parent state so the star badge in the product header
              // reflects the new rating immediately without a page refresh.
              setSelectedProduct(prev => ({
                ...prev,
                averageRating: newAvgRating,
                totalReviews: newTotalReviews
              }));
            }}
          />
        </div>

        {/* Recently Viewed */}
        {recentlyViewed.length > 1 && (
          <div className="mb-5 pt-4">
            <h2 className="section-title">Recently Viewed</h2>
            <div className="row flex-row flex-nowrap overflow-auto pb-4 gap-0" style={{scrollbarWidth: 'thin'}}>
              {recentlyViewed.filter(p => p._id !== selectedProduct._id).map((product) => (
                <div key={product._id} className="col-10 col-sm-6 col-lg-3 flex-shrink-0">
                  {renderProductCard(product)}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetailView;