import { lazy } from "react";
import { Link } from "react-router-dom";
const Search = lazy(() => import("../../components/Search"));

const NotFoundView = () => {
  return (
    <div className="container text-center py-5 min-vh-50 d-flex flex-column justify-content-center align-items-center">
      <div className="display-1 fw-bold text-secondary mb-3">
        <i className="bi bi-exclamation-triangle-fill text-warning me-3" />
        404
      </div>
      <h1 className="mb-4">Oops... Page Not Found!</h1>
      <p className="text-muted mb-4 max-w-md mx-auto">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
      
      <div className="mb-5">
        <Link to="/" className="btn btn-primary px-4 py-2 fw-bold shadow-sm">
          <i className="bi bi-house-door me-2"></i> Go to Home
        </Link>
      </div>

      <div className="row justify-content-md-center w-100">
        <div className="col-md-6 text-center">
          <p className="text-muted small mb-3">Or try searching our catalog:</p>
          <Search />
        </div>
      </div>
    </div>
  );
};

export default NotFoundView;
