import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../../../config/apiConfig';

const ReviewTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Form state
    const [editingId, setEditingId] = useState(null);
    const [rating, setRating] = useState(5);
    const [templateText, setTemplateText] = useState('');

    const getAuthHeaders = () => {
        const user = JSON.parse(localStorage.getItem("user"));
        return user?.tokens?.accessToken 
            ? { headers: { Authorization: `Bearer ${user.tokens.accessToken}` } }
            : null;
    };

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const auth = getAuthHeaders();
            if (!auth) return;
            const { data } = await axios.get(`${API_URL}/reviews/admin/templates`, auth);
            if (data.success) {
                setTemplates(data.data);
            }
        } catch (error) {
            console.error("Error fetching templates:", error);
            toast.error("Failed to load review templates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const openCreateModal = () => {
        setEditingId(null);
        setRating(5);
        setTemplateText('');
        setShowModal(true);
    };

    const openEditModal = (tmpl) => {
        setEditingId(tmpl.id);
        setRating(tmpl.rating);
        setTemplateText(tmpl.template);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!templateText.trim()) {
            return toast.error("Template text is required");
        }
        
        try {
            const auth = getAuthHeaders();
            if (!auth) return;

            if (editingId) {
                const { data } = await axios.put(`${API_URL}/reviews/admin/templates/${editingId}`, { rating, template: templateText }, auth);
                if (data.success) {
                    toast.success("Template updated successfully");
                    fetchTemplates();
                }
            } else {
                const { data } = await axios.post(`${API_URL}/reviews/admin/templates`, { rating, template: templateText }, auth);
                if (data.success) {
                    toast.success("Template created successfully");
                    fetchTemplates();
                }
            }
            closeModal();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error saving template");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        
        try {
            const auth = getAuthHeaders();
            if (!auth) return;

            const { data } = await axios.delete(`${API_URL}/reviews/admin/templates/${id}`, auth);
            if (data.success) {
                toast.success("Template deleted successfully");
                setTemplates(prev => prev.filter(t => t.id !== id));
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error deleting template");
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: "#2d3748" }}>AI Review Templates</h2>
                    <p className="text-muted mb-0">Manage JSON-driven predefined review texts across the platform.</p>
                </div>
                <button className="btn btn-primary px-4 rounded-3 d-flex align-items-center gap-2" onClick={openCreateModal}>
                    <i className="bi bi-plus-lg"></i> Add Template
                </button>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Active Templates <span className="badge bg-light text-dark ms-2">{templates.length}</span></h5>
                </div>
                
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="bi bi-robot display-4 mb-3 d-block text-secondary"></i>
                            <p className="mb-0">No templates found. Create one to get started.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4 py-3" style={{ width: '10%' }}>Rating</th>
                                        <th className="py-3" style={{ width: '75%' }}>Template Text</th>
                                        <th className="text-end px-4 py-3" style={{ width: '15%' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {templates.map(t => (
                                        <tr key={t.id}>
                                            <td className="px-4">
                                                <span className={`badge ${t.rating >= 4 ? 'bg-success' : 'bg-warning text-dark'} px-2 py-1`}>
                                                    {t.rating} <i className="bi bi-star-fill small"></i>
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <div className="text-wrap" style={{ maxWidth: '800px', fontSize: '0.95rem', color: '#4a5568' }}>
                                                    {t.template}
                                                </div>
                                            </td>
                                            <td className="text-end px-4">
                                                <button className="btn btn-sm btn-light me-2" onClick={() => openEditModal(t)}>
                                                    <i className="bi bi-pencil text-primary"></i>
                                                </button>
                                                <button className="btn btn-sm btn-light" onClick={() => handleDelete(t.id)}>
                                                    <i className="bi bi-trash text-danger"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Form Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 rounded-4 shadow">
                            <div className="modal-header border-bottom-0 pb-0">
                                <h5 className="modal-title fw-bold">
                                    {editingId ? 'Edit AI Template' : 'Create AI Template'}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body pt-3">
                                <form onSubmit={handleSave}>
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">Target Rating Mapping</label>
                                        <select className="form-select form-select-lg" value={rating} onChange={e => setRating(Number(e.target.value))}>
                                            <option value={5}>5 Stars (Highly Optimistic)</option>
                                            <option value={4}>4 Stars (Positive & Realistic)</option>
                                            <option value={3}>3 Stars (Constructive/Soft-Positive)</option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-bold d-flex justify-content-between">
                                            <span>Template Pattern</span>
                                            <small className="text-muted fw-normal">Use {"{{product_name}}"}, {"{{category_name}}"}, {"{{discount}}"}, {"{{platform_name}}"}</small>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            rows="5"
                                            value={templateText}
                                            onChange={e => setTemplateText(e.target.value)}
                                            placeholder="Write your dynamic review template here..."
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="d-flex justify-content-end gap-2 mt-4">
                                        <button type="button" className="btn btn-light px-4 rounded-3" onClick={closeModal}>Cancel</button>
                                        <button type="submit" className="btn btn-primary px-4 rounded-3">Save Template</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewTemplates;
