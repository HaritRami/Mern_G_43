import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL as GLOBAL_API_URL, DOMAIN_URL } from "../../config/apiConfig";

const productStyles = `
  .products-container {
    background-color: #f8fafc;
    min-height: 100vh;
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  /* Hero Banner */
  .catalog-hero {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: 24px;
    padding: 3rem 4rem;
    position: relative;
    overflow: hidden;
    color: white;
    box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.3);
    margin-bottom: 2.5rem;
  }
  .catalog-hero::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(102,126,234,0.3) 0%, rgba(255,255,255,0) 70%);
    border-radius: 50%;
    pointer-events: none;
  }
  .hero-title {
    font-weight: 800;
    font-size: 2.5rem;
    letter-spacing: -0.5px;
    margin-bottom: 0.5rem;
    background: linear-gradient(90deg, #fff, #cbd5e1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .hero-subtitle {
    font-size: 1.1rem;
    color: #94a3b8;
    max-width: 500px;
  }

  /* Glassmorphic Sidebar */
  .filter-sidebar {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    border: 1px solid rgba(0,0,0,0.04);
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.03);
    position: sticky;
    top: 100px;
  }
  .filter-heading {
    font-weight: 700;
    color: #1e293b;
    font-size: 1.1rem;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .category-radio {
    display: none;
  }
  .category-label {
    display: block;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    color: #64748b;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
  }
  .category-label:hover {
    background-color: #f1f5f9;
    color: #334155;
  }
  .category-radio:checked + .category-label {
    background: linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%);
    color: #667eea;
    font-weight: 600;
    border-color: rgba(102,126,234,0.2);
  }
  
  .price-input {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 0.5rem 1rem;
    font-weight: 500;
    color: #334155;
    transition: all 0.2s ease;
  }
  .price-input:focus {
    box-shadow: 0 0 0 3px rgba(102,126,234,0.2);
    border-color: #667eea;
    outline: none;
  }
  
  .apply-btn {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    padding: 0.75rem;
    transition: all 0.2s ease;
  }
  .apply-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(15,23,42,0.2);
  }

  /* Product Hover Cards */
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
    height: 240px;
    background-color: #f8fafc;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 2rem;
  }
  .product-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .product-hover-card:hover .product-image {
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
  
  /* Hover Overlay & Button */
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
    padding: 1.5rem;
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
    font-size: 1.15rem;
    margin-bottom: 1rem;
    line-height: 1.4;
  }
  .product-price-row {
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .product-price {
    font-size: 1.35rem;
    font-weight: 800;
    color: #667eea;
  }
  
  /* Modern Pagination */
  .premium-pagination .page-item .page-link {
    border: none;
    background: white;
    color: #64748b;
    border-radius: 50%;
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 0.25rem;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    transition: all 0.2s ease;
  }
  .premium-pagination .page-item.active .page-link {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    box-shadow: 0 5px 15px rgba(102,126,234,0.3);
  }
  .premium-pagination .page-item.disabled .page-link {
    background: transparent;
    box-shadow: none;
    opacity: 0.5;
  }
  
  /* Sort Select */
  .premium-sort {
    background-color: transparent;
    border: 1px solid #e2e8f0;
    border-radius: 50px;
    padding: 0.5rem 2.5rem 0.5rem 1.25rem;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.01);
    transition: all 0.2s ease;
  }
  .premium-sort:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    outline: none;
  }

  /* Shimmer Skeletons */
  .shimmer-wrapper { overflow: hidden; position: relative; }
  .shimmer-line {
    background: #f6f7f8;
    background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
    background-repeat: no-repeat;
    background-size: 800px 100%;
    animation-duration: 1.5s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: placeholderShimmer;
    animation-timing-function: linear;
  }
  @keyframes placeholderShimmer {
    0% { background-position: -468px 0; }
    100% { background-position: 468px 0; }
  }
`;

const ProductCardSkeleton = () => (
  <div className="product-hover-card shimmer-wrapper" style={{ pointerEvents: 'none' }}>
    <div className="image-container bg-light w-100 shimmer-line"></div>
    <div className="product-info">
      <div className="bg-secondary opacity-25 w-50 h-5 mb-2 rounded shimmer-line" style={{ height: "12px" }}></div>
      <div className="bg-secondary opacity-25 w-100 h-6 mb-3 rounded shimmer-line" style={{ height: "20px" }}></div>
      <div className="bg-secondary opacity-25 w-75 h-6 mb-4 rounded shimmer-line" style={{ height: "40px" }}></div>
      <div className="mt-auto d-flex justify-content-between">
        <div className="bg-secondary opacity-25 w-25 h-8 rounded shimmer-line" style={{ height: "25px" }}></div>
        <div className="bg-secondary opacity-25 rounded-circle shimmer-line" style={{ width: "35px", height: "35px" }}></div>
      </div>
    </div>
  </div>
);

