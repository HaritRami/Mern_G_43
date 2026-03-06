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
      const response = await fetch(`http://localhost:5000/api/user/login`, {
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
        
        // Check if user is admin and redirect accordingly
        if (data.data.user.role === 'Admin') {
          navigate('/admins');
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
    <div className="container my-3">
      <div className="row border">
        <div className="col-md-6 bg-light bg-gradient p-3 d-none d-md-block">
          <Link to="/">
            <img
              src="../../images/banner/Dell.webp"
              alt="..."
              className="img-fluid"
            />
          </Link>
          <Link to="/">
            <img
              src="../../images/banner/Laptops.webp"
              alt="..."
              className="img-fluid"
            />
          </Link>
        </div>
        <div className="col-md-6 p-3">
          <h4 className="text-center">Sign In</h4>
          <SignInForm onSubmit={onSubmit} />
        </div>
      </div>
    </div>
  );
};

export default SignInView;
