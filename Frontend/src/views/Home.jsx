import { API_URL as GLOBAL_API_URL, DOMAIN_URL as GLOBAL_DOMAIN_URL } from '../config/apiConfig';
import React, { lazy, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { data } from "../data";
import axios from "axios";
import { ReactComponent as IconTags } from "bootstrap-icons/icons/tags.svg";
import { ReactComponent as IconTruck } from "bootstrap-icons/icons/truck.svg";
import { ReactComponent as IconAward } from "bootstrap-icons/icons/award.svg";
import { ReactComponent as IconHeadset } from "bootstrap-icons/icons/headset.svg";
import { ReactComponent as IconCreditCard } from "bootstrap-icons/icons/credit-card.svg";
import { ReactComponent as IconStarFill } from "bootstrap-icons/icons/star-fill.svg";
import { ReactComponent as IconQuote } from "bootstrap-icons/icons/quote.svg";
import './Home.css'; // Premium UI styling

const Banner = lazy(() => import("../components/carousel/Banner"));

const HomeView = () => {
  const [categories, setCategories] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${GLOBAL_API_URL}/category`),
          axios.get(`${GLOBAL_API_URL}/product?limit=4&sortField=createdAt&sortOrder=desc`) 
        ]);
        
        if (catRes.data.success) {
          setCategories(catRes.data.data.slice(0, 8)); // Top 8 categories
        }
        if (prodRes.data.success) {
          setTrendingProducts(prodRes.data.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: <IconTruck width={32} height={32} />,
      title: "Free Worldwide Shipping",
      description: "On all orders over $150",
    },
    {
      icon: <IconAward width={32} height={32} />,
      title: "Premium Quality Guarantee",
      description: "100% authentic curated products",
    },
    {
      icon: <IconHeadset width={32} height={32} />,
      title: "24/7 Concierge Support",
      description: "Dedicated assistance anytime",
    },
    {
      icon: <IconCreditCard width={32} height={32} />,
      title: "Secure Encrypted Payments",
      description: "100% secure checkout process",
    },
  ];

  const testimonials = [
    {
      text: "NexaMart completely transformed my shopping experience. The quality of the products and the incredibly fast shipping exceeded all my expectations.",
      name: "Sarah Jenkins",
      role: "Verified Buyer",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      text: "I've never seen such a curated collection of high-end items in one place. Customer support was incredibly helpful when I had questions. Highly recommended!",
      name: "Michael Chen",
      role: "Premium Member",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      text: "The checkout process was seamless, and the product arrived perfectly packaged. It's refreshing to find a platform that truly cares about the customer journey.",
      name: "Emma Watson",
      role: "Verified Buyer",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  ];

  const brands = ["Aura", "Zenith", "Lumina", "Vortex", "Nova", "Oasis"];

  return (
    <div id="home-view">
      <Banner
        className="mb-0"
        id="carouselHomeBanner"
        data={data.banner}
      />

      {/* Brands Marquee Section */}
      <section className="brands-section animate-fade-in-up">
        <div className="marquee-wrapper">
          {/* Double items for continuous scroll */}
          {[1, 2].map((_, idx) => (
            <div className="marquee-items" key={idx}>
              {brands.map((brand, i) => (
                <div className="brand-item" key={i}>{brand}</div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="row g-4 justify-content-center">
            {features.map((feature, index) => (
              <div key={index} className="col-md-6 col-lg-3">
                <div className={`feature-card text-center animate-fade-in-up delay-${(index + 1) * 100}`}>
                  <div className="feature-icon-wrapper">
                    {feature.icon}
                  </div>
                  <h5 className="feature-title">{feature.title}</h5>
                  <p className="text-muted mb-0 small">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="trending-section">
        <div className="container">
          <div className="text-center mb-5 animate-fade-in-up">
            <h2 className="section-title">Trending This Week</h2>
            <p className="section-subtitle">
              Handpicked premium items that everyone is talking about
            </p>
          </div>
          
          <div className="row g-4">
            {trendingProducts.map((product, index) => (
              <div className={`col-sm-6 col-md-4 col-lg-3 animate-fade-in-up delay-${(index + 1) * 100}`} key={product._id}>
                <Link to={`/product/${product._id}`} className="text-decoration-none">
                  <div className="product-card">
                    <span className="product-badge">Hot</span>
                    <div className="product-image-container">
                      <img 
                        src={product.images && product.images[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${GLOBAL_DOMAIN_URL}${product.images[0]}`) : "https://via.placeholder.com/300x400?text=Premium"} 
                        alt={product.name} 
                      />
                      <div className="product-overlay">
                        <button className="product-add-btn">View Details</button>
                      </div>
                    </div>
                    <div className="product-info">
                      <h3 className="product-title text-truncate">{product.name}</h3>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="product-price">${product.price.toFixed(2)}</span>
                        <div className="text-warning">
                           <IconStarFill width={14} height={14} className="me-1" />
                           <span className="text-dark fw-bold small">4.9</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-5 animate-fade-in-up delay-400">
             <Link to="/products" className="btn btn-outline-dark rounded-pill px-4 py-2 fw-bold shadow-sm">View All Products <i className="bi bi-arrow-right ms-2"></i></Link>
          </div>
        </div>
      </section>

      {/* Parallax Banner */}
      <section className="parallax-section animate-fade-in-up">
        <div className="container parallax-content">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="parallax-title">Redefine Your Style</h2>
              <p className="parallax-lead">
                Immerse yourself in our exclusive new arrivals. Crafted with uncompromising attention to detail for the modern visionary.
              </p>
              <Link to="/products" className="parallax-btn text-decoration-none">
                Shop The Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="text-center mb-5 animate-fade-in-up">
            <h2 className="section-title">Explore Our Collections</h2>
            <p className="section-subtitle">
              Discover our wide range of premium products curated just for you
            </p>
          </div>

          {loading ? (
            <div className="text-center py-5 my-5">
              <div
                className="spinner-border text-primary"
                role="status"
                style={{ width: '3rem', height: '3rem' }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4 justify-content-center">
              {categories.map((category, index) => (
                <div
                  className={`col-6 col-md-4 col-lg-3 animate-fade-in-up delay-${(index % 4 + 1) * 100}`}
                  key={category._id}
                >
                  <Link
                    to={`/products?category=${category._id}`}
                    className="text-decoration-none"
                  >
                    <div className="category-card">
                      <div className="text-center">
                        {category.image ? (
                          <div className="category-image-wrapper shadow-sm">
                            <img
                              src={`${GLOBAL_DOMAIN_URL}${category.image}`}
                              className="category-image"
                              alt={category.name}
                            />
                          </div>
                        ) : (
                          <div className="category-icon-fallback shadow-sm">
                            <IconTags width={40} height={40} />
                          </div>
                        )}

                        <div className="mt-3">
                          <h5 className="category-title mb-1">
                            {category.name}
                          </h5>
                          {category.description && (
                            <p className="text-muted small mb-0 text-truncate px-2">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="text-center mb-5 animate-fade-in-up">
            <h2 className="section-title">Customer Stories</h2>
            <p className="section-subtitle">
              Don't just take our word for it. Here's what our luxury community has to say.
            </p>
          </div>
          <div className="row g-4">
            {testimonials.map((testi, index) => (
              <div className={`col-lg-4 animate-fade-in-up delay-${(index + 1) * 100}`} key={index}>
                <div className="testimonial-card">
                  <div className="quote-icon">
                    <IconQuote width={24} height={24} />
                  </div>
                  <div className="stars mb-3">
                    <IconStarFill /><IconStarFill /><IconStarFill /><IconStarFill /><IconStarFill />
                  </div>
                  <p className="testimonial-text">"{testi.text}"</p>
                  <div className="testimonial-author">
                    <img src={testi.avatar} alt={testi.name} className="author-img" />
                    <div>
                      <h6 className="author-name">{testi.name}</h6>
                      <p className="author-role">{testi.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Section */}
      <div className="animate-fade-in-up delay-200">
        <section className="promo-section">
          <div className="promo-shape shape-1"></div>
          <div className="promo-shape shape-2"></div>
          <div className="promo-shape shape-3"></div>
          <div className="container promo-content">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <h2 className="promo-title">
                  Special Offers
                </h2>
                <p className="promo-lead">
                  Sign up today and get up to 50% off on your first purchase. 
                  Experience premium quality without compromise.
                </p>
                <Link
                  to="/products"
                  className="promo-btn text-decoration-none"
                >
                  Claim Your Discount <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card newsletter-card animate-fade-in-up delay-300">
                <div className="card-body text-center p-5">
                  <div className="mb-4">
                    <i className="bi bi-envelope-paper-heart" style={{ fontSize: '3.5rem', color: 'var(--home-primary)' }}></i>
                  </div>
                  <h3 className="newsletter-title mb-3">
                    Join Our Inner Circle
                  </h3>
                  <p className="text-muted mb-4 lead" style={{ fontSize: '1.15rem' }}>
                    Subscribe to receive exclusive access to VIP sales, new robust collections, and behind-the-scenes content.
                  </p>
                  <form className="newsletter-input-group" onSubmit={(e) => { e.preventDefault(); alert("Subscribed to Inner Circle!"); }}>
                    <input
                      type="email"
                      className="newsletter-input"
                      placeholder="Enter your email address"
                      required
                    />
                    <button
                      className="newsletter-btn"
                      type="submit"
                    >
                      Subscribe
                    </button>
                  </form>
                  <p className="text-muted small mt-4 mb-0 font-italic">
                    We guard your privacy with our lives. Unsubscribe anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeView;
