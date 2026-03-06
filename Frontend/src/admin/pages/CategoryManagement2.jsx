import React, { useState, useEffect } from "react";
import PageTitle from "../components/PageTitle";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminHeader from "../components/AdminHeader";
const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  // Get API URL from .env
  const API_URL = process.env.REACT_APP_API_URL + "/category";

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setCategories(response.data);
    } catch (error) {
      toast.error("Error fetching categories!");
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open modal for create/edit
  const handleModalOpen = (category = null) => {
    if (category) {
      setFormData({ name: category.name, description: category.description });
      setSelectedCategory(category);
    } else {
      setFormData({ name: "", description: "" });
      setSelectedCategory(null);
    }
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCategory) {
        // Update category
        await axios.put(`${API_URL}/${selectedCategory._id}`, formData);
        setCategories((prev) =>
          prev.map((cat) =>
            cat._id === selectedCategory._id ? { ...cat, ...formData } : cat
          )
        );
        toast.success("Category updated successfully!");
      } else {
        // Create category
        const { data } = await axios.post(API_URL, formData);
        setCategories([...categories, data]);
        toast.success("Category added successfully!");
      }
      setShowModal(false);
    } catch (error) {
      toast.error("Error saving category!");
      console.error("Error saving category:", error);
    }
  };

  // Handle delete
  const handleDelete = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`${API_URL}/${categoryId}`);
        setCategories(categories.filter((cat) => cat._id !== categoryId));
        toast.success("Category deleted!");
      } catch (error) {
        toast.error("Error deleting category!");
        console.error("Error deleting category:", error);
      }
    }
  };

  return (
    <main id="main" className="main">

<section className="section dashboard">
      <PageTitle title="Category Management" />
      <ToastContainer />
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Categories</h5>
                <Button variant="primary" onClick={() => handleModalOpen()}>
                  Add New Category
                </Button>
                {loading ? (
                  <div className="text-center mt-3">
                    <Spinner animation="border" />
                  </div>
                ) : (
                  <table className="table table-striped mt-3">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category._id}>
                          <td>{category.name}</td>
                          <td>{category.description}</td>
                          <td>
                            <Button
                              variant="info"
                              size="sm"
                              className="me-2"
                              onClick={() => handleModalOpen(category)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(category._id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedCategory ? "Edit Category" : "Add New Category"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}  
                rows={3}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {selectedCategory ? "Update" : "Create"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </main>
  );
};

export default CategoryManagement;
