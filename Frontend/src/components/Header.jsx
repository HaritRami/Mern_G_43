import { lazy } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
const Search = lazy(() => import("./Search"));

// Add logo styles
const logoStyles = `
  .brand-logo {
    font-size: 1.8rem;
    font-weight: 700;
    color: #2d3748;
    text-decoration: none;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
    transition: opacity 0.2s ease;
  }

  .brand-logo:hover {
    opacity: 0.9;
  }
`;

const Header = () => {
  const { isAuthenticated, user, logout } = useUser();

  // Function to check if user exists in localStorage
  const checkAccessToken = () => {
    return localStorage.getItem('user') ? true : false;
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}user/logout`, {
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
      <style>{logoStyles}</style>
      <header className="p-3 border-bottom bg-light">
        <div className="container-fluid">
          <div className="row g-3">
            <div className="col-md-3 text-center">
              <Link to="/" className="brand-logo">
                Nexa Mart
              </Link>
            </div>
            <div className="col-md-5">
              <Search />
            </div>
            <div className="col-md-4">
              <div className="position-relative d-inline me-3">
                <Link to="/cart" className="btn btn-primary">
                  <i className="bi bi-cart3"></i>
                  <div className="position-absolute top-0 start-100 translate-middle badge bg-danger rounded-circle">
                    
                  </div>
                </Link>
              </div>
              
              {checkAccessToken() ? (
                // Show user profile when access token exists
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn btn-secondary rounded-circle border me-3"
                    data-toggle="dropdown"
                    aria-expanded="false"
                    aria-label="Profile"
                    data-bs-toggle="dropdown"
                  >
                    <i className="bi bi-person-fill text-light"></i>
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <Link className="dropdown-item" to="/account/profile">
                        <i className="bi bi-person-square"></i> {user?.name || 'My Profile'}
                      </Link>
                    </li>
                    <li>
                      <button 
                        className="dropdown-item" 
                        onClick={handleLogout}
                      >
                        <i className="bi bi-door-closed-fill text-danger"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                // Show login/signup links when no access token
                <div className="d-inline">
                  <Link to="/account/signin" className="btn btn-outline-primary me-2">Sign In</Link>
                  <Link to="/account/signup" className="btn btn-primary">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
