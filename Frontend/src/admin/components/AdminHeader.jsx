import React, { useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";


const AdminDashboard = ({ children }) => {
  const { isAuthenticated, user, logout } = useUser();
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

  const toggleSidebarBtnRef = useRef(null);
  const location = useLocation(); // Get the current URL path

  useEffect(() => {
    const button = toggleSidebarBtnRef.current;
    if (button) {
      const handleClick = () => {
        document.body.classList.toggle("toggle-sidebar");
      };
      button.addEventListener("click", handleClick);
      return () => button.removeEventListener("click", handleClick);
    }
  }, []);

  useEffect(() => {
    const button = toggleSidebarBtnRef.current;
    if (button) {
      const handleClick = () => {
        document.body.classList.toggle("toggle-sidebar");
      };
      button.addEventListener("click", handleClick);
      return () => button.removeEventListener("click", handleClick);
    }
  }, []);
  const savedUser = JSON.parse(localStorage.getItem("user"));
  return (
    <>
      {/* Header */}
      <header id="header" className="header fixed-top d-flex align-items-center">
        <div className="d-flex align-items-center justify-content-between">
          <a href="index.html" className="logo d-flex align-items-center">
            <img src="assets/img/logo.png" alt="logo" />
            <span className="d-none d-lg-block">Nexa Mart</span>
          </a>
        </div>

        {/* Profile & Icons */}
        <nav className="header-nav ms-auto">
          <ul className="d-flex align-items-center">
            <li className="nav-item dropdown pe-3">
              <a className="nav-link nav-profile d-flex align-items-center" href="#" data-bs-toggle="dropdown">
                <img
                  src={savedUser?.avatar ? `http://localhost:5000${savedUser.avatar}` : "assets/img/profile-img.jpg"}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: "36px", height: "36px", objectFit: "cover" }}
                />
                <span className="d-none d-md-block dropdown-toggle ps-2">{savedUser.name}</span>
              </a>
              <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
                <li className="dropdown-header text-center">
                  <div className="d-flex flex-column align-items-center">
                    <img
                      src={savedUser?.avatar ? `http://localhost:5000${savedUser.avatar}` : "assets/img/profile-img.jpg"}
                      alt="Profile"
                      className="rounded-circle mb-2"
                      style={{ width: "64px", height: "64px", objectFit: "cover" }}
                    />
                    <h6 className="mb-0">{savedUser.name}</h6>
                    <div className="mt-2 d-flex align-items-center">
                      <span className="me-2">{savedUser.role}</span>
                      {savedUser.status === "Active" ? (
                        <i className="bi bi-check-circle-fill text-success"></i>
                      ) : (
                        <i className="bi bi-x-circle-fill text-danger"></i>
                      )}
                    </div>
                  </div>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link className="dropdown-item d-flex align-items-center" to="/profile">
                    <i className="bi bi-person" />
                    <span>My Profile</span>
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <a className="dropdown-item d-flex align-items-center" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right" />
                    <span>Sign Out</span>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </header>
      <aside id="sidebar" className="sidebar">
        <ul className="sidebar-nav" id="sidebar-nav">
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname !== "/seller" ? "collapsed" : ""}`} to="/seller">
              <i className="bi bi-grid"></i>
              <span>Dashboard</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link className={`nav-link ${location.pathname !== "/products" ? "collapsed" : ""}`} to="/products">
              <i className="bi bi-box-seam"></i>
              <span>All Products</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link className={`nav-link ${location.pathname !== "/categories" ? "collapsed" : ""}`} to="/categories">
              <i className="bi bi-list-check"></i>
              <span>Categories</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link className={`nav-link ${location.pathname !== "/orders" ? "collapsed" : ""}`} to="/orders">
              <i className="bi bi-cart"></i>
              <span>Orders</span>
            </Link>
          </li>

          {/* <li className="nav-item">
            <Link className={`nav-link ${location.pathname !== "/users" ? "collapsed" : ""}`} to="/users">
              <i className="bi bi-file-person"></i>
              <span>Users</span>
            </Link>
          </li> */}

          {/* <li className="nav-item">
            <Link className={`nav-link ${location.pathname !== "/support" ? "collapsed" : ""}`} to="/support">
              <i className="bi bi-question-circle"></i>
              <span>Support</span>
            </Link>
          </li> */}
        </ul>
      </aside>

      {/* Main Content Area */}
      <main className="main">
        {children}
      </main>
    </>
  );
};

export default AdminDashboard;
