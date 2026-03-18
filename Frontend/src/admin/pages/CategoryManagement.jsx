import React, { useState, useEffect, useRef } from "react";
import PageTitle from "../components/PageTitle";
import { Modal, Button, Form, Spinner, InputGroup, FormControl } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';
import Barcode from 'react-barcode';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { BsPencilSquare, BsTrash, BsEye, BsDownload, BsUpload } from 'react-icons/bs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useUser } from "../../context/UserContext";
import Cookies from "js-cookie";


const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [selectedImage, setSelectedImage] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailCategory, setDetailCategory] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBarcodeValue, setSelectedBarcodeValue] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);

  // Get API URL from .env
  const API_URL = "http://localhost:5000/api/category";

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      const userRole = savedUser?.role || savedUser?.data?.role || "";
      const userId = Cookies.get("userId");

      const response = await axios.get(`${API_URL}`, {
        params: {
          search: searchTerm,
          sortField,
          sortOrder: sortDirection,
          page: currentPage,
          limit: itemsPerPage
        }
      });

      if (response.data && response.data.success) {
        let cats = response.data.data;

        // Seller sees only their own categories; Admin sees all
        if (userRole === "Seller" && userId) {
          cats = cats.filter((item) => item.userId === userId);
        }

        setCategories(cats);
        setTotalPages(response.data.pagination.pages);
        setTotalItems(cats.length);
      } else {
        toast.error("Invalid data format received!");
      }
    } catch (error) {
      toast.error("Error fetching categories!");
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCategories();
  }, [searchTerm, sortField, sortDirection, currentPage, itemsPerPage]);

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image change
  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
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

  // Modified handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));

      if (!savedUser || !savedUser.tokens?.accessToken) {
        toast.error("User is not authenticated. Please log in.");
        return;
      }

      const formDataWithImage = new FormData();
      formDataWithImage.append("name", formData.name);
      formDataWithImage.append("description", formData.description);
      if (selectedImage) {
        formDataWithImage.append("image", selectedImage);
      }

      const headers = {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${savedUser.tokens.accessToken}`,
      };

      if (selectedCategory && selectedCategory._id) {
        // Update category
        await axios.put(`${API_URL}/${selectedCategory._id}`, formDataWithImage, { headers });
        toast.success("Category updated successfully!");
      } else {
        // Create category
        await axios.post(API_URL, formDataWithImage, { headers });
        toast.success("Category added successfully!");
      }

      setShowModal(false);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);

      // Handle expired token
      if (error.response && error.response.status === 403) {
        toast.error("Session expired! Please log in again.");
        localStorage.removeItem("user");
        window.location.href = "/account/signin"; // Redirect to login
      } else {
        toast.error("Error saving category!");
      }
    }
  };

  // Modified handleDelete with SweetAlert
  const handleDelete = async (categoryId) => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));

      if (!savedUser || !savedUser.tokens?.accessToken) {
        Swal.fire("Error!", "User is not authenticated.", "error");
        return;
      }

      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel"
      });
      if (result.isConfirmed) {
        await axios.delete(`${API_URL}/${categoryId}`, {
          headers: {
            "Authorization": `Bearer ${savedUser.tokens.accessToken}`,
          }
        });

        // Remove the deleted category from state
        setCategories(prevCategories => prevCategories.filter(cat => cat._id !== categoryId));

        Swal.fire("Deleted!", "Category has been deleted.", "success");
      }
    } catch (error) {
      console.error("Error deleting category:", error);

      // Handle expired token
      if (error.response && error.response.status === 403) {
        Swal.fire("Session Expired!", "Please log in again.", "warning");
        localStorage.removeItem("user");
        window.location.href = "/account/signin"; // Redirect to login page
      } else {
        Swal.fire("Error!", "Failed to delete category.", "error");
      }
    }
  };

  // Initialize QR Scanner
  useEffect(() => {
    let scanner;
    if (showScanner) {
      scanner = new Html5QrcodeScanner('reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      });

      scanner.render(success, error);

      function success(result) {
        scanner.clear();
        setShowScanner(false);
        navigate(`/category/${result}`);
      }

      function error(err) {
        console.error(err);
      }
    }
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [showScanner, navigate]);

  const handleScanClick = () => {
    setShowScanner(true);
  };

  // Handle view details
  const handleViewDetails = (category) => {
    setDetailCategory(category);
    setShowDetailModal(true);
  };

  // Handle image click
  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setShowImageModal(true);
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

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on new search
      fetchCategories();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Add search handler
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Function to export data to Excel
  const exportToExcel = () => {
    // Prepare the data for export
    const exportData = categories.map(category => ({
      'Name': category.name,
      'Description': category.description,
      'Barcode ID': category.barcodeId,
      'Created At': new Date(category.createdAt).toLocaleDateString(),
      'Updated At': new Date(category.updatedAt).toLocaleDateString()
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Categories");

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Get current date for filename
    const date = new Date().toISOString().split('T')[0];

    // Save file
    saveAs(data, `categories_${date}.xlsx`);
  };

  // Function to download template
  const downloadTemplate = () => {
    const template = XLSX.utils.book_new();
    const templateData = [
      {
        Name: 'Example Category 1',
        Description: 'Description 1',
        ImageURL: 'https://example.com/image1.jpg'
      },
      {
        Name: 'Example Category 2',
        Description: 'Description 2',
        ImageURL: 'https://example.com/image2.jpg'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);

    // Add column widths
    ws['!cols'] = [
      { wch: 20 }, // Name
      { wch: 30 }, // Description
      { wch: 50 }  // ImageURL
    ];

    XLSX.utils.book_append_sheet(template, ws, "Template");

    const excelBuffer = XLSX.write(template, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, 'category_import_template.xlsx');
  };

  // Function to handle Excel import
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
        fetchCategories();
      }

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
    } catch (error) {
      toast.error(error.response?.data?.message || "Error importing file");
      console.error("Import error:", error);
    } finally {
      setImporting(false);
      event.target.value = '';
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
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <InputGroup style={{ width: '300px' }}>
                      <FormControl
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                      {searchTerm && (
                        <Button
                          variant="outline-secondary"
                          onClick={() => setSearchTerm('')}
                        >
                          ×
                        </Button>
                      )}
                    </InputGroup>
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="primary" onClick={() => handleModalOpen()}>
                      Add New Category
                    </Button>
                    <Button variant="success" onClick={() => setShowScanner(true)}>
                      Scan Code
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={exportToExcel}
                      title="Export to Excel"
                    >
                      <BsDownload className="me-1" /> Export
                    </Button>
                    <div className="d-flex gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        accept=".xlsx,.xls"
                        style={{ display: 'none' }}
                      />
                      <Button
                        variant="info"
                        onClick={() => fileInputRef.current.click()}
                        disabled={importing}
                        title="Import from Excel"
                      >
                        <BsUpload className="me-1" />
                        {importing ? 'Importing...' : 'Import'}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={downloadTemplate}
                        title="Download Template"
                      >
                        Template
                      </Button>
                    </div>
                  </div>
                </div>

                {showScanner && (
                  <div className="mb-3">
                    <div id="reader"></div>
                  </div>
                )}

                {loading ? (
                  <div className="text-center mt-3">
                    <Spinner animation="border" />
                  </div>
                ) : categories.length > 0 ? (
                  <table className="table table-striped w-100 mt-3">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                          Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>
                          Description {sortField === 'description' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>Barcode</th>
                        <th>QR Code</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category._id}>
                          <td>
                            {category.image ? (
                              <img
                                src={`http://localhost:5000${category.image}`}
                                alt={category.name}
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  objectFit: 'cover',
                                  borderRadius: '5px',
                                  cursor: 'pointer'
                                }}
                                onClick={() => handleImageClick(`http://localhost:5000${category.image}`)}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  backgroundColor: '#f0f0f0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '5px'
                                }}
                              >
                                <i className="bi bi-image" style={{ color: '#999' }}></i>
                              </div>
                            )}
                          </td>
                          <td>{category.name}</td>
                          <td>{category.description}</td>
                          <td style={{ cursor: 'pointer' }} onClick={() => handleBarcodeClick(category.barcodeId)}>
                            <Barcode
                              value={category.barcodeId}
                              width={1}
                              height={30}
                              fontSize={12}
                            />
                          </td>
                          <td style={{ cursor: 'pointer' }} onClick={() => handleQRClick(category.barcodeId)}>
                            <QRCode
                              value={category.barcodeId}
                              size={50}
                              level="H"
                            />
                          </td>
                          <td>
                            <div className="d-flex gap-2 align-items-center">
                              <BsPencilSquare
                                className="text-primary"
                                style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                                onClick={() => handleModalOpen(category)}
                                title="Edit"
                              />
                              <BsTrash
                                className="text-danger"
                                style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                                onClick={() => handleDelete(category._id)}
                                title="Delete"
                              />
                              <BsEye
                                className="text-success"
                                style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                                onClick={() => handleViewDetails(category)}
                                title="View Details"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center mt-3">No categories found.</p>
                )}

                {/* Updated pagination section */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                  </div>
                  <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </div>
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
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </Form.Group>
            {selectedCategory && selectedCategory.image && (
              <div className="mb-3">
                <p>Current Image:</p>
                <img
                  src={`http://localhost:5000${selectedCategory.image}`}
                  alt="Category"
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
            <Button variant="primary" type="submit">
              {selectedCategory ? "Update" : "Create"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Category Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {detailCategory && (
            <div className="p-4 border rounded shadow-sm">
              {/* Category Details Section */}
              <div className="row">
                <div className="col-md-9">
                  <div className="p-3 border rounded bg-light">
                    <h4 className="mb-2">Category:- {detailCategory.name}</h4>
                    <p className="mb-1">description :- {detailCategory.description}</p>
                    <p className="mb-0"><strong>Created:</strong> {new Date(detailCategory.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="col-md-3 align-items-center">
                  <h5>QR Code</h5>
                  <div className="p-2 border rounded">
                    <QRCode
                      value={detailCategory.barcodeId}
                      size={80}
                      level="H"
                    />
                  </div>
                </div>
              </div>

              {/* Barcode Section */}
              <div className="mt-4 text-center">
                <h5>Barcode</h5>
                <div className="d-flex justify-content-center p-2 border rounded bg-white">
                  <Barcode
                    value={detailCategory.barcodeId}
                    width={1.5}
                    height={50}
                  />
                </div>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Image Modal */}
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
              alt="Category"
              style={{
                maxWidth: '100%',
                maxHeight: 'calc(90vh - 120px)', // Adjust based on viewport
                objectFit: 'contain'
              }}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Barcode Modal */}
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
          {selectedBarcodeValue && (
            <div>
              <Barcode
                value={selectedBarcodeValue}
                width={2}
                height={100}
                fontSize={16}
              />
              <p className="mt-3">Barcode ID: {selectedBarcodeValue}</p>
              <Button
                variant="primary"
                className="mt-2"
                onClick={() => {
                  // Create a function to handle barcode download
                  const svg = document.querySelector('.modal-body svg');
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
                }}
              >
                Download Barcode
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* QR Code Modal */}
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
          {selectedBarcodeValue && (
            <div>
              <QRCode
                value={selectedBarcodeValue}
                size={300}
                level="H"
              />
              <p className="mt-3">QR Code ID: {selectedBarcodeValue}</p>
              <Button
                variant="primary"
                className="mt-2"
                onClick={() => {
                  // Create a function to handle QR code download
                  const svg = document.querySelector('.modal-body svg');
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
                }}
              >
                Download QR Code
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </main>
  );
};

export default CategoryManagement;
