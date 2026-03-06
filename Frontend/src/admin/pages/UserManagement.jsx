import React, { useState, useEffect, useRef } from "react";
import PageTitle from "../components/PageTitle";
import { Modal, Button, Form, Spinner, InputGroup, FormControl } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';
import { BsPencilSquare, BsTrash, BsEye, BsDownload, BsUpload, BsLock } from 'react-icons/bs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    role: "User",
    status: "Active"
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);

  const API_URL = "http://localhost:5000/api";

  // Fetch users with pagination and sorting
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      const response = await axios.get(`${API_URL}/user`, {
        params: {
          search: searchTerm,
          sortField,
          sortOrder: sortDirection,
          page: currentPage,
          limit: itemsPerPage
        },
        headers: {
          Authorization: `Bearer ${savedUser.tokens.accessToken}`
        }
      });

      if (response.data && response.data.success) {
        setUsers(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setTotalItems(response.data.pagination.total);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching users!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, sortField, sortDirection, currentPage]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleModalOpen = (user = null) => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        mobile: user.mobile || "",
        role: user.role,
        status: user.status
      });
      setSelectedUser(user);
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        mobile: "",
        role: "User",
        status: "Active"
      });
      setSelectedUser(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      const formDataWithImage = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) formDataWithImage.append(key, formData[key]);
      });
      if (selectedImage) {
        formDataWithImage.append("avatar", selectedImage);
      }

      const headers = {
        Authorization: `Bearer ${savedUser.tokens.accessToken}`
      };

      if (selectedUser) {
        await axios.put(
          `${API_URL}/user/profile/update/${selectedUser._id}`,
          formDataWithImage,
          { headers }
        );
        toast.success("User updated successfully!");
      } else {
        await axios.post(`${API_URL}/user/register`, formDataWithImage);
        toast.success("User created successfully!");
      }

      setShowModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving user!");
    }
  };

  const handleDelete = async (userId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      });

      if (result.isConfirmed) {
        const savedUser = JSON.parse(localStorage.getItem("user"));
        await axios.delete(`${API_URL}/user/delete/${userId}`, {
          headers: {
            Authorization: `Bearer ${savedUser.tokens.accessToken}`
          }
        });

        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        Swal.fire("Deleted!", "User has been deleted.", "success");
      }
    } catch (error) {
      Swal.fire("Error!", error.response?.data?.message || "Failed to delete user.", "error");
    }
  };

  const handleViewDetails = async (user) => {
    try {
      setLoading(true);
      const savedUser = JSON.parse(localStorage.getItem("user"));
      
      if (!savedUser || !savedUser.tokens || !savedUser.tokens.accessToken) {
        toast.error("Authentication token not found!");
        return;
      }

      console.log('Fetching user details for:', user._id);
      const response = await axios.get(`${API_URL}/user/profile/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${savedUser.tokens.accessToken}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      console.log('API Response:', response.data);

      if (response.data && response.data.success) {
        setDetailUser(response.data.data);
        setShowDetailModal(true);
      } else {
        toast.error(response.data?.message || "Error fetching user details!");
      }
    } catch (error) {
      console.error("Error fetching user details:", error.response || error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        // Handle token expiration - you might want to redirect to login
      } else if (error.response?.status === 404) {
        toast.error("User not found!");
      } else {
        toast.error(error.response?.data?.message || "Error fetching user details!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (userId) => {
    setSelectedUser({ _id: userId });
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      await axios.put(
        `${API_URL}/user/change-password/${selectedUser._id}`,
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${savedUser.tokens.accessToken}`
          }
        }
      );
      toast.success("Password updated successfully!");
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating password!");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const exportToExcel = () => {
    const exportData = users.map(user => ({
      'Name': user.name,
      'Email': user.email,
      'Mobile': user.mobile || 'N/A',
      'Role': user.role,
      'Status': user.status,
      'Created At': new Date(user.createdAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `users_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <main id="main" className="main">
      <section className="section dashboard">
        <PageTitle title="User Management" />
        <ToastContainer />
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <InputGroup style={{ width: '300px' }}>
                      <FormControl
                        placeholder="Search users..."
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
                      Add New User
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={exportToExcel}
                      title="Export to Excel"
                    >
                      <BsDownload className="me-1" /> Export
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center mt-3">
                    <Spinner animation="border" />
                  </div>
                ) : users.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped mt-3">
                      <thead>
                        <tr>
                          <th>Avatar</th>
                          <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                            Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                            Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th>Mobile</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user._id}>
                            <td>
                              <img
                                src={user.avatar ? `http://localhost:5000${user.avatar}` : 'https://via.placeholder.com/40'}
                                alt={user.name}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  objectFit: 'cover'
                                }}
                              />
                            </td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.mobile || 'N/A'}</td>
                            <td>
                              <span className={`badge bg-${user.role === 'Admin' ? 'danger' : 'primary'}`}>
                                {user.role}
                              </span>
                            </td>
                            <td>
                              <span className={`badge bg-${user.status === 'Active' ? 'success' : 'warning'}`}>
                                {user.status}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <BsPencilSquare
                                  className="text-primary"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleModalOpen(user)}
                                  title="Edit"
                                />
                                <BsTrash
                                  className="text-danger"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleDelete(user._id)}
                                  title="Delete"
                                />
                                <BsEye
                                  className="text-success"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleViewDetails(user)}
                                  title="View Details"
                                />
                                <BsLock
                                  className="text-warning"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handlePasswordChange(user._id)}
                                  title="Change Password"
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center mt-3">No users found.</p>
                )}

                {/* Pagination */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                  </div>
                  <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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

      {/* Add/Edit User Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedUser ? "Edit User" : "Add New User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
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
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Mobile</Form.Label>
                  <Form.Control
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    pattern="[0-9]{10}"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            {!selectedUser && (
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!selectedUser}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Avatar</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              {selectedUser ? "Update" : "Create"} User
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* User Details Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailUser && (
            <div className="p-3">
              <div className="text-center mb-4">
                <img
                  src={detailUser.avatar ? `http://localhost:5000${detailUser.avatar}` : 'https://via.placeholder.com/150'}
                  alt={detailUser.name}
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: '1rem'
                  }}
                />
                <h4>{detailUser.name}</h4>
                <p className="text-muted">{detailUser.email}</p>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <h5>Basic Information</h5>
                  <table className="table">
                    <tbody>
                      <tr>
                        <td>Mobile:</td>
                        <td>{detailUser.mobile || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td>Role:</td>
                        <td>
                          <span className={`badge bg-${detailUser.role === 'Admin' ? 'danger' : 'primary'}`}>
                            {detailUser.role}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>Status:</td>
                        <td>
                          <span className={`badge bg-${detailUser.status === 'Active' ? 'success' : 'warning'}`}>
                            {detailUser.status}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h5>Additional Information</h5>
                  <table className="table">
                    <tbody>
                      <tr>
                        <td>Joined:</td>
                        <td>{new Date(detailUser.createdAt).toLocaleDateString()}</td>
                      </tr>
                      <tr>
                        <td>Last Login:</td>
                        <td>{detailUser.last_login_date ? new Date(detailUser.last_login_date).toLocaleString() : 'Never'}</td>
                      </tr>
                      <tr>
                        <td>Email Verified:</td>
                        <td>
                          <span className={`badge bg-${detailUser.verify_email ? 'success' : 'warning'}`}>
                            {detailUser.verify_email ? 'Yes' : 'No'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {detailUser.bio && (
                <div className="mt-3">
                  <h5>Bio</h5>
                  <p>{detailUser.bio}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Change Password Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePasswordSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Update Password
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </main>
  );
};

export default UserManagement;