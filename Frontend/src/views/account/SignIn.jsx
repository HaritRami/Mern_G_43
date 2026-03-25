import { API_URL as GLOBAL_API_URL } from '../../config/apiConfig';
import { lazy } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate for redirecting
import { useUser } from "../../context/UserContext"; // Import useUser hook
const SignInForm = lazy(() => import("../../components/account/SignInForm"));


const SignInView = () => {
  const navigate = useNavigate(); // Initialize navigate for redirection
  const { login } = useUser(); // Get login function from context

  const onSubmit = async (values) => {
    const { email, password } = values;

    try {
      const response = await fetch(`${GLOBAL_API_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({
          email: email, // Your API expects email, but form has mobileNo
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Login successful
        login(data.data.user); // Update context with user data
        
        // Check user role and redirect accordingly
        if (data.data.user.role === 'Admin') {
          navigate('/admin');
        } else if (data.data.user.role === 'Seller') {
          navigate('/seller');
        } else {
          navigate('/home'); // Redirect regular users to home page
        }
      } else {
        // Show error message
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-xl-10">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="row g-0">
              {/* Premium Left Info Panel */}
              <div className="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center text-white p-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="text-center">
                  <h1 className="display-5 fw-bold mb-4">Welcome Back!</h1>
                  <p className="lead mb-4">
                    Sign in to track your orders, manage your wishlist, and unlock exclusive NexaMart deals tailored just for you.
                  </p>
                  <div className="d-flex justify-content-center gap-3 mt-4 opacity-75">
                    <i className="bi bi-shield-check display-6"></i>
                    <i className="bi bi-truck display-6"></i>
                    <i className="bi bi-credit-card display-6"></i>
                  </div>
                </div>
              </div>
              
              {/* Right Form Container */}
              <div className="col-md-6 bg-white p-4 p-md-5">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                    <i className="bi bi-person-circle fs-2 text-primary"></i>
                  </div>
                  <div>
                    <h2 className="fw-bold mb-0">Sign In</h2>
                    <p className="text-muted small mb-0">Access your NexaMart account</p>
                  </div>
                </div>
                
                <div className="px-lg-2">
                  <SignInForm onSubmit={onSubmit} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInView;
