import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5000/api";

const CreateOrEditProduct = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product || {
    id: null,
    name: "",
    price: "",
    discountedPrice: "",
    availability: "In Stock",
    description: "",
    category: "",
    sizes: [],
    colors: [],
    image: "", 
  };

  const [formData, setFormData] = useState(product);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (product.id) {
      setIsEditing(true);
    }
  }, [product]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
        ? [...prev[name], value]
        : prev[name].filter(item => item !== value),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (!savedUser || !savedUser.tokens?.accessToken) {
        toast.error("Please login first");
        return;
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'sizes' || key === 'colors') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const url = isEditing 
        ? `${API_URL}/products/${formData.id}`
        : `${API_URL}/products`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${savedUser.tokens.accessToken}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(isEditing ? "Product updated successfully" : "Product created successfully");
          navigate("/admin/product-list");
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Error saving product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (!savedUser || !savedUser.tokens?.accessToken) {
        toast.error("Please login first");
        return;
      }

      const response = await fetch(`${API_URL}/products/${formData.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${savedUser.tokens.accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success("Product deleted successfully");
          navigate("/admin/product-list");
        }
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error deleting product");
    }
  };

  const resetForm = () => {
    if (window.confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
      navigate("/admin/product-list");
    }
  };

  const fetchUserData = async () => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    // ... API call to get user data
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>{isEditing ? "Edit Product" : "Create Product"}</h2>
      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Product Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            required
          />
          <div className="invalid-feedback">Please provide a product name.</div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="price" className="form-label">Price</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                className="form-control"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleFormChange}
                required
                min="0"
                step="0.01"
              />
              <div className="invalid-feedback">Please provide a valid price.</div>
            </div>
          </div>

          <div className="col-md-6">
            <label htmlFor="discountedPrice" className="form-label">Discounted Price</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                className="form-control"
                id="discountedPrice"
                name="discountedPrice"
                value={formData.discountedPrice}
                onChange={handleFormChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="availability" className="form-label">Availability</label>
          <select
            className="form-select"
            id="availability"
            name="availability"
            value={formData.availability}
            onChange={handleFormChange}
            required
          >
            <option value="In Stock">In Stock</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Pre-order">Pre-order</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleFormChange}
            required
          ></textarea>
          <div className="invalid-feedback">Please provide a product description.</div>
        </div>

        <div className="mb-3">
          <label htmlFor="category" className="form-label">Category</label>
          <input
            type="text"
            className="form-control"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleFormChange}
            required
          />
          <div className="invalid-feedback">Please provide a category.</div>
        </div>

        <div className="mb-3">
          <label htmlFor="image" className="form-label">Product Image</label>
          <input
            type="file"
            className="form-control"
            id="image"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
          />
          {(previewImage || formData.image) && (
            <div className="mt-2">
              <img
                src={previewImage || formData.image}
                alt="Product preview"
                style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain" }}
                className="border rounded p-1"
              />
            </div>
          )}
        </div>

        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEditing ? "Update Product" : "Create Product"
            )}
          </button>
          
          {isEditing && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete Product
            </button>
          )}
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={resetForm}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrEditProduct;