const ProductListView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });

  // Read URL State
  const qCategory = searchParams.get("category") || "";
  const qSearch = searchParams.get("search") || "";
  const qSortField = searchParams.get("sortField") || "createdAt";
  const qSortOrder = searchParams.get("sortOrder") || "desc";
  const qPage = parseInt(searchParams.get("page") || "1");
  const qMinPrice = searchParams.get("minPrice") || "";
  const qMaxPrice = searchParams.get("maxPrice") || "";

  useEffect(() => {
    // Fetch filter data
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${GLOBAL_API_URL}/category`);
        if (response.data?.success) {
          setCategories(response.data.data);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: qPage,
          limit: 12,
          sortField: qSortField,
          sortOrder: qSortOrder
        });

        if (qSearch) queryParams.append("search", qSearch);
        if (qCategory) queryParams.append("category", qCategory);
        if (qMinPrice) queryParams.append("minPrice", qMinPrice);
        if (qMaxPrice) queryParams.append("maxPrice", qMaxPrice);

        const response = await axios.get(`${GLOBAL_API_URL}/product?${queryParams.toString()}`);
        if (response.data?.success) {
          setProducts(response.data.data);
          setMeta(response.data.pagination);
        }
      } catch (err) {
        console.error("Error fetching products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [qPage, qSearch, qCategory, qSortField, qSortOrder, qMinPrice, qMaxPrice]);

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset page to 1 when changing filters
    if (key !== "page") newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const min = e.target.min.value;
    const max = e.target.max.value;
    const newParams = new URLSearchParams(searchParams);
    if (min) newParams.set("minPrice", min);
    else newParams.delete("minPrice");
    
    if (max) newParams.set("maxPrice", max);
    else newParams.delete("maxPrice");
    
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="products-container py-5 px-3 px-xl-5">
      <style>{productStyles}</style>

      {/* Hero Header */}
      <div className="container-fluid">
        <div className="catalog-hero d-flex justify-content-between align-items-center flex-wrap gap-4">
          <div>
            <h1 className="hero-title">{qSearch ? `Results for "${qSearch}"` : "The Curated Collection"}</h1>
            <p className="hero-subtitle mb-0">Discover exceptional quality pieces that define true craftsmanship. {meta.total} exclusive items available.</p>
          </div>
          
          <div className="d-flex align-items-center gap-3 bg-white bg-opacity-10 border border-white border-opacity-25 rounded-pill px-4 py-2 backdrop-blur">
            <span className="text-white fw-medium d-none d-sm-inline">Sort By</span>
            <select 
              className="premium-sort text-white border-0" 
              style={{ background: 'transparent' }}
              value={`${qSortField}-${qSortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                updateFilters("sortField", field);
                updateFilters("sortOrder", order);
              }}
            >
              <option value="createdAt-desc" className="text-dark">Newest Arrivals</option>
              <option value="price-asc" className="text-dark">Price: Low to High</option>
              <option value="price-desc" className="text-dark">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <div className="row g-5">
          {/* Filter Sidebar */}
          <div className="col-xl-3 d-none d-xl-block">
            <div className="filter-sidebar">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="filter-heading mb-0"><i className="bi bi-sliders me-2"></i> Refine By</h5>
                {(qCategory || qMinPrice || qMaxPrice || qSearch) && (
                  <button className="btn btn-sm btn-link text-danger text-decoration-none fw-bold" onClick={clearFilters}>Reset</button>
                )}
              </div>

              <div className="mb-5">
                <h6 className="fw-bolder mb-3 text-uppercase text-muted" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Categories</h6>
                <div className="d-flex flex-column gap-2" style={{ maxHeight: "350px", overflowY: "auto", paddingRight: '5px' }}>
                  <div className="form-check p-0 m-0">
                    <input className="form-check-input category-radio" type="radio" name="category" id="cat-all" checked={!qCategory} onChange={() => updateFilters("category", "")} />
                    <label className="category-label text-truncate w-100 m-0" htmlFor="cat-all">All Collections</label>
                  </div>
                  {categories.map((cat) => (
                    <div className="form-check p-0 m-0" key={cat._id}>
                      <input className="form-check-input category-radio" type="radio" name="category" id={`cat-${cat._id}`} checked={qCategory === cat._id} onChange={() => updateFilters("category", cat._id)} />
                      <label className="category-label text-truncate w-100 m-0" htmlFor={`cat-${cat._id}`}>{cat.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h6 className="fw-bolder mb-3 text-uppercase text-muted" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Price Range</h6>
                <form onSubmit={handlePriceApply}>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <input type="number" name="min" className="price-input w-100" placeholder="Min $" defaultValue={qMinPrice} min="0" />
                    <span className="text-muted fw-bold">-</span>
                    <input type="number" name="max" className="price-input w-100" placeholder="Max $" defaultValue={qMaxPrice} min="0" />
                  </div>
                  <button type="submit" className="apply-btn w-100">Apply Range</button>
                </form>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="col-12 col-xl-9">
            {loading ? (
               <div className="row g-4">
                 {Array.from({ length: 12 }).map((_, idx) => (
                   <div className="col-sm-6 col-md-4 col-lg-4" key={idx}>
                     <ProductCardSkeleton />
                   </div>
                 ))}
               </div>
            ) : products.length > 0 ? (
              <>
                <div className="row g-4 mb-5">
                  {products.map((product) => (
                    <div className="col-sm-6 col-md-4 col-lg-4" key={product._id}>
                      <div className="product-hover-card" onClick={() => navigate(`/product/${product._id}`)}>
                        <div className="image-container">
                          {product.discount > 0 && (
                            <span className="discount-badge">{product.discount}% OFF</span>
                          )}
                          <img 
                            src={product.images?.[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${DOMAIN_URL}${product.images[0]}`) : '/NO_IMG.png'} 
                            className="product-image" 
                            alt={product.name} 
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400' }} 
                          />
                          <div className="card-overlay">
                            <button className="quick-view-btn shadow" onClick={(e) => { e.stopPropagation(); navigate(`/product/${product._id}`); }}>
                              <i className="bi bi-cart-plus fs-5"></i> View Details
                            </button>
                          </div>
                        </div>
                        <div className="product-info">
                          <span className="product-category text-truncate">{product.category?.[0]?.name || "Premium"}</span>
                          <h3 className="product-title" title={product.name}>
                            {product.name.length > 45 ? `${product.name.substring(0, 45)}...` : product.name}
                          </h3>
                          <div className="product-price-row">
                            <span className="product-price">${parseFloat(product.price).toFixed(2)}</span>
                            <div className="d-flex align-items-center gap-1 bg-light rounded-pill px-2 py-1">
                              <i className="bi bi-star-fill text-warning" style={{fontSize: '0.8rem'}}></i>
                              <span className="small fw-bold text-dark">4.9</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {meta.pages > 1 && (
                  <nav aria-label="Catalog pagination" className="d-flex justify-content-center pt-3 pb-5">
                    <ul className="pagination premium-pagination mb-0">
                      <li className={`page-item ${qPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => updateFilters("page", String(qPage - 1))}>
                          <i className="bi bi-chevron-left"></i>
                        </button>
                      </li>
                      {Array.from({ length: meta.pages }).map((_, idx) => {
                        // Show current page, edges, and nearby pages (basic pagination logic)
                        if (idx === 0 || idx === meta.pages - 1 || Math.abs(idx + 1 - qPage) <= 1) {
                          return (
                            <li className={`page-item ${qPage === idx + 1 ? 'active' : ''}`} key={idx}>
                              <button className="page-link" onClick={() => updateFilters("page", String(idx + 1))}>{idx + 1}</button>
                            </li>
                          );
                        }
                        if (Math.abs(idx + 1 - qPage) === 2) {
                          return <li className="page-item disabled" key={idx}><span className="page-link shadow-none bg-transparent">...</span></li>;
                        }
                        return null;
                      })}
                      <li className={`page-item ${qPage === meta.pages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => updateFilters("page", String(qPage + 1))}>
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center bg-white rounded-5 shadow-sm border py-5 text-center h-100" style={{minHeight: "500px"}}>
                <div className="bg-light rounded-circle p-4 mb-4">
                  <i className="bi bi-search text-secondary opacity-50" style={{fontSize: '4rem'}}></i>
                </div>
                <h3 className="fw-bolder mb-2 text-dark">No Products Found</h3>
                <p className="text-muted mb-4 lead" style={{maxWidth: '400px'}}>We couldn't find anything matching your currect filters. Try adjusting your search criteria or explore our collections.</p>
                <button className="apply-btn px-5 rounded-pill" onClick={clearFilters}>Reset Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListView;
