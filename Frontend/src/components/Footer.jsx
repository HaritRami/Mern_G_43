import { Link } from "react-router-dom";

const footerStyles = `
  .footer-wrapper {
    background-color: #1a1e23;
    color: #e2e8f0;
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  .footer-link {
    color: #a0aec0;
    text-decoration: none;
    transition: color 0.2s ease, transform 0.2s ease;
    display: inline-block;
  }
  
  .footer-link:hover {
    color: #fff;
    transform: translateX(3px);
  }
  
  .social-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.05);
    border-radius: 50%;
    color: #fff;
    transition: all 0.3s ease;
    text-decoration: none;
  }
  
  .social-icon:hover {
    background: #667eea;
    color: #fff;
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }

  .footer-title {
    color: #fff;
    font-weight: 700;
    letter-spacing: 0.5px;
    position: relative;
    padding-bottom: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .footer-title::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 2px;
  }

  .bottom-bar {
    background-color: #111418;
    border-top: 1px solid rgba(255,255,255,0.05);
  }
  
  .contact-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1rem;
    color: #a0aec0;
  }
  
  .contact-icon {
    color: #667eea;
    margin-right: 1rem;
    font-size: 1.2rem;
  }
`;

const Footer = () => {
  return (
    <footer className="footer-wrapper pt-5 mt-auto">
      <style>{footerStyles}</style>
      
      {/* Main Footer Content */}
      <div className="container pb-5">
        <div className="row g-4 justify-content-between">
          
          {/* Column 1: About & Logo */}
          <div className="col-lg-4 col-md-6 pe-lg-5">
            <h5 className="footer-title">Nexa Mart</h5>
            <p className="text-secondary lh-lg mb-4" style={{ fontSize: '0.95rem' }}>
              Your ultimate destination for discovering premium products. 
              We blend industry-leading technology heavily with exceptional customer 
              service to bring you a seamless shopping experience from click to delivery.
            </p>
            <div className="d-flex gap-2 mt-4">
              <Link to="/" className="social-icon" title="Twitter"><i className="bi bi-twitter-x"></i></Link>
              <Link to="/" className="social-icon" title="Facebook"><i className="bi bi-facebook"></i></Link>
              <Link to="/" className="social-icon" title="Instagram"><i className="bi bi-instagram"></i></Link>
              <Link to="/" className="social-icon" title="Apple App"><i className="bi bi-apple"></i></Link>
              <Link to="/" className="social-icon" title="Android App"><i className="bi bi-android2"></i></Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-lg-2 col-md-6">
            <h5 className="footer-title">Quick Links</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li><Link to="/" className="footer-link">Home Portfolio</Link></li>
              <li><Link to="/products" className="footer-link">All Products</Link></li>
              <li><Link to="/cart" className="footer-link">Shopping Cart</Link></li>
              <li><Link to="/account/orders" className="footer-link">My Orders</Link></li>
              <li><Link to="/account/orders" className="footer-link">Track Shipment</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div className="col-lg-2 col-md-6">
            <h5 className="footer-title">Support</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li><Link to="/" className="footer-link">Return Policy</Link></li>
              <li><Link to="/" className="footer-link">Terms of Use</Link></li>
              <li><Link to="/" className="footer-link">Security Policies</Link></li>
              <li><Link to="/" className="footer-link">Privacy Standards</Link></li>
              <li><Link to="/" className="footer-link">EPR Compliance</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Address */}
          <div className="col-lg-3 col-md-6">
            <h5 className="footer-title">Contact Us</h5>
            <div className="contact-item">
              <i className="bi bi-geo-alt-fill contact-icon"></i>
              <div>
                <strong className="text-light d-block mb-1">Headquarters</strong>
                1355 Market St, Suite 900<br/>San Francisco, CA 94103
              </div>
            </div>
            <div className="contact-item">
              <i className="bi bi-telephone-fill contact-icon"></i>
              <div>
                <strong className="text-light d-block mb-1">Customer Care</strong>
                +1 (800) 100 1000
              </div>
            </div>
            <div className="contact-item">
              <i className="bi bi-envelope-fill contact-icon"></i>
              <div>
                <strong className="text-light d-block mb-1">Email Support</strong>
                info@nexamart.com
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Partners & Affiliates Bar */}
      <div className="container-fluid" style={{ backgroundColor: '#16191d' }}>
          <div className="container py-3">
             <div className="row align-items-center text-center text-md-start">
                 <div className="col-md-6 d-flex flex-wrap justify-content-center justify-content-md-start gap-4 mb-3 mb-md-0">
                    <Link to="/" className="text-secondary text-decoration-none small fw-semibold link-light">
                      <i className="bi bi-briefcase-fill text-warning me-2"></i> Partner With Us
                    </Link>
                    <Link to="/" className="text-secondary text-decoration-none small fw-semibold link-light">
                      <i className="bi bi-badge-ad-fill text-info me-2"></i> Advertise
                    </Link>
                    <Link to="/" className="text-secondary text-decoration-none small fw-semibold link-light">
                      <i className="bi bi-gift-fill text-danger me-2"></i> Gift Cards
                    </Link>
                 </div>
                 <div className="col-md-6 d-flex flex-wrap justify-content-center justify-content-md-end gap-2 px-3">
                    <img src="../../images/payment/visa.webp" width="36" alt="Visa" className="bg-white rounded p-1"/>
                    <img src="../../images/payment/american_express.webp" width="36" alt="Amex" className="bg-white rounded p-1"/>
                    <img src="../../images/payment/maestro.webp" width="36" alt="Maestro" className="bg-white rounded p-1"/>
                    <img src="../../images/payment/paypal.webp" width="36" alt="Paypal" className="bg-white rounded p-1"/>
                    <img src="../../images/payment/rupay.webp" width="36" alt="Rupay" className="bg-white rounded p-1"/>
                    <img src="../../images/payment/upi.webp" width="36" alt="UPI" className="bg-white rounded p-1"/>
                 </div>
             </div>
          </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="bottom-bar py-3 text-center">
        <div className="container">
           <p className="text-secondary small mb-0 fw-semibold">
              &copy; {new Date().getFullYear()} NexaMart E-Commerce. All rights reserved. 
              <span className="ms-2 opacity-50 fw-normal">(v{process.env.REACT_APP_VERSION || '1.0.0'})</span>
           </p>
        </div>
      </div>
      
    </footer>
  );
};

export default Footer;
