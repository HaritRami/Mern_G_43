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

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: [],
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

  const API_URL = "http://localhost:5000/api/product";
  const CATEGORY_API_URL = "http://localhost:5000/api/category";
  const SUBCATEGORY_API_URL = "http://localhost:5000/api/sub-category";

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
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
        setProducts(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setTotalItems(response.data.pagination.total);
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
      const [categoriesRes, subCategoriesRes] = await Promise.all([
        axios.get(CATEGORY_API_URL),
        axios.get(SUBCATEGORY_API_URL)
      ]);
      setCategories(categoriesRes.data.data);
      setSubCategories(subCategoriesRes.data.data);
    } catch (error) {
      toast.error("Error fetching categories!");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, sortField, sortDirection, searchTerm]);

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
          { headers: { 'Content-Type': 'multipart/form-data' }}
        );
        toast.success("Product updated successfully!");
      } else {
        await axios.post(
          API_URL,
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' }}
        );
        toast.success("Product created successfully!");
      }
      
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      toast.error("Error saving product!");
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
        await axios.delete(`${API_URL}/${productId}`);
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
      const response = await axios.post(`${API_URL}/import`, formData);
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

  const handleModalOpen = (product) => {
    setSelectedProduct(product);
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
    <main id="main" className="main">
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

                {/* Products Table */}
                {loading ? (
                  <div className="text-center mt-3">
                    <Spinner animation="border" />
                  </div>
                ) : products.length > 0 ? (
                  <table className="table table-striped mt-3">
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
                          <td>${product.price}</td>
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
                  <p className="text-center mt-3">No products found.</p>
                )}

                {/* Pagination Section */}
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

      {/* Product Form Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedProduct ? "Edit Product" : "Add New Product"}
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
              <Form.Label>Categories</Form.Label>
              <Form.Select
                multiple
                name="category"
                value={formData.category}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData(prev => ({ ...prev, category: values }));
                }}
              >
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
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={formData.stock}
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
              <Form.Check
                type="checkbox"
                label="Public"
                name="Public"
                checked={formData.Public}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              {selectedProduct ? "Update" : "Create"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Product Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailProduct && (
            <div>
              <h4>{detailProduct.name}</h4>
              <p><strong>Price:</strong> ${detailProduct.price}</p>
              <p><strong>Stock:</strong> {detailProduct.stock}</p>
              <p><strong>Description:</strong> {detailProduct.description}</p>
              <div className="mt-3">
                <h5>Images</h5>
                <div className="d-flex gap-2 flex-wrap">
                  {detailProduct.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Product ${index + 1}`}
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        objectFit: 'cover',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleImageClick(image)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/100';
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <h5>Barcode</h5>
                <Barcode value={detailProduct.barcodeId} />
              </div>
              <div className="mt-3">
                <h5>QR Code</h5>
                <QRCode value={detailProduct.barcodeId} size={256} />
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
    </main>
  );
};

export default ProductManagement; 