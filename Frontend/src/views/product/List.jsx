import React, { lazy, Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { DOMAIN_URL } from "../../config/apiConfig";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Breadcrumb = lazy(() => import("../../components/Breadcrumb"));

const BACKEND_URL = DOMAIN_URL;

class CategoryListView extends Component {
  state = {
    categories: [],
    view: "grid",
    loading: true,
    error: null,
  };

  componentDidMount() {
    this.fetchCategories();
  }

  fetchCategories = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/category`);

      if (response.data.success) {
        this.setState({
          categories: response.data.data,
          loading: false
        });
      }

    } catch (err) {
      console.error('Error fetching categories:', err);
      this.setState({
        categories: [],
        error: 'Error fetching categories',
        loading: false
      });
    }
  };

  // ✅ Same slug logic as Navbar
  toSlug = (name) =>
    name
      .toString()
      .trim()
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  onChangeView = (view) => {
    this.setState({ view });
  };

  render() {
    const { categories, view, loading, error } = this.state;

    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
          <div className="spinner-border text-primary" role="status" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger m-5" role="alert">
          {error}
        </div>
      );
    }

    return (
      <>
        <div className="p-5 bg-primary bs-cover">
          <div className="container text-center">
            <span className="display-5 px-3 bg-white rounded shadow">
              Categories
            </span>
          </div>
        </div>

        <Breadcrumb />

        <div className="container-fluid mb-3">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <span className="h5 mb-0">
              {categories.length} Categories Available
            </span>

            <div className="btn-group">
              <button
                type="button"
                onClick={() => this.onChangeView("grid")}
                className={`btn ${view === "grid" ? "btn-primary" : "btn-outline-primary"}`}
              >
                <i className="bi bi-grid" />
              </button>

              <button
                type="button"
                onClick={() => this.onChangeView("list")}
                className={`btn ${view === "list" ? "btn-primary" : "btn-outline-primary"}`}
              >
                <i className="bi bi-list" />
              </button>
            </div>
          </div>

          <div className="row g-3">
            {categories.map((category) => (
              <div
                key={category._id}
                className={view === "grid" ? "col-md-4" : "col-12"}
              >
                  <Link
                    to={`/products?category=${category._id}`}
                    className="text-decoration-none"
                  >
                    <div className="card h-100 shadow-sm hover-shadow">
                      <div className="position-relative bg-light border-bottom d-flex align-items-center justify-content-center" style={{ height: "200px" }}>
                        <img
                          src={
                            category.image?.startsWith('http')
                              ? category.image
                              : `${BACKEND_URL}${category.image}`
                          }
                          className="w-100 h-100 object-fit-contain p-3"
                          alt={category.name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/200';
                          }}
                        />
                        <div className="position-absolute top-0 end-0 p-2">
                        <span className="badge bg-primary">
                          {category.barcodeId}
                        </span>
                      </div>
                    </div>

                    <div className="card-body">
                      <h5 className="card-title text-dark">
                        {category.name}
                      </h5>

                      <p className="card-text text-muted">
                        {category.description || "No description available"}
                      </p>

                      <div className="text-end">
                        <button className="btn btn-sm btn-outline-primary">
                          View Products <i className="bi bi-arrow-right"></i>
                        </button>
                      </div>
                    </div>

                  </div>
                </Link>
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-folder2-open display-4 text-muted"></i>
              <p className="mt-3">No categories found</p>
            </div>
          )}
        </div>

        <style>
          {`
            .hover-shadow {
              transition: all 0.3s ease;
            }
            .hover-shadow:hover {
              transform: translateY(-5px);
              box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
            }
          `}
        </style>
      </>
    );
  }
}

export default CategoryListView;
