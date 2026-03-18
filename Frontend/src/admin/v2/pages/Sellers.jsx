import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000/api/").replace(/\/+$/, "");

const Sellers = () => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        mobile: "",
        status: "Active",
    });

    const getAuthHeaders = () => {
        const savedUser = JSON.parse(localStorage.getItem("user"));
        const token = savedUser?.tokens?.accessToken;
        if (!token) return null;

        return {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        };
    };

    // ── Fetch sellers (users with role "Seller") ──
    const fetchSellers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/admin/users`, getAuthHeaders());
            if (response.data?.success) {
                setSellers(
                    response.data.data.filter(
                        (user) => user.role?.toLowerCase() === "seller"
                    )
                );
            }
        } catch (error) {
            const message = error.response?.data?.message || "Error fetching sellers";
            toast.error(message);
            if (error.response?.status === 401) {
                // Invalid or missing token
                navigate('/account/signin');
            }
        } finally {
            setLoading(false);
        }
    };

    const navigate = useNavigate();

    useEffect(() => {
        const headers = getAuthHeaders();
        if (!headers) {
            toast.error("Please sign in to view sellers.");
            navigate('/account/signin');
            return;
        }
        fetchSellers();
    }, [navigate]);

    // ── Search filter ──
    const filtered = sellers.filter(
        (s) =>
            s.name?.toLowerCase().includes(search.toLowerCase()) ||
            s.email?.toLowerCase().includes(search.toLowerCase()) ||
            s.mobile?.includes(search)
    );

    // ── Open modal for add / edit ──
    const handleModalOpen = (seller = null) => {
        if (seller) {
            setFormData({
                name: seller.name || "",
                email: seller.email || "",
                password: "",
                mobile: seller.mobile || "",
                status: seller.status || "Active",
            });
            setSelectedSeller(seller);
        } else {
            setFormData({ name: "", email: "", password: "", mobile: "", status: "Active" });
            setSelectedSeller(null);
        }
        setShowModal(true);
    };

    // ── Handle input changes ──
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ── Create or update seller ──
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedSeller) {
                // Update existing seller
                const updateData = new FormData();
                updateData.append("name", formData.name);
                updateData.append("mobile", formData.mobile);
                // userId tells the backend which user to update
                updateData.append("userId", selectedSeller._id);

                await axios.put(
                    `${API_URL}/admin/users/profile/update/${selectedSeller._id}`,
                    updateData,
                    getAuthHeaders()
                );
                toast.success("Seller updated successfully!");
            } else {
                // Create new seller — uses register endpoint
                await axios.post(`${API_URL}/admin/users/register`, {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    mobile: formData.mobile || undefined,
                    role: "Seller",
                });
                toast.success("Seller created successfully!");
            }
            setShowModal(false);
            fetchSellers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error saving seller");
        }
    };

    // ── Delete seller ──
    const handleDelete = async (sellerId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This seller account will be permanently deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, delete it!",
        });
        if (!result.isConfirmed) return;

        try {
            await axios.delete(`${API_URL}/admin/users/delete/${sellerId}`, getAuthHeaders());
            setSellers((prev) => prev.filter((s) => s._id !== sellerId));
            Swal.fire("Deleted!", "Seller has been deleted.", "success");
        } catch (error) {
            Swal.fire("Error!", error.response?.data?.message || "Failed to delete seller.", "error");
        }
    };

    // ── Status badge color helper ──
    const statusBadge = (status) => {
        const map = { Active: "success", Inactive: "secondary", Suspended: "danger" };
        return map[status] || "secondary";
    };

    return (
        <>
            <ToastContainer />
            <div className="pagetitle">
                <h1>Seller Management</h1>
                <nav>
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                        <li className="breadcrumb-item active">Sellers</li>
                    </ol>
                </nav>
            </div>

            <div className="card">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <h5 className="card-title mb-0">Sellers</h5>
                        <div className="d-flex gap-2 align-items-center">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search sellers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ width: "220px" }}
                            />
                            {search && (
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => setSearch("")}>
                                    Clear
                                </button>
                            )}
                            <Button variant="primary" onClick={() => handleModalOpen()}>
                                <i className="bi bi-plus-lg me-1" /> Add Seller
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Avatar</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                        <th style={{ width: "120px" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length ? (
                                        filtered.map((seller) => (
                                            <tr key={seller._id}>
                                                <td>
                                                    <img
                                                        src={
                                                            seller.avatar
                                                                ? `http://localhost:5000${seller.avatar}`
                                                                : "https://ui-avatars.com/api/?name=" + encodeURIComponent(seller.name) + "&background=4154f1&color=fff&size=40"
                                                        }
                                                        alt={seller.name}
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                            borderRadius: "50%",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                </td>
                                                <td className="fw-semibold">{seller.name}</td>
                                                <td>{seller.email}</td>
                                                <td>{seller.mobile || "—"}</td>
                                                <td>
                                                    <span className={`badge bg-${statusBadge(seller.status)}`}>
                                                        {seller.status || "Active"}
                                                    </span>
                                                </td>
                                                <td>{seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : "—"}</td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => handleModalOpen(seller)}
                                                            title="Edit"
                                                        >
                                                            <i className="bi bi-pencil-square" />
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(seller._id)}
                                                            title="Delete"
                                                        >
                                                            <i className="bi bi-trash" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="text-center py-4 text-muted">
                                                No sellers found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}


                </div>
            </div>

            {/* Add / Edit Seller Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedSeller ? "Edit Seller" : "Add New Seller"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder="Full name"
                            />
                        </Form.Group>

                        {!selectedSeller && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="seller@example.com"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        minLength={6}
                                        placeholder="Min 6 characters"
                                    />
                                </Form.Group>
                            </>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Mobile</Form.Label>
                            <Form.Control
                                type="text"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleInputChange}
                                pattern="[0-9]{10}"
                                placeholder="10-digit number"
                            />
                        </Form.Group>

                        {selectedSeller && (
                            <Form.Group className="mb-3">
                                <Form.Label>Status</Form.Label>
                                <Form.Select name="status" value={formData.status} onChange={handleInputChange}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Suspended">Suspended</option>
                                </Form.Select>
                            </Form.Group>
                        )}

                        <div className="d-flex gap-2 justify-content-end">
                            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button variant="primary" type="submit">
                                {selectedSeller ? "Update Seller" : "Create Seller"}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Sellers;
