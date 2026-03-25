import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Try to parse the user session statically from local memory
  const getAuthStatus = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return false;
      const parsedUser = JSON.parse(storedUser);
      // Ensure the tokens object naturally exists
      return parsedUser && parsedUser.tokens && parsedUser.tokens.accessToken;
    } catch {
      return false;
    }
  };

  const isAuthenticated = getAuthStatus();

  if (!isAuthenticated) {
    // Redirect cleanly to login, remembering where they were trying to go!
    return <Navigate to="/account/signin" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
