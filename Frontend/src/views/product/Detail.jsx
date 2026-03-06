import { lazy, useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductDetailView = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [quantity, setQuantity] = useState(1);
  const { productId, categorySlug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const toSlug = (name) =>
      name
        .toString()
        .trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

    const fetchProducts = async () => {
      try {
        setLoading(true);

        // If route contains a category slug, resolve it to the real category name and fetch filtered products
        const categoryProductsLS = localStorage.getItem('categoryProducts');
        let productsData = [];

        if (categorySlug && !categoryProductsLS) {
          // Resolve slug -> category name
          const catResp = await axios.get('http://localhost:5000/api/category');
          const cats = catResp.data?.data || catResp.data || [];
          const match = cats.find(c => toSlug(c.name) === categorySlug);
          const realName = match ? match.name : decodeURIComponent(categorySlug).replace(/-/g, ' ');

          // Fetch by real category name
          const resp = await axios.get(`http://localhost:5000/api/product/category/${encodeURIComponent(realName)}`);
          if (resp.data.success) {
            productsData = resp.data.data;
            setProducts(productsData);
          }
        } else if (categoryProductsLS) {
          // Use the filtered products from localStorage (set by TopMenu)
          productsData = JSON.parse(categoryProductsLS);
          setProducts(productsData);
          localStorage.removeItem('categoryProducts');
        } else {
          // Fallback: fetch all products
          const response = await axios.get('http://localhost:5000/api/product');
          if (response.data.success) {
            productsData = response.data.data;
            setProducts(productsData);
          }
        }

        // Set selected product logic
        if (productId) {
          const product = productsData.find(p => p._id === productId);
          if (product) setSelectedProduct(product);
        } else if (productsData.length > 0) {
          setSelectedProduct(productsData[0]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Error loading products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [productId, categorySlug]);

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

  // Add to cart function
  const handleAddToCart = async () => {
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const savedUser = JSON.parse(localStorage.getItem("user"));
      const userId = savedUser.id;

      const response = await axios.post(
        `http://localhost:5000/api/cart/${userId}/cart`,
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
      <div className="d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          Product not found. <Link to="/products">View all products</Link>
        </div>
      </div>
    );
  }

  // Update the image display in the main product section
  const renderMainImage = (product) => {
    if (!product.images || product.images.length === 0) {
      return (
        <div className="product-image-container">
          <img
            src="https://via.placeholder.com/500"
            className="img-fluid rounded shadow product-image"
            alt="Product placeholder"
          />
        </div>
      );
    }

    const handleMouseMove = (e) => {
      if (!isZoomed) return;
      const { left, top, width, height } = e.target.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setMousePosition({ x, y });
    };

    return (
      <div
        className="product-image-container"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={product.images[0].startsWith('http')
            ? product.images[0]
            : `http://localhost:5000${product.images[0]}`}
          className="product-image"
          alt={product.name}
          style={{
            transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/500';
          }}
        />
      </div>
    );
  };

  // Update the thumbnail images section
  const renderThumbnails = (product) => {
    if (!product.images || product.images.length === 0) return null;

    return (
      <div className="product-thumbnails">
        {product.images.map((img, index) => (
          <div
            key={index}
            className={`thumbnail-container ${selectedProduct.images[0] === img ? 'active' : ''}`}
            onClick={() => {
              setSelectedProduct({
                ...selectedProduct,
                images: [img, ...selectedProduct.images.filter(i => i !== img)]
              });
            }}
          >
            <img
              src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
              alt={`${product.name} view ${index + 1}`}
              className="thumbnail-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/80';
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  // Update the product cards section
  const renderProductCard = (product) => (
    <div
      className={`product-card card h-100 ${selectedProduct._id === product._id ? 'selected' : ''}`}
      onClick={() => setSelectedProduct(product)}
    >
      <div className="card-image-container">
        <img
          src={product.images[0]?.startsWith('http')
            ? product.images[0]
            : `http://localhost:5000${product.images[0]}`}
          className="card-img-top"
          alt={product.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/200';
          }}
        />
      </div>
      <div className="card-body">
        <h5 className="card-title text-truncate">{product.name}</h5>
        <div className="d-flex justify-content-between align-items-center">
          <p className="card-text text-primary fw-bold mb-0">${product.price}</p>
          {product.discount > 0 && (
            <span className="badge bg-danger">
              {product.discount}% OFF
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // Add CSS styles to the component
  const productStyles = `
    .product-image-container {
      position: relative;
      width: 100%;
      height: 500px;
      overflow: hidden;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      cursor: zoom-in;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .product-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: transform 0.2s ease-out;
    }

    .product-image-container:hover .product-image {
      transform: scale(2);
    }

    .product-thumbnails {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 20px;
      flex-wrap: wrap;
    }

    .thumbnail-container {
      width: 80px;
      height: 80px;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s ease;
      opacity: 0.7;
    }

    .thumbnail-container:hover {
      opacity: 0.9;
    }

    .thumbnail-container.active {
      border-color: #0d6efd;
      opacity: 1;
    }

    .thumbnail-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-details {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 24px;
    }

    .product-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .product-card.selected {
      border-color: #0d6efd;
    }

    .card-image-container {
      height: 200px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
    }

    .card-image-container img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: transform 0.3s ease;
    }

    .quantity-input {
      width: 150px !important;
      margin-right: 1rem;
    }

    .quantity-input .form-control {
      text-align: center;
      border-left: 0;
      border-right: 0;
      background-color: white;
    }

    .quantity-input .btn {
      width: 40px;
      padding: 0.375rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-color: #dee2e6;
    }

    .quantity-input .btn:hover {
      background-color: #0d6efd;
      color: white;
      border-color: #0d6efd;
    }

    .add-to-cart-btn {
      flex: 1;
      padding: 0.5rem 2rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .add-to-cart-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(13, 110, 253, 0.2);
    }

    @media (max-width: 768px) {
      .product-image-container {
        height: 350px;
      }

      .product-image-container:hover .product-image {
        transform: scale(1.5);
      }

      .thumbnail-container {
        width: 60px;
        height: 60px;
      }

      .quantity-input {
        width: 120px !important;
      }

      .add-to-cart-btn {
        padding: 0.5rem 1rem;
      }
    }
  `;

  return (
    <>
      <ToastContainer />
      <div className="container-fluid mt-3">
        <style>{productStyles}</style>
        {/* Product Header Section */}
        <div className="row mb-4">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/home">Home</Link></li>
                <li className="breadcrumb-item">
                  <Link to="/products">
                    {selectedProduct.category?.[0]?.name || 'Products'}
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">{selectedProduct.name}</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Main Product Section */}
        <div className="row">
          {/* Left Column - Images */}
          <div className="col-md-6 mb-4">
            <div className="main-image-container position-relative overflow-hidden">
              {renderMainImage(selectedProduct)}
            </div>

            {/* Thumbnail Images with click to change main image */}
            <div className="d-flex gap-2 justify-content-center">
              {selectedProduct.images?.map((img, index) => (
                <img
                  key={index}
                  src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                  className="border rounded cursor-pointer"
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    opacity: selectedProduct.images[0] === img ? 1 : 0.5,
                    transition: 'opacity 0.2s ease'
                  }}
                  alt={`${selectedProduct.name} view ${index + 1}`}
                  onClick={() => {
                    setSelectedProduct({
                      ...selectedProduct,
                      images: [
                        img,
                        ...selectedProduct.images.filter(i => i !== img)
                      ]
                    });
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/80';
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="col-md-6">
            <div className="product-details p-3">
              <h1 className="h3 mb-2">{selectedProduct.name}</h1>

              {/* Price Section */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2">
                  <h2 className="h3 mb-0 text-primary">${selectedProduct.price}</h2>
                  {selectedProduct.discount > 0 && (
                    <span className="badge bg-danger">
                      {selectedProduct.discount}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Details */}
              <div className="mb-4">
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td className="text-muted">Stock:</td>
                      <td>{selectedProduct.stock} {selectedProduct.unit}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Category:</td>
                      <td>{selectedProduct.category?.[0]?.name}</td>
                    </tr>
                    {/* <tr> */}
                    {/* <td className="text-muted">Sub Category:</td> */}
                    {/* <td>{selectedProduct.subCategory?.[0]?.name}</td> */}
                    {/* </tr> */}
                    <tr>
                      <td className="text-muted">Barcode:</td>
                      <td>{selectedProduct.barcodeId}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h5>Description</h5>
                <p>{selectedProduct.description}</p>
              </div>

              {/* Add to Cart Section */}
              <div className="d-flex align-items-center mb-4">
                <div className="input-group quantity-input">
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <i className="bi bi-dash"></i>
                  </button>
                  <input
                    type="text"
                    className="form-control"
                    value={quantity}
                    readOnly
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= selectedProduct.stock}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
                <button
                  className="btn btn-primary add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={selectedProduct.stock === 0}
                >
                  <i className="bi bi-cart-plus"></i>
                  {selectedProduct.stock === 0 ? 'Out of Stock' : 'Add to cart'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trending products (horizontal scroller) */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="card p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Trending right now</h5>
                <small className="text-muted">Based on popularity</small>
              </div>

              <div className="trending-container">
                {(products.filter(p => p.isHot).length ? products.filter(p => p.isHot) : products)
                  .slice(0, 12)
                  .map((p) => (
                    <div
                      key={p._id}
                      className="trending-item"
                      onClick={() => {
                        // immediate UI feedback then navigate to product route
                        setSelectedProduct(p);
                        navigate(`/product/${p._id}`);
                      }}
                      role="button"
                    >
                      <div
                        className="trending-image"
                        style={{
                          backgroundImage: `url(${p.images && p.images[0] ? (p.images[0].startsWith('http') ? p.images[0] : `http://localhost:5000${p.images[0]}`) : '/NO_IMG.png'})`
                        }}
                      />
                      <div className="trending-meta">
                        <div className="trending-name text-truncate">{p.name}</div>
                        <div className="trending-price text-primary fw-bold">${p.price}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* All Products Section */}
        <div className="row mt-5">
          <div className="col-12">
            <h3 className="mb-4">Similar Products</h3>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              {products.map((product) => (
                <div key={product._id} className="col">
                  {renderProductCard(product)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailView;