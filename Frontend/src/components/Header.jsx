import { lazy } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { API_URL as GLOBAL_API_URL } from '../config/apiConfig';
const Search = lazy(() => import("./Search"));

// Add logo & header hover styles natively
const headerStyles = `
  .brand-logo {
    font-size: 1.8rem;
    font-weight: 800;
    color: #2d3748;
    text-decoration: none;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
    transition: opacity 0.2s ease;
  }

  .brand-logo:hover {
    opacity: 0.85;
  }

  .nav-btn-action {
    transition: all 0.2s ease;
  }
  
  .nav-btn-action:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  .dropdown-menu {
    border: none;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    border-radius: 12px;
    padding: 0.5rem;
  }
  
  .dropdown-item {
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .dropdown-item:hover {
    background-color: #f8f9fa;
  }
  
  .navbar-toggler:focus {
    box-shadow: none;
  }
`;

const Header = () => {
  const { isAuthenticated, user, logout } = useUser();

  // checkAccessToken: prefer context isAuthenticated, fall back to localStorage presence
  const checkAccessToken = () => {
    return isAuthenticated || !!localStorage.getItem('user');
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`/api/user/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        logout(); // Clear context and local storage
        window.location.href = '/'; // Refresh page to reset state
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <style>{headerStyles}</style>
      <nav className="navbar navbar-expand-lg bg-white sticky-top shadow-sm py-2">
        <div className="container-fluid px-lg-4">

          {/* Logo Section */}
          <Link to="/" className="navbar-brand brand-logo d-flex align-items-center">
            Nexa Mart
          </Link>

          {/* Mobile Collapse Toggle */}
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Collapsible Content */}
          <div className="collapse navbar-collapse" id="navbarContent">

            {/* Center Search Bar */}
            <div className="mx-auto w-100 mt-3 mt-lg-0 px-lg-4" style={{ maxWidth: '600px' }}>
              <Search />
            </div>

            {/* Right Action Icons */}
            <div className="d-flex align-items-center gap-3 ms-lg-auto mt-3 mt-lg-0 justify-content-center justify-content-lg-end">

              {/* Always Visible Cart Feature */}
              <Link to="/cart" className="btn btn-primary rounded-pill px-3 nav-btn-action position-relative d-flex align-items-center">
                <i className="bi bi-cart3 fs-5"></i>
                <span className="ms-2 d-none d-lg-inline fw-semibold">Cart</span>
                <span className="position-absolute top-0 start-100 translate-middle badge bg-danger border border-light rounded-circle p-1">
                  <span className="visually-hidden">unread messages</span>
                </span>
              </Link>

              {/* Conditional Authentication Menu */}
              {checkAccessToken() ? (
                // Authenticated Profile Dropdown
                <div className="nav-item dropdown">
                  <button
                    className="btn btn-light rounded-circle border shadow-sm d-flex align-items-center justify-content-center p-0 nav-btn-action position-relative overflow-hidden"
                    style={{ width: '42px', height: '42px' }}
                    id="userDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {user?.avatar ? (
                      <img
                        src={`${GLOBAL_API_URL.replace('/api', '')}${user.avatar}?t=${user._avatarVersion || ''}`}
                        alt="Profile"
                        className="w-100 h-100 object-fit-cover"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                      />
                    ) : null}
                    <i className="bi bi-person-fill fs-5 text-secondary" style={{ display: user?.avatar ? 'none' : 'block' }}></i>
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end mt-2 animate slideIn" aria-labelledby="userDropdown">
                    <li>
                      <Link className="dropdown-item d-flex align-items-center" to="/account/profile">
                        <i className="bi bi-person-circle fs-5 me-3 text-secondary"></i>
                        <span className="text-truncate" style={{ maxWidth: '150px' }}>
                          {user?.name || 'My Profile'}
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center" to="/account/orders">
                        <i className="bi bi-box-seam-fill fs-5 me-3 text-primary"></i>
                        My Orders
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center" to="/account/orders">
                        <i className="bi bi-geo-alt-fill fs-5 me-3 text-success"></i>
                        Track Order
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider my-2" /></li>
                    <li>
                      <button className="dropdown-item d-flex align-items-center text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right fs-5 me-3"></i>
                        <span className="fw-bold">Logout</span>
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                // Guest Login Links
                <div className="d-flex gap-2">
                  <Link to="/account/signin" className="btn btn-outline-primary rounded-pill px-4 fw-bold nav-btn-action">
                    Sign In
                  </Link>
                  <Link to="/account/signup" className="btn btn-primary rounded-pill px-4 fw-bold nav-btn-action">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
