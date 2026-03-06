import React, { useState, useEffect, useRef } from "react";
import PageTitle from "../components/PageTitle";
import { Modal, Button, Form, Spinner, InputGroup, FormControl } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';
import Barcode from 'react-barcode';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { 
  BsPencilSquare, 
  BsTrash, 
  BsEye, 
  BsQrCode, 
  BsUpcScan 
} from 'react-icons/bs';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const SubCategoryManagement = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]); // For parent category dropdown
  const [showModal, setShowModal] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    image: "",
    category: "" 
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailSubCategory, setDetailSubCategory] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBarcodeValue, setSelectedBarcodeValue] = useState('');

  const API_URL = "http://localhost:5000/api/sub-category";
  const CATEGORY_API_URL = "http://localhost:5000/api/category";

  // Fetch subcategories with updated response structure
  const fetchSubCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}`, {
        params: {
          search: searchTerm,
          sortField,
          sortOrder: sortDirection,
          page: currentPage,
          limit: itemsPerPage
        }
      });

      if (response.data.success) {
        setSubCategories(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setTotalItems(response.data.pagination.total);
      } else {
        toast.error("Failed to fetch subcategories");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching subcategories");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const response = await axios.get(CATEGORY_API_URL);
      setCategories(response.data.data);
    } catch (error) {
      toast.error("Error fetching categories");
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, [currentPage, sortField, sortDirection, searchTerm]);

  // Handle modal open/close
  const handleModalOpen = (subCategory = null) => {
    setSelectedSubCategory(subCategory);
    if (subCategory) {
      setFormData({
        name: subCategory.name,
        category: subCategory.category._id,
        image: ""
      });
    } else {
      setFormData({ name: "", category: "", image: "" });
    }
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      let response;
      if (selectedSubCategory) {
        // Update subcategory
        response = await axios.put(
          `${API_URL}/${selectedSubCategory._id}`, 
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' }}
        );
        toast.success("SubCategory updated successfully!");
      } else {
        // Create subcategory
        response = await axios.post(
          API_URL, 
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' }}
        );
        toast.success("SubCategory created successfully!");
      }

      setShowModal(false);
      setSelectedImage(null);
      setFormData({ name: "", category: "", image: "" });
      fetchSubCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving subcategory!");
      console.error("Error saving subcategory:", error);
    }
  };

  // Handle delete with updated response structure
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        const response = await axios.delete(`${API_URL}/${id}`);
        if (response.data.success) {
          fetchSubCategories();
          Swal.fire('Deleted!', response.data.message, 'success');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting subcategory");
    }
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: previewUrl }));
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle sort
  const handleSort = (field) => {
    setSortDirection(sortField === field && sortDirection === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  // Handle import with updated response structure
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setImporting(true);
      const response = await axios.post(`${API_URL}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchSubCategories();

        // Show detailed results
        if (response.data.results) {
          const { success, errors } = response.data.results;
          Swal.fire({
            title: 'Import Results',
            html: `
              <div class="mb-3">
                <strong>Successfully imported: ${success.length}</strong>
              </div>
              ${success.map(item => `
                <div class="text-success">
                  ✓ ${item.name} (Image: ${item.imageStatus})
                </div>
              `).join('')}
              ${errors.length > 0 ? `
                <div class="mt-3 mb-2">
                  <strong>Failed entries: ${errors.length}</strong>
                </div>
                ${errors.map(err => `
                  <div class="text-danger">
                    ✗ ${err.name}: ${err.error}
                  </div>
                `).join('')}
              ` : ''}
            `,
            icon: errors.length > 0 ? 'warning' : 'success'
          });
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error importing file");
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  // Handle barcode click
  const handleBarcodeClick = (barcodeId) => {
    setSelectedBarcodeValue(barcodeId);
    setShowBarcodeModal(true);
  };

  // Handle QR code click
  const handleQRClick = (barcodeId) => {
    setSelectedBarcodeValue(barcodeId);
    setShowQRModal(true);
  };

  // Download barcode as image
  const downloadBarcode = () => {
    const svg = document.querySelector('.barcode-modal svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = `barcode-${selectedBarcodeValue}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  // Download QR code as image
  const downloadQRCode = () => {
    const svg = document.querySelector('.qr-modal svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = `qr-code-${selectedBarcodeValue}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  // Handle image click for preview
  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setShowImageModal(true);
  };

  // Render table with all functionalities
  const renderTable = () => (
    <table className="table">
      <thead>
        <tr>
          <th onClick={() => handleSort('name')}>
            Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </th>
          <th>Category</th>
          <th>Image</th>
          <th>Barcode/QR</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {subCategories.map((subCategory) => (
          <tr key={subCategory._id}>
            <td>{subCategory.name}</td>
            <td>{subCategory.category?.name}</td>
            <td>
              {subCategory.image && (
                <img
                  src={`http://localhost:5000${subCategory.image}`}
                  alt={subCategory.name}
                  style={{ width: '50px', height: '50px', cursor: 'pointer', objectFit: 'cover' }}
                  onClick={() => handleImageClick(`http://localhost:5000${subCategory.image}`)}
                />
              )}
            </td>
            <td>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  onClick={() => handleBarcodeClick(subCategory.barcodeId)}
                  title="View Barcode"
                >
                  <BsUpcScan />
                </Button>
                <Button
                  variant="outline-info"
                  onClick={() => handleQRClick(subCategory.barcodeId)}
                  title="View QR Code"
                >
                  <BsQrCode />
                </Button>
              </div>
            </td>
            <td>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  onClick={() => handleModalOpen(subCategory)}
                  title="Edit"
                >
                  <BsPencilSquare />
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={() => handleDelete(subCategory._id)}
                  title="Delete"
                >
                  <BsTrash />
                </Button>
                <Button
                  variant="outline-info"
                  onClick={() => {
                    setDetailSubCategory(subCategory);
                    setShowDetailModal(true);
                  }}
                  title="View Details"
                >
                  <BsEye />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <main id="main" className="main">
      <section className="section dashboard">
        <PageTitle title="SubCategory Management" />
        <ToastContainer />
        
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <InputGroup style={{ width: '300px' }}>
                    <FormControl
                      placeholder="Search subcategories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>

                  <Button variant="primary" onClick={() => handleModalOpen()}>
                    Add New SubCategory
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center mt-3">
                    <Spinner animation="border" />
                  </div>
                ) : (
                  renderTable()
                )}

                {/* Pagination */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{" "}
                    {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline-primary"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Create/Edit Modal with Image Preview */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedSubCategory ? "Edit SubCategory" : "Create SubCategory"}
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
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {(selectedImage || (selectedSubCategory && selectedSubCategory.image)) && (
                <div className="mt-2">
                  <img
                    src={selectedImage ? URL.createObjectURL(selectedImage) : `http://localhost:5000${selectedSubCategory.image}`}
                    alt="Preview"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      display: 'block',
                      margin: '10px 0',
                      borderRadius: '5px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
              )}
            </Form.Group>

            <Button variant="primary" type="submit">
              {selectedSubCategory ? "Update" : "Create"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>SubCategory Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailSubCategory && (
            <div>
              <p><strong>Name:</strong> {detailSubCategory.name}</p>
              <p><strong>Category:</strong> {detailSubCategory.category?.name}</p>
              {detailSubCategory.image && (
                <div>
                  <p><strong>Image:</strong></p>
                  <img
                    src={`http://localhost:5000${detailSubCategory.image}`}
                    alt={detailSubCategory.name}
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Image Preview Modal */}
      <Modal 
        show={showImageModal} 
        onHide={() => setShowImageModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedImageUrl && (
            <img
              src={selectedImageUrl}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: 'calc(90vh - 120px)',
                objectFit: 'contain'
              }}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Add Barcode Modal */}
      <Modal 
        show={showBarcodeModal} 
        onHide={() => setShowBarcodeModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Barcode</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          <div className="barcode-modal">
            {selectedBarcodeValue && (
              <>
                <Barcode 
                  value={selectedBarcodeValue}
                  width={2}
                  height={100}
                  fontSize={16}
                  displayValue={true}
                />
                <p className="mt-3">Barcode ID: {selectedBarcodeValue}</p>
                <Button 
                  variant="primary" 
                  className="mt-2"
                  onClick={downloadBarcode}
                >
                  Download Barcode
                </Button>
              </>
            )}
          </div>
        </Modal.Body>
      </Modal>

      {/* Add QR Code Modal */}
      <Modal 
        show={showQRModal} 
        onHide={() => setShowQRModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          <div className="qr-modal">
            {selectedBarcodeValue && (
              <>
                <QRCode 
                  value={selectedBarcodeValue}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
                <p className="mt-3">QR Code ID: {selectedBarcodeValue}</p>
                <Button 
                  variant="primary" 
                  className="mt-2"
                  onClick={downloadQRCode}
                >
                  Download QR Code
                </Button>
              </>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </main>
  );
};

export default SubCategoryManagement; 