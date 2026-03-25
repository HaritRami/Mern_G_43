import { API_URL as GLOBAL_API_URL } from '../config/apiConfig';
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const ribbonStyles = `
  .top-ribbon {
    background-color: #ffffff;
    box-shadow: 0 4px 15px -10px rgba(0,0,0,0.1);
    position: relative;
    z-index: 1020;
    transition: all 0.3s ease;
  }
  .category-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-radius: 0 0 16px 16px;
    transition: all 0.3s ease;
  }
  .category-btn:hover, .category-btn:focus {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    color: white;
  }
  .mega-menu {
    border: 1px solid rgba(0,0,0,0.05);
    border-top: none;
    padding: 1rem 0;
    margin-top: 0 !important;
    border-radius: 0 0 16px 16px;
    min-width: 280px;
    animation: slideDown 0.3s ease-out forwards;
    transform-origin: top center;
  }
  @keyframes slideDown {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .mega-menu-item {
    font-weight: 600;
    color: #4a5568;
    padding: 0.75rem 1.5rem;
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
  }
  .mega-menu-item:hover {
    background-color: #f8fafc;
    color: #667eea;
    border-left-color: #667eea;
  }
  .ribbon-link {
    font-weight: 600;
    color: #4a5568;
    padding: 0.5rem 0;
    position: relative;
    transition: color 0.3s ease;
    font-size: 0.95rem;
  }
  .ribbon-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0%;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
  .ribbon-link:hover {
    color: #1a202c;
  }
  .ribbon-link:hover::after {
    width: 100%;
  }
  .hot-deals {
    font-weight: 800;
    color: #ef4444;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: transform 0.2s ease;
  }
  .hot-deals:hover {
    transform: scale(1.05);
    color: #dc2626;
  }
  .fire-icon {
    animation: flicker 2s infinite alternate;
  }
  @keyframes flicker {
    0% { transform: scale(1); opacity: 0.9; }
    100% { transform: scale(1.1); opacity: 1; text-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }
  }
`;

const TopMenu = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${GLOBAL_API_URL}/category`);
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      <style>{ribbonStyles}</style>
      <div className="top-ribbon border-bottom d-none d-lg-block">
        <div className="container-fluid px-lg-4">
          <div className="d-flex align-items-center justify-content-between">
            
            <div className="d-flex align-items-center gap-5">
              {/* Mega Menu / All Categories Dropdown */}
              <div className="nav-item dropdown">
                <button 
                  className="btn category-btn d-flex justify-content-between align-items-center px-4 py-3 shadow-sm" 
                  id="categoryDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                  style={{ width: '280px' }}
                >
                  <span className="d-flex align-items-center gap-2">
                    <i className="bi bi-grid-3x3-gap-fill"></i> Shop By Category
                  </span>
                  <i className="bi bi-chevron-down small"></i>
                </button>
                <ul className="dropdown-menu shadow-lg mega-menu w-100" aria-labelledby="categoryDropdown">
                  <li>
                    <Link className="dropdown-item mega-menu-item d-flex justify-content-between align-items-center" to="/products">
                      <span><i className="bi bi-collection-fill text-muted me-2 border rounded p-1"></i> All Products</span>
                      <i className="bi bi-arrow-right-short text-muted"></i>
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider my-2" /></li>
                  {loading ? (
                    <li><span className="dropdown-item text-muted text-center py-3">Loading categories...</span></li>
                  ) : (
                    categories.map((cat) => (
                      <li key={cat._id}>
                        <Link className="dropdown-item mega-menu-item d-flex justify-content-between align-items-center" to={`/products?category=${cat._id}`}>
                          <span>{cat.name}</span>
                          <i className="bi bi-chevron-right small text-muted opacity-50"></i>
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Pinned Categories (Horizontal Ribbon) */}
              <ul className="navbar-nav d-flex flex-row gap-4 mb-0 list-unstyled">
                {categories.slice(0, 6).map((cat) => (
                  <li className="nav-item" key={`pinned-${cat._id}`}>
                    <Link className="text-decoration-none ribbon-link" to={`/products?category=${cat._id}`}>
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Side Promo Links */}
            <div className="d-flex align-items-center gap-4 pe-3">
              <Link to="/products" className="text-decoration-none hot-deals">
                <i className="bi bi-fire fire-icon fs-5"></i> Special Offers
              </Link>
              <div className="vr d-none d-lg-block opacity-25" style={{height: '24px'}}></div>
              <Link to="/products" className="text-decoration-none ribbon-link">
                New Arrivals
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Top Menu Version (Clean & Minimal) */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-2 d-lg-none shadow-sm">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold text-dark d-flex align-items-center gap-2" to="/products">
             <i className="bi bi-grid-3x3-gap-fill text-primary"></i> Browse Categories
          </Link>
          <button
            className="navbar-toggler border-0 shadow-none focus-ring focus-ring-light text-primary"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mobileCategoryMenu"
            aria-controls="mobileCategoryMenu"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="bi bi-list fs-1"></i>
          </button>
          <div className="collapse navbar-collapse mt-3" id="mobileCategoryMenu">
            <ul className="navbar-nav w-100">
              <li className="nav-item mb-2 bg-light rounded-3 px-2">
                <Link className="nav-link fw-bold text-primary d-flex justify-content-between align-items-center" to="/products">
                  All Products <i className="bi bi-arrow-right-short fs-4"></i>
                </Link>
              </li>
              {loading ? (
                <li className="nav-item p-2 text-muted">Loading...</li>
              ) : (
                categories.map((cat) => (
                  <li className="nav-item border-bottom" key={`mobile-${cat._id}`}>
                    <Link
                      className="nav-link text-dark py-3 fw-medium"
                      to={`/products?category=${cat._id}`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default TopMenu;
