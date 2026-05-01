import { API_URL as GLOBAL_API_URL } from '../../config/apiConfig';
import React, { useState, useEffect, useRef } from "react";
import PageTitle from "../components/PageTitle";
import { Modal, Button, Form, Spinner, InputGroup, FormControl } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';
import Barcode from 'react-barcode';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { BsPencilSquare, BsTrash, BsEye, BsDownload, BsUpload, BsImages } from 'react-icons/bs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Cookies from "js-cookie";
// Ensure cookies (accessToken/userId) are sent with requests
axios.defaults.withCredentials = true;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subCategory: [],
    unit: "",
    stock: 0,
    price: 0,
    discount: 0,
    description: "",
    moreDetail: {},
    Public: true
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBarcodeValue, setSelectedBarcodeValue] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanner, setScanner] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState("");
  const savedUser = JSON.parse(localStorage.getItem("user"));
  const userRole = savedUser?.role || savedUser?.data?.role || "";
  const token = savedUser?.tokens?.accessToken || savedUser?.data?.tokens?.accessToken;

  const getAuthConfig = () => {
    return token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
  };

  const API_URL = `${GLOBAL_API_URL}/product`;
  const CATEGORY_API_URL = `${GLOBAL_API_URL}/category`;
  const SUBCATEGORY_API_URL = `${GLOBAL_API_URL}/sub-category`;

  // Fetch sellers list (Admin only)
  const fetchSellers = async () => {
    try {
      const token = savedUser?.tokens?.accessToken;
      if (!token) return;
      const response = await axios.get(`${GLOBAL_API_URL}/admin/users`, {
        ...getAuthConfig(),
        withCredentials: true,
      });
      if (response.data?.success) {
        setSellers(
          response.data.data.filter((u) => u.role?.toLowerCase() === "seller")
        );
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const userId = Cookies.get("userId");

      const response = await axios.get(API_URL, {
        params: {
          search: searchTerm,
          sortField,
          sortOrder: sortDirection,
          page: currentPage,
          limit: itemsPerPage
        }
      });

      if (response.data.success) {
        let products = response.data.data;

        // Seller sees only their own products
        if (userRole === "Seller" && userId) {
          products = products.filter((item) => item.userId === userId);
        }

        // Admin: filter by selected seller if chosen
        if (userRole === "Admin" && selectedSeller) {
          products = products.filter((item) => item.userId === selectedSeller);
        }

        setProducts(products);
        setTotalPages(response.data.pagination.pages);
        setTotalItems(products.length);
      }
    } catch (error) {
      toast.error("Error fetching products!");
    } finally {
      setLoading(false);
    }
  };
  // Fetch categories and subcategories
  const fetchCategories = async () => {
    try {
      const userId = Cookies.get("userId");

      const [categoriesRes, subCategoriesRes] = await Promise.all([
        axios.get(CATEGORY_API_URL),
        axios.get(SUBCATEGORY_API_URL)
      ]);

      let cats = categoriesRes.data.data || [];
      let subCats = subCategoriesRes.data.data || [];

      // Seller sees only their own
      if (userRole === "Seller" && userId) {
        cats = cats.filter((item) => item.userId === userId);
        subCats = subCats.filter((item) => item.userId === userId);
      }

      setCategories(cats);
      setSubCategories(subCats);
    } catch (error) {
      toast.error("Error fetching categories!");
    }
  };

  // One-time initialisation: sellers + categories (no re-run on search/sort)
  useEffect(() => {
    if (userRole === "Admin") fetchSellers();
    fetchCategories();
  }, []);

  // Re-fetch products only when pagination / sorting / search / seller changes
  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortField, sortDirection, searchTerm, selectedSeller]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle multiple image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess(false);

    if (!formData.name || !formData.price || formData.stock === "" || !formData.category) {
      setFormError("All fields are required");
      return;
    }

    if (formData.price <= 0) {
      setFormError("Price must be greater than 0");
      return;
    }

    if (formData.stock < 0) {
      setFormError("Stock cannot be negative");
      return;
    }

    setSaving(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          formData[key].forEach(value => formDataToSend.append(key + '[]', value));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append each selected image to formData
      selectedImages.forEach(image => {
        formDataToSend.append('images', image);
      });

      if (selectedProduct) {
        await axios.put(
          `${API_URL}/${selectedProduct._id}`,
          formDataToSend,
          {
            ...getAuthConfig(),
            headers: {
              ...getAuthConfig().headers,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        await axios.post(
          API_URL,
          formDataToSend,
          {
            ...getAuthConfig(),
            headers: {
              ...getAuthConfig().headers,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      setFormSuccess(true);
      fetchProducts();
      
      setTimeout(() => {
        setShowModal(false);
        setFormSuccess(false);
        setFormData({
          name: "", category: "", subCategory: [], unit: "", stock: 0, price: 0, discount: 0, description: "", moreDetail: {}, Public: true
        });
        setSelectedImages([]);
        setPreviewImages([]);
      }, 1500);

    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Something went wrong. Please try again.";
      if (!err.response) {
        setFormError("Network error. Please check your connection.");
      } else {
        setFormError(message);
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (productId) => {
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
        await axios.delete(`${API_URL}/${productId}`, getAuthConfig());
        fetchProducts();
        Swal.fire('Deleted!', 'Product has been deleted.', 'success');
      }
    } catch (error) {
      Swal.fire('Error!', 'Failed to delete product.', 'error');
    }
  };

  // Handle Excel import
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/import`, formData, {
        ...getAuthConfig(),
        headers: {
          ...getAuthConfig().headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        toast.success(`Successfully imported ${response.data.results.success.length} products`);
        fetchProducts();
      }
    } catch (error) {
      toast.error("Error importing products!");
    } finally {
      setImporting(false);
    }
  };

  // Handle Excel export
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(products.map(product => ({
      Name: product.name,
      Price: product.price,
      Stock: product.stock,
      Description: product.description,
      Unit: product.unit,
      Discount: product.discount,
      Public: product.Public
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, 'products.xlsx');
  };

  // Handle image click for preview
  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setShowImageModal(true);
  };

  // Handle barcode click
  const handleBarcodeClick = (barcodeId) => {
    if (!barcodeId) {
      toast.error("No barcode ID available");
      return;
    }
    setSelectedBarcodeValue(barcodeId);
    setShowBarcodeModal(true);
  };

  // Add QR code click handler for consistency
  const handleQRClick = (barcodeId) => {
    if (!barcodeId) {
      toast.error("No barcode ID available");
      return;
    }
    setSelectedBarcodeValue(barcodeId);
    setShowQRModal(true);
  };

  // Add download handlers for barcode and QR code
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

  const handleModalOpen = (product = null) => {
    setSelectedProduct(product);
    if (product) {
      setFormData({
        name: product.name || "",
        category: product.category?._id || product.category || "",
        subCategory: product.subCategory || [],
        unit: product.unit || "",
        stock: product.stock || 0,
        price: product.price || 0,
        discount: product.discount || 0,
        description: product.description || "",
        moreDetail: product.moreDetail || {},
        Public: product.Public !== undefined ? product.Public : true
      });
      setPreviewImages(product.images || []);
    } else {
      setFormData({
        name: "", category: "", subCategory: [], unit: "", stock: 0, price: 0, discount: 0, description: "", moreDetail: {}, Public: true
      });
      setPreviewImages([]);
    }
    setFormError("");
    setFormSuccess(false);
    setSelectedImages([]);
    setShowModal(true);
  };

  const handleViewDetails = (product) => {
    setDetailProduct(product);
    setShowDetailModal(true);
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
    }
  };

  const downloadTemplate = () => {
    // Implementation of downloadTemplate function
  };

  const handleScan = async (decodedText) => {
    try {
      const response = await axios.get(`${API_URL}/barcode/${decodedText}`);
      if (response.data.success) {
        setShowScanner(false);
        if (scanner) {
          scanner.clear();
        }
        handleViewDetails(response.data.data);
      } else {
        toast.error("Product not found!");
      }
    } catch (error) {
      toast.error("Error finding product!");
    }
  };

  useEffect(() => {
    if (showScanner) {
      const newScanner = new Html5QrcodeScanner('reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      });

      newScanner.render(handleScan, (error) => {
        if (error) {
          console.error(error);
        }
      });

      setScanner(newScanner);
    } else {
      if (scanner) {
        scanner.clear();
      }
    }

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [showScanner]);

  return (
    <>
      <section className="section dashboard">
        <PageTitle title="Product Management" />
        <ToastContainer />
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                {/* Header Section with Buttons */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <InputGroup>
                      <FormControl
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
                        Clear
                      </Button>
                    </InputGroup>
                    {userRole === "Admin" && (
                      <Form.Select
                        value={selectedSeller}
                        onChange={(e) => { setSelectedSeller(e.target.value); setCurrentPage(1); }}
                        style={{ width: '200px' }}
                      >
                        <option value="">All Sellers</option>
                        {sellers.map((s) => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </Form.Select>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="primary" onClick={() => handleModalOpen()}>
                      Add New Product
                    </Button>
                    <Button variant="success" onClick={() => setShowScanner(true)}>
                      Scan Code
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleExport}
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

                {/* Scanner Section */}
                {showScanner && (
                  <div className="mb-3">
                    <div id="reader" className="mb-3"></div>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowScanner(false);
                        if (scanner) {
                          scanner.clear();
                        }
                      }}
                    >
                      Close Scanner
                    </Button>
                  </div>
                )}

                {/* Products Table — always rendered; rows swap in-place to prevent blinking */}
                <div style={{ position: 'relative', minHeight: '120px' }}>
                  {loading && (
                    <div
                      style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(255,255,255,0.7)', zIndex: 10, borderRadius: '4px'
                      }}
                    >
                      <Spinner animation="border" size="sm" />
                      <span className="ms-2 text-muted">Loading products…</span>
                    </div>
                  )}
                  {products.length > 0 ? (
                    <table className="table table-striped w-100 mt-3" style={{ opacity: loading ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                      <thead>
                        <tr>
                          <th>Images</th>
                          <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                            Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                            Price {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th onClick={() => handleSort('stock')} style={{ cursor: 'pointer' }}>
                            Stock {sortField === 'stock' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th>Barcode</th>
                          <th>QR Code</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product._id}>
                            <td>
                              {product.images && product.images.length > 0 && (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  style={{
                                    width: '50px',
                                    height: '50px',
                                    objectFit: 'cover',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => handleImageClick(product.images[0])}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/50';
                                  }}
                                />
                              )}
                            </td>
                            <td>{product.name}</td>
                            <td>₹{Number(product.price).toLocaleString('en-IN')}</td>
                            <td>{product.stock}</td>
                            <td style={{ cursor: 'pointer' }} onClick={() => handleBarcodeClick(product.barcodeId)}>
                              <Barcode
                                value={product.barcodeId}
                                width={1}
                                height={30}
                                fontSize={12}
                              />
                            </td>
                            <td style={{ cursor: 'pointer' }} onClick={() => handleQRClick(product.barcodeId)}>
                              <QRCode
                                value={product.barcodeId}
                                size={50}
                                level="H"
                              />
                            </td>
                            <td>
                              <div className="d-flex gap-2 align-items-center">
                                <BsPencilSquare
                                  className="text-primary"
                                  style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                                  onClick={() => handleModalOpen(product)}
                                  title="Edit"
                                />
                                <BsTrash
                                  className="text-danger"
                                  style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                                  onClick={() => handleDelete(product._id)}
                                  title="Delete"
                                />
                                <BsEye
                                  className="text-success"
                                  style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                                  onClick={() => handleViewDetails(product)}
                                  title="View Details"
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    !loading && <p className="text-center mt-3">No products found.</p>
                  )}
                </div>

                {/* Pagination — Previous / Next only */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <ul className="pagination mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          ← Previous
                        </button>
                      </li>
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next →
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Form Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedProduct ? "Edit Product" : "Add New Product"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && (
            <div className="alert alert-danger" role="alert">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="alert alert-success" role="alert">
              Product saved successfully!
            </div>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={formError && !formData.name ? "is-invalid" : ""}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category *</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className={formError && !formData.category ? "is-invalid" : ""}
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Images</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
              <div className="mt-2 d-flex gap-2">
                {previewImages.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price *</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                min="1"
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val < 0) return;
                  setFormData(prev => ({ ...prev, price: val }));
                }}
                className={formError && formData.price <= 0 ? "is-invalid" : ""}
                required
              />
              <div className="form-text">Price must be greater than ₹0</div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Stock *</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={formData.stock}
                min="0"
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val < 0) return;
                  setFormData(prev => ({ ...prev, stock: val }));
                }}
                className={formError && formData.stock < 0 ? "is-invalid" : ""}
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
              <Form.Check
                type="checkbox"
                label="Public"
                name="Public"
                checked={formData.Public}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : (selectedProduct ? "Update" : "Create")}
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
        contentClassName="border-0 shadow-lg"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <Modal.Body className="p-0" style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', overflow: 'hidden' }}>
          {detailProduct && (
            <div className="row g-0">
              {/* Left Section - Images (40%) */}
              <div className="col-md-5 p-4 bg-white d-flex flex-column align-items-center justify-content-start border-end">
                <div 
                  className="main-image-container mb-3 position-relative" 
                  style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', borderRadius: '8px', border: '1px solid #eee' }}
                >
                  <img
                    src={detailProduct.images && detailProduct.images.length > 0 ? detailProduct.images[0] : 'https://via.placeholder.com/400x400?text=No+Image'}
                    alt={detailProduct.name}
                    className="w-100 h-100 object-fit-cover"
                    style={{ transition: 'transform 0.3s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={() => detailProduct.images?.length > 0 && handleImageClick(detailProduct.images[0])}
                  />
                </div>
                {detailProduct.images && detailProduct.images.length > 1 && (
                  <div className="d-flex gap-2 flex-wrap justify-content-center w-100">
                    {detailProduct.images.slice(1, 4).map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt="thumbnail" 
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ddd' }}
                        onClick={() => handleImageClick(img)}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/60';
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right Section - Details (60%) */}
              <div className="col-md-7 p-4 d-flex flex-column">
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>
                  {detailProduct.name}
                </h3>
                
                <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                  <span style={{ fontSize: '20px', fontWeight: '600', color: '#2563EB' }}>
                    ₹{Number(detailProduct.price || 0).toLocaleString('en-IN')}
                  </span>
                  <div style={{ height: '24px', width: '1px', backgroundColor: '#E5E7EB' }}></div>
                  {detailProduct.stock > 0 ? (
                    <span className="badge bg-success" style={{ padding: '6px 12px', fontSize: '14px', fontWeight: '500' }}>
                      In Stock ({detailProduct.stock})
                    </span>
                  ) : (
                    <span className="badge bg-danger" style={{ padding: '6px 12px', fontSize: '14px', fontWeight: '500' }}>
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <p 
                    style={{ 
                      color: '#6B7280', 
                      fontSize: '15px', 
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      margin: 0
                    }}
                    title={detailProduct.description}
                  >
                    {detailProduct.description || "No description provided."}
                  </p>
                </div>

                {/* Codes Section */}
                <div className="row g-3 mb-4 flex-grow-1">
                  <div className="col-6 d-flex flex-column align-items-center justify-content-center bg-white p-3 rounded shadow-sm border text-center">
                    <p className="text-muted small mb-2 fw-semibold">Barcode</p>
                    <div id="detail-barcode" style={{ cursor: 'pointer', transform: 'scale(0.8)', transformOrigin: 'top center' }} onClick={() => handleBarcodeClick(detailProduct.barcodeId)}>
                      <Barcode value={detailProduct.barcodeId || "N/A"} width={1.5} height={40} fontSize={14} />
                    </div>
                    <Button variant="outline-secondary" size="sm" className="mt-2 text-nowrap" onClick={() => {
                        const svg = document.querySelector('#detail-barcode svg');
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
                            link.download = `barcode-${detailProduct.barcodeId}.png`;
                            link.href = canvas.toDataURL('image/png');
                            link.click();
                          };
                          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                        }
                      }} title="Download Barcode">
                      <BsDownload className="me-1" /> Download
                    </Button>
                  </div>
                  
                  <div className="col-6 d-flex flex-column align-items-center justify-content-center bg-white p-3 rounded shadow-sm border text-center">
                    <p className="text-muted small mb-2 fw-semibold">Scan to View</p>
                    <div id="detail-qrcode" style={{ cursor: 'pointer' }} onClick={() => handleQRClick(detailProduct.barcodeId)}>
                      <QRCode value={detailProduct.barcodeId || "N/A"} size={80} level="H" />
                    </div>
                    <Button variant="outline-secondary" size="sm" className="mt-2 text-nowrap" onClick={() => {
                        const svg = document.querySelector('#detail-qrcode svg');
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
                            link.download = `qrcode-${detailProduct.barcodeId}.png`;
                            link.href = canvas.toDataURL('image/png');
                            link.click();
                          };
                          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                        }
                      }} title="Download QR Code">
                      <BsDownload className="me-1" /> Download
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-end gap-2 mt-auto pt-3 border-top">
                  <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                    Close
                  </Button>
                  <Button variant="danger" onClick={() => {
                      setShowDetailModal(false);
                      handleDelete(detailProduct._id);
                    }} title="Delete Product">
                    <BsTrash className="me-1" /> Delete
                  </Button>
                  <Button variant="primary" style={{ backgroundColor: '#2563EB', borderColor: '#2563EB' }} onClick={() => {
                      setShowDetailModal(false);
                      handleModalOpen(detailProduct);
                    }} title="Edit Product">
                    <BsPencilSquare className="me-1" /> Edit
                  </Button>
                </div>

              </div>
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
              alt="Product"
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
      <Modal show={showBarcodeModal} onHide={() => setShowBarcodeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Barcode</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedBarcodeValue && (
            <Barcode value={selectedBarcodeValue} />
          )}
        </Modal.Body>
      </Modal>

      {/* QR Code Modal */}
      <Modal show={showQRModal} onHide={() => setShowQRModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedBarcodeValue && (
            <QRCode value={selectedBarcodeValue} size={256} />
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ProductManagement; 