import { Navigate } from "react-router-dom";

/**
 * Helper — reads the logged-in user's role from localStorage.
 * Handles both flat  { role, tokens }  and nested  { data: { role }, tokens }  shapes.
 */
const getUserRole = () => {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.role || parsed?.data?.role || null;
  } catch {
    return null;
  }
};

/**
 * Helper — checks whether a valid access token exists in localStorage.
 */
const isLoggedIn = () => {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return !!(parsed?.tokens?.accessToken);
  } catch {
    return false;
  }
};

/**
 * PublicOnlyRoute
 *
 * Wraps pages that should ONLY be visible to unauthenticated users:
 *   /account/signin, /account/signup, /account/forgotpassword
 *
 * If the user is already logged in, redirect them straight to their
 * role-appropriate dashboard so they never see the login/register forms.
 *
 * Role → Dashboard:
 *   Admin  → /admin
 *   Seller → /seller
 *   User   → /home
 */
const PublicOnlyRoute = ({ children }) => {
  const loggedIn = isLoggedIn();
  const role     = getUserRole();

  if (loggedIn) {
    // Send them to the right place based on their role
    if (role === "Admin")  return <Navigate to="/admin"  replace />;
    if (role === "Seller") return <Navigate to="/seller" replace />;
    return <Navigate to="/home" replace />;
  }

  // Not logged in — show the public page normally
  return children;
};

export default PublicOnlyRoute;
