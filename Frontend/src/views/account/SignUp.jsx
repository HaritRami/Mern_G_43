import { API_URL as GLOBAL_API_URL } from '../../config/apiConfig';
import { lazy } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import Swal from "sweetalert2";

const SignUpForm = lazy(() => import("../../components/account/SignUpForm"));

const SignUpView = () => {
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      console.log("Submitting form data:", formData); // Debug log

      const response = await fetch(`${GLOBAL_API_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          mobile: formData.mobile || null
        }),
      });

      const data = await response.json();
      console.log("Response from server:", data); // Debug log

      if (data.success) {
        // Store user data in context
        login(data.data.user);
        Swal.fire({
          text: "Registration successful! Please sign in to continue.",
          icon: "success",
        });
        navigate('/account/signin');
      } else {
        Swal.fire({
          title: "Registration failed!",
          text: data.message || 'Please try again.',
          icon: "error",
        }); 
      }
    } catch (error) {
      console.error('Registration error:', error);
      Swal.fire({
        title: "Registration failed!",
        text: "An error occurred during registration. Please try again.",
        icon: "error",
      });
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-xl-10">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="row g-0">
              {/* Premium Left Info Panel */}
              <div className="col-md-5 d-none d-md-flex flex-column justify-content-center text-white p-5" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <div>
                  <h1 className="display-6 fw-bold mb-4">Join NexaMart Today</h1>
                  <p className="lead mb-4">
                    Create your account to experience hyper-fast checkouts, curated product discovery, and dedicated 24/7 support.
                  </p>
                  <ul className="list-unstyled mt-5">
                    <li className="mb-3"><i className="bi bi-check-circle-fill text-white shadow-sm me-2"></i> Free Nationwide Shipping</li>
                    <li className="mb-3"><i className="bi bi-check-circle-fill text-white shadow-sm me-2"></i> 30-Day Easy Returns</li>
                    <li className="mb-3"><i className="bi bi-check-circle-fill text-white shadow-sm me-2"></i> Exclusive Member Rewards</li>
                  </ul>
                </div>
              </div>
              
              {/* Right Form Container */}
              <div className="col-md-7 bg-white p-4 p-md-5">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                    <i className="bi bi-person-plus-fill fs-2 text-danger"></i>
                  </div>
                  <div>
                    <h2 className="fw-bold mb-0">Create Account</h2>
                    <p className="text-muted small mb-0">It only takes a minute!</p>
                  </div>
                </div>
                
                <div className="px-lg-2">
                  <SignUpForm onSubmit={handleSubmit} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpView;
