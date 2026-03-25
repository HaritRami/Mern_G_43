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

const Support = lazy(() => import("../components/Support"));
const Banner = lazy(() => import("../components/carousel/Banner"));
const Carousel = lazy(() => import("../components/carousel/Carousel"));
const CardLogin = lazy(() => import("../components/card/CardLogin"));
const CardImage = lazy(() => import("../components/card/CardImage"));
const CardDealsOfTheDay = lazy(() =>
  import("../components/card/CardDealsOfTheDay")
);

const HomeView = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${GLOBAL_API_URL}/category`
        );
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const features = [
    {
      icon: <IconTruck className="text-primary" width={40} height={40} />,
      title: "Free Shipping",
      description: "On orders over $100",
    },
    {
      icon: <IconAward className="text-primary" width={40} height={40} />,
      title: "Quality Guarantee",
      description: "100% genuine products",
    },
    {
      icon: <IconHeadset className="text-primary" width={40} height={40} />,
      title: "24/7 Support",
      description: "Dedicated support team",
    },
    {
      icon: <IconCreditCard className="text-primary" width={40} height={40} />,
      title: "Secure Payments",
      description: "100% secure checkout",
    },
  ];

  return (
    <>
      <Banner
        className="mb-3"
        id="carouselHomeBanner"
        data={data.banner}
      />

      {/* Features Section */}
      <div className="container-fluid bg-light py-5 mb-5">
        <div className="container">
          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-md-3">
                <div className="feature-card text-center p-4 bg-white rounded shadow-sm">
                  <div className="feature-icon mb-3">
                    {feature.icon}
                  </div>
                  <h5 className="feature-title">{feature.title}</h5>
                  <p className="text-muted mb-0">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="container mb-5">
        <div className="text-center mb-5">
          <h2 className="section-title">Explore Our Categories</h2>
          <p className="text-muted">
            Discover our wide range of products
          </p>
          <div className="section-divider"></div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {categories.map((category) => {
              return (
                <div
                  className="col-6 col-md-3"
                  key={category._id}
                >
                  <Link
                    to={`/products?category=${category._id}`}
                    className="text-decoration-none"
                  >
                    <div className="card category-card h-100">
                      <div className="text-center p-3">
                        {category.image ? (
                          <div className="category-image-wrapper">
                            <img
                              src={`${GLOBAL_DOMAIN_URL}${category.image}`}
                              className="img-fluid rounded-circle category-image"
                              alt={category.name}
                            />
                          </div>
                        ) : (
                          <div className="category-icon-fallback">
                            <IconTags
                              width={50}
                              height={50}
                              className="text-primary"
                            />
                          </div>
                        )}

                        <div className="mt-3">
                          <h5 className="category-title">
                            {category.name}
                          </h5>
                          {category.description && (
                            <p className="text-muted small mb-0">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Promotional Section */}
      <div className="container-fluid bg-primary bg-gradient text-white py-5 mb-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h2 className="display-4 mb-4">
                Special Offers
              </h2>
              <p className="lead mb-4">
                Get up to 50% off on selected items.
                Limited time offer!
              </p>
              <Link
                to="/products"
                className="btn btn-light btn-lg shadow-sm"
              >
                Shop Now
              </Link>
            </div>
            <div className="col-md-6 text-center"></div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="container mb-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card newsletter-card">
              <div className="card-body text-center p-5">
                <h3 className="card-title mb-3">
                  Subscribe to Our Newsletter
                </h3>
                <p className="text-muted mb-4">
                  Stay updated with our latest
                  products and offers
                </p>
                <div className="input-group mb-3">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                  />
                  <button
                    className="btn btn-primary"
                    type="button"
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeView;
