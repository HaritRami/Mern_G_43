import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL as GLOBAL_API_URL, DOMAIN_URL } from "../../config/apiConfig";

const ProductCardSkeleton = () => (
  <div className="card h-100 shadow-sm border-0 shimmer-wrapper">
    <div className="bg-secondary opacity-25 shimmer-line" style={{ height: "200px" }}></div>
    <div className="card-body">
      <div className="bg-secondary opacity-25 w-75 h-6 mb-2 rounded shimmer-line" style={{ height: "20px" }}></div>
      <div className="bg-secondary opacity-25 w-50 h-5 mb-3 rounded shimmer-line" style={{ height: "16px" }}></div>
      <div className="bg-secondary opacity-25 w-100 h-8 rounded shimmer-line" style={{ height: "35px" }}></div>
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
    <div className="container-fluid py-4 bg-light min-vh-100">
      <style>{`
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
        .product-hover-card { transition: all 0.2s ease; border: 1px solid transparent; }
        .product-hover-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.08); border-color: #dee2e6; }
      `}</style>
      
      {/* Header Row */}
      <div className="row mb-4">
        <div className="col-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/">Home</Link></li>
              <li className="breadcrumb-item active">All Products</li>
            </ol>
          </nav>
          <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm border">
            <div>
              <h1 className="h4 mb-0 fw-bold">Explore Categories</h1>
              <small className="text-muted">{meta.total} Products Available</small>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted d-none d-md-inline">Sort by:</span>
              <select 
                className="form-select border-0 bg-light" 
                value={`${qSortField}-${qSortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  updateFilters("sortField", field);
                  updateFilters("sortOrder", order);
                }}
              >
                <option value="createdAt-desc">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Left Filter Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="bg-white p-4 rounded shadow-sm border">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0 fw-bold"><i className="bi bi-funnel"></i> Filters</h5>
              {(qCategory || qMinPrice || qMaxPrice) && (
                <button className="btn btn-sm btn-outline-danger shadow-none" onClick={clearFilters}>Clear</button>
              )}
            </div>

            <hr />

            {/* Categories */}
            <div className="mb-4">
              <h6 className="fw-bold mb-3">Categories</h6>
              <div className="d-flex flex-column gap-2" style={{ maxHeight: "300px", overflowY: "auto" }}>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="category" id="cat-all" checked={!qCategory} onChange={() => updateFilters("category", "")} />
                  <label className="form-check-label" htmlFor="cat-all">All Categories</label>
                </div>
                {categories.map((cat) => (
                  <div className="form-check" key={cat._id}>
                    <input className="form-check-input" type="radio" name="category" id={`cat-${cat._id}`} checked={qCategory === cat._id} onChange={() => updateFilters("category", cat._id)} />
                    <label className="form-check-label text-truncate w-100" htmlFor={`cat-${cat._id}`}>{cat.name}</label>
                  </div>
                ))}
              </div>
            </div>

            <hr />

            {/* Price Filter */}
            <div className="mb-4">
              <h6 className="fw-bold mb-3">Price Range</h6>
              <form onSubmit={handlePriceApply}>
                <div className="row g-2 align-items-center mb-2">
                  <div className="col-5">
                    <input type="number" name="min" className="form-control form-control-sm" placeholder="Min" defaultValue={qMinPrice} min="0" />
                  </div>
                  <div className="col-2 text-center text-muted">-</div>
                  <div className="col-5">
                    <input type="number" name="max" className="form-control form-control-sm" placeholder="Max" defaultValue={qMaxPrice} min="0" />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-sm w-100">Apply Filter</button>
              </form>
            </div>

          </div>
        </div>

        {/* Right Product Grid */}
        <div className="col-lg-9">
          {loading ? (
             <div className="row g-4">
               {Array.from({ length: 8 }).map((_, idx) => (
                 <div className="col-sm-6 col-md-4 col-xl-3" key={idx}>
                   <ProductCardSkeleton />
                 </div>
               ))}
             </div>
          ) : products.length > 0 ? (
            <>
              <div className="row g-4 mb-5">
                {products.map((product) => (
                  <div className="col-sm-6 col-md-4 col-xl-3" key={product._id}>
                    <div className="card h-100 bg-white product-hover-card" onClick={() => navigate(`/product/${product._id}`)} style={{ cursor: "pointer" }}>
                      <div className="position-relative overflow-hidden bg-light" style={{ height: "200px" }}>
                        <img 
                          src={product.images?.[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${DOMAIN_URL}${product.images[0]}`) : '/NO_IMG.png'} 
                          className="w-100 h-100 object-fit-contain p-3" 
                          alt={product.name} 
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/200' }} 
                        />
                        {product.discount > 0 && (
                          <span className="position-absolute top-0 end-0 badge bg-danger m-2 p-2 shadow-sm rounded-pill px-3">
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>
                      <div className="card-body d-flex flex-column">
                        <small className="text-muted text-truncate d-block mb-1">{product.category?.[0]?.name}</small>
                        <h6 className="card-title text-truncate fw-bold mb-2" title={product.name}>{product.name}</h6>
                        <div className="mt-auto d-flex justify-content-between align-items-center">
                          <span className="text-primary fw-bold fs-5">${product.price}</span>
                          <button className="btn btn-sm btn-light rounded-circle text-primary border" onClick={(e) => { e.stopPropagation(); navigate(`/product/${product._id}`); }}>
                            <i className="bi bi-cart"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {meta.pages > 1 && (
                <nav aria-label="Page navigation" className="d-flex justify-content-center pb-5">
                  <ul className="pagination shadow-sm">
                    <li className={`page-item ${qPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => updateFilters("page", String(qPage - 1))}>Previous</button>
                    </li>
                    {Array.from({ length: meta.pages }).map((_, idx) => (
                      <li className={`page-item ${qPage === idx + 1 ? 'active' : ''}`} key={idx}>
                        <button className="page-link" onClick={() => updateFilters("page", String(idx + 1))}>{idx + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${qPage === meta.pages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => updateFilters("page", String(qPage + 1))}>Next</button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center bg-white rounded shadow-sm border py-5 text-center h-100 min-vh-50">
              <i className="bi bi-search text-muted" style={{ fontSize: "4rem" }}></i>
              <h4 className="mt-3 fw-bold">No Products Found</h4>
              <p className="text-muted mb-4">Try adjusting your filters or search terms.</p>
              <button className="btn btn-primary px-4" onClick={clearFilters}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListView;
