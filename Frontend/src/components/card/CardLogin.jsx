import React from "react";
import { Link } from "react-router-dom";

const CardLogin = (props) => {
  // Function to check if user exists and get user data
  const checkUser = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  };

  const user = checkUser();

  return (
    <div className={`card shadow-sm ${props.className}`}>
      <div className="card-body text-center">
        {user ? (
          <>
            <h5 className="card-title">Welcome back!</h5>
            <p className="card-text">
              Hello, {user.name || 'Valued Customer'}
            </p>
          </>
        ) : (
          <>
            <h5 className="card-title">Sign in for your best experience</h5>
            <Link to="account/signin" className="btn btn-warning">
              Sign in securely
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default CardLogin;
