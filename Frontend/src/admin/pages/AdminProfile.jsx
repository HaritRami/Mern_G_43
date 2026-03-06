import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import "./AdminProfile.css";

const AdminProfile = () => {
    const [activeTab, setActiveTab] = useState("profile-overview");
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fieldLoading, setFieldLoading] = useState({
        name: false,
        mobile: false,
        bio: false,
        avatar: false
    });
    const [editMode, setEditMode] = useState({
        name: false,
        mobile: false,
        bio: false
    });
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        bio: "",
        avatar: null
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [previewImage, setPreviewImage] = useState(null);
    const navigate = useNavigate();
    const editableFieldRefs = useRef({});

    const API_URL = "http://localhost:5000/api/user";

    useEffect(() => {
        const checkAdminAccess = () => {
            const savedUser = JSON.parse(localStorage.getItem("user"));
            if (!savedUser || !savedUser.tokens?.accessToken) {
                toast.error("Please login first");
                navigate("/");
                return;
            }

            if (savedUser?.role !== "Admin") {
                toast.error("Access denied. Admin privileges required.");
                navigate("/");
                return;
            }
        };

        checkAdminAccess();
    }, [navigate]);

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            Object.keys(editMode).forEach(field => {
                if (editMode[field] && editableFieldRefs.current[field] && !editableFieldRefs.current[field].contains(event.target)) {
                    setEditMode(prev => ({ ...prev, [field]: false }));
                }
            });
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [editMode]);

    const fetchUserData = async () => {
        try {
            const savedUser = JSON.parse(localStorage.getItem("user"));
            if (!savedUser || !savedUser.tokens?.accessToken) {
                toast.error("Please login first");
                return;
            }
            setUserData(savedUser);
            setFormData({
                name: savedUser.name || "",
                email: savedUser.email || "",
                mobile: savedUser.mobile || "",
                bio: savedUser.bio || "",
            });
            if (savedUser.avatar) {
                setPreviewImage(`http://localhost:5000${savedUser.avatar}`);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error(error.response?.data?.message || "Error fetching profile data");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e, field) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleInputSave = async (field) => {
        try {
            setFieldLoading(prev => ({ ...prev, [field]: true }));
            const savedUser = JSON.parse(localStorage.getItem("user"));
            if (!savedUser || !savedUser.tokens?.accessToken) {
                toast.error("Please login first");
                return;
            }

            const formDataToSend = new FormData();
            formDataToSend.append(field, formData[field]);

            const response = await axios.put(
                `${API_URL}/profile/update/${savedUser.id}`,
                formDataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${savedUser.tokens.accessToken}`
                    }
                }
            );

            if (response.data.success) {
                // Update the user data in localStorage
                const updatedUser = {
                    ...savedUser,
                    [field]: formData[field]
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                
                // Update the state
                setUserData(updatedUser);
                toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
            }
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
            toast.error(error.response?.data?.message || `Error updating ${field}`);
            fetchUserData(); // Revert changes on error
        } finally {
            setFieldLoading(prev => ({ ...prev, [field]: false }));
            setEditMode(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setFieldLoading(prev => ({ ...prev, avatar: true }));
                const savedUser = JSON.parse(localStorage.getItem("user"));
                if (!savedUser || !savedUser.tokens?.accessToken) {
                    toast.error("Please login first");
                    return;
                }

                // Show preview immediately
                const previewUrl = URL.createObjectURL(file);
                setPreviewImage(previewUrl);

                const formDataToSend = new FormData();
                formDataToSend.append("avatar", file);

                const response = await axios.put(
                    `${API_URL}/profile/update/${savedUser.id}`,
                    formDataToSend,
                    {
                        headers: {
                            Authorization: `Bearer ${savedUser.tokens.accessToken}`,
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );

                if (response.data.success) {
                    // Update the user data in localStorage with the new avatar path
                    const updatedUser = {
                        ...savedUser,
                        avatar: response.data.data.avatar
                    };
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    
                    // Update the state
                    setUserData(updatedUser);
                    toast.success("Profile image updated successfully");
                }
            } catch (error) {
                console.error("Error updating profile image:", error);
                toast.error(error.response?.data?.message || "Error updating profile image");
                setPreviewImage(null);
                fetchUserData(); // Revert on error
            } finally {
                setFieldLoading(prev => ({ ...prev, avatar: false }));
            }
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }

        try {
            const savedUser = JSON.parse(localStorage.getItem("user"));
            if (!savedUser || !savedUser.tokens?.accessToken) {
                toast.error("Please login first");
                return;
            }

            const response = await axios.put(
                `${API_URL}/change-password/${savedUser.id}`,
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                },
                {
                    headers: {
                        Authorization: `Bearer ${savedUser.tokens.accessToken}`
                    }
                }
            );

            if (response.data.success) {
                toast.success("Password updated successfully");
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
                setActiveTab("profile-overview");
            }
        } catch (error) {
            console.error("Error updating password:", error);
            toast.error(error.response?.data?.message || "Error updating password");
        }
    };

    const EditableField = ({ field, label, value, placeholder }) => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                handleInputSave(field);
            }
            if (e.key === 'Escape') {
                setEditMode(prev => ({ ...prev, [field]: false }));
                setFormData(prev => ({
                    ...prev,
                    [field]: userData[field] || ''
                }));
            }
        };

        return (
            <div className="row mb-3">
                <div className="col-lg-3 col-md-4 label">{label}</div>
                <div className="col-lg-9 col-md-8 editable-field" ref={el => editableFieldRefs.current[field] = el}>
                    {editMode[field] ? (
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                value={value}
                                onChange={(e) => handleInputChange(e, field)}
                                onBlur={() => handleInputSave(field)}
                                onKeyDown={handleKeyDown}
                                disabled={fieldLoading[field]}
                                autoFocus
                            />
                            {fieldLoading[field] && (
                                <span className="input-group-text">
                                    <i className="bi bi-hourglass-split"></i>
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="d-flex align-items-center">
                            <span className="me-2">{value || placeholder}</span>
                            <button 
                                className="btn btn-link btn-sm p-0 edit-button"
                                onClick={() => setEditMode(prev => ({ ...prev, [field]: true }))}
                            >
                                <i className="bi bi-pencil-fill text-primary"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Update the bio field to use the same pattern
    const handleBioSave = async () => {
        await handleInputSave('bio');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <main id="main" className="main">
                <div className="pagetitle">
                    <h1>Profile</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <a href="index.html">Home</a>
                            </li>
                            <li className="breadcrumb-item">Users</li>
                            <li className="breadcrumb-item active">Profile</li>
                        </ol>
                    </nav>
                </div>

                <section className="section profile">
                    <div className="row">
                        <div className="col-xl-4">
                            <div className="card">
                                <div className="card-body profile-card pt-4 d-flex flex-column align-items-center">
                                    <div className="profile-image-container position-relative" style={{ width: "120px", height: "120px" }}>
                                        {fieldLoading.avatar && (
                                            <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50 rounded-circle">
                                                <div className="spinner-border text-light" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        )}
                                        <img
                                            src={previewImage || (userData?.avatar ? `http://localhost:5000${userData.avatar}` : "assets/img/profile-img.jpg")}
                                            alt="Profile"
                                            className="rounded-circle profile-image w-100 h-100"
                                            style={{ objectFit: "cover" }}
                                        />
                                        <div className="image-edit-overlay position-absolute w-100 h-100 top-0 start-0 d-flex justify-content-center align-items-center rounded-circle">
                                            <label htmlFor="avatar-upload" className="edit-icon btn btn-light btn-sm rounded-circle" style={{ width: "32px", height: "32px" }}>
                                                <i className="bi bi-pencil-fill"></i>
                                            </label>
                                            <input
                                                type="file"
                                                id="avatar-upload"
                                                className="d-none"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                disabled={fieldLoading.avatar}
                                            />
                                        </div>
                                    </div>
                                    <h2 className="mt-3">{userData?.name}</h2>
                                    <h3 className="text-muted">{userData?.role}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-8">
                            <div className="card">
                                <div className="card-body pt-3">
                                    <ul className="nav nav-tabs nav-tabs-bordered">
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link ${activeTab === "profile-overview" ? "active" : ""}`}
                                                onClick={() => setActiveTab("profile-overview")}
                                            >
                                                Overview
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link ${activeTab === "profile-change-password" ? "active" : ""}`}
                                                onClick={() => setActiveTab("profile-change-password")}
                                            >
                                                Change Password
                                            </button>
                                        </li>
                                    </ul>

                                    <div className="tab-content pt-2">
                                        <div className={`tab-pane fade ${activeTab === "profile-overview" ? "show active" : ""}`}>
                                            <h5 className="card-title">About</h5>
                                            <div className="editable-field" ref={el => editableFieldRefs.current.bio = el}>
                                                {editMode.bio ? (
                                                    <textarea
                                                        className="form-control"
                                                        value={formData.bio}
                                                        onChange={(e) => handleInputChange(e, 'bio')}
                                                        onBlur={handleBioSave}
                                                        disabled={fieldLoading.bio}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <div className="d-flex align-items-start">
                                                        <p className="small fst-italic me-2">
                                                            {formData.bio || "No bio added yet"}
                                                        </p>
                                                        <button 
                                                            className="btn btn-link btn-sm p-0 edit-button"
                                                            onClick={() => setEditMode(prev => ({ ...prev, bio: true }))}
                                                        >
                                                            <i className="bi bi-pencil-fill text-primary"></i>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <h5 className="card-title">Profile Details</h5>
                                            
                                            <EditableField 
                                                field="name"
                                                label="Full Name"
                                                value={formData.name}
                                                placeholder="Click to add name"
                                            />

                                            <div className="row mb-3">
                                                <div className="col-lg-3 col-md-4 label">Email</div>
                                                <div className="col-lg-9 col-md-8">
                                                    {formData.email}
                                                </div>
                                            </div>

                                            <EditableField 
                                                field="mobile"
                                                label="Mobile"
                                                value={formData.mobile}
                                                placeholder="Click to add mobile"
                                            />

                                            <div className="row mb-3">
                                                <div className="col-lg-3 col-md-4 label">Role</div>
                                                <div className="col-lg-9 col-md-8">
                                                    {userData?.role}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`tab-pane fade ${activeTab === "profile-change-password" ? "show active" : ""}`}>
                                            <form onSubmit={handlePasswordUpdate}>
                                                <div className="row mb-3">
                                                    <label htmlFor="currentPassword" className="col-md-4 col-lg-3 col-form-label">
                                                        Current Password
                                                    </label>
                                                    <div className="col-md-8 col-lg-9">
                                                        <input
                                                            type="password"
                                                            className="form-control"
                                                            id="currentPassword"
                                                            name="currentPassword"
                                                            value={passwordData.currentPassword}
                                                            onChange={(e) => setPasswordData(prev => ({
                                                                ...prev,
                                                                currentPassword: e.target.value
                                                            }))}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="row mb-3">
                                                    <label htmlFor="newPassword" className="col-md-4 col-lg-3 col-form-label">
                                                        New Password
                                                    </label>
                                                    <div className="col-md-8 col-lg-9">
                                                        <input
                                                            type="password"
                                                            className="form-control"
                                                            id="newPassword"
                                                            name="newPassword"
                                                            value={passwordData.newPassword}
                                                            onChange={(e) => setPasswordData(prev => ({
                                                                ...prev,
                                                                newPassword: e.target.value
                                                            }))}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="row mb-3">
                                                    <label htmlFor="confirmPassword" className="col-md-4 col-lg-3 col-form-label">
                                                        Re-enter New Password
                                                    </label>
                                                    <div className="col-md-8 col-lg-9">
                                                        <input
                                                            type="password"
                                                            className="form-control"
                                                            id="confirmPassword"
                                                            name="confirmPassword"
                                                            value={passwordData.confirmPassword}
                                                            onChange={(e) => setPasswordData(prev => ({
                                                                ...prev,
                                                                confirmPassword: e.target.value
                                                            }))}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="text-center">
                                                    <button type="submit" className="btn btn-primary">
                                                        Change Password
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default AdminProfile;