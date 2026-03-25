import { API_URL as GLOBAL_API_URL } from '../../config/apiConfig';
import React, { useState, useEffect, useRef } from "react";
import { ReactComponent as IconPerson } from "bootstrap-icons/icons/person.svg";
import { ReactComponent as IconEnvelope } from "bootstrap-icons/icons/envelope.svg";
import { ReactComponent as IconPhone } from "bootstrap-icons/icons/phone.svg";
import { ReactComponent as IconFingerprint } from "bootstrap-icons/icons/fingerprint.svg";
import { ReactComponent as IconPencil } from "bootstrap-icons/icons/pencil.svg";
import { ReactComponent as IconLocation } from "bootstrap-icons/icons/geo-alt.svg";
import { ReactComponent as IconPlus } from "bootstrap-icons/icons/plus.svg";
import { ReactComponent as IconTrash } from "bootstrap-icons/icons/trash.svg";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MyProfileView = () => {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState({
    name: false,
    email: false,
    mobile: false
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: ""
  });
  const [loading, setLoading] = useState({
    name: false,
    email: false,
    mobile: false
  });
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    address_line: "",
    city: "",
    state: "",
    country: "",
    mobile: ""
  });
  const [addressFormErrors, setAddressFormErrors] = useState({});
  const [editingAddressId, setEditingAddressId] = useState(null);
  const editableFieldRefs = useRef({});
  const fileInputRef = useRef(null);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem('user');

    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
        setFormData({
          name: parsedData.name || "",
          email: parsedData.email || "",
          mobile: parsedData.mobile || ""
        });
        fetchAddresses(parsedData.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
        toast.error('Error loading user data');
      }
    }
  }, []);

  const fetchAddresses = async (userId) => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (!savedUser || !savedUser.tokens?.accessToken) {
        toast.error('🔒 Please login to view your addresses');
        return;
      }

      setLoading(true);
      const response = await axios.get(
        `${GLOBAL_API_URL}/address/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${savedUser.tokens.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setAddresses(response.data.data);
        if (response.data.data.length === 0) {
          toast.info('📫 Add your first delivery address!');
        }
      }
    } catch (error) {
      handleApiError(error, 'fetching addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error, action) => {
    console.error(`Error ${action} address:`, error);
    if (error.response?.status === 401) {
      toast.error('🔒 Session expired. Please login again');
    } else if (error.response?.status === 403) {
      toast.error('⛔ You are not authorized to perform this action');
    } else if (error.response?.status === 404) {
      toast.error('❓ Address not found');
      // Refresh the list to ensure UI is in sync
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (savedUser?.id) {
        fetchAddresses(savedUser.id);
      }
    } else if (error.response?.status === 400) {
      if (error.response.data.errors) {
        Object.values(error.response.data.errors).forEach(err => toast.error(`📝 ${err}`));
      } else {
        toast.error(`📝 ${error.response.data.message || 'Please fill all required fields'}`);
      }
    } else {
      toast.error(`❌ Error ${action} address. Please try again`);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (!savedUser || !savedUser.tokens?.accessToken) {
        toast.error('🔒 Authentication required. Please login to manage addresses.');
        return;
      }

      // Form validation
      if (!addressFormData.address_line.trim()) {
        errors.address_line = 'Address line is required';
      } else if (addressFormData.address_line.trim().length < 5) {
        errors.address_line = 'Address line must be at least 5 characters long';
      } else if (addressFormData.address_line.trim().length > 100) {
        errors.address_line = 'Address line must not exceed 100 characters';
      }

      if (!addressFormData.city.trim()) {
        errors.city = 'City is required';
      } else if (addressFormData.city.trim().length < 2) {
        errors.city = 'City must be at least 2 characters long';
      } else if (addressFormData.city.trim().length > 50) {
        errors.city = 'City must not exceed 50 characters';
      } else if (!/^[a-zA-Z\s-]+$/.test(addressFormData.city.trim())) {
        errors.city = 'City can only contain letters, spaces, and hyphens';
      }

      if (!addressFormData.state.trim()) {
        errors.state = 'State is required';
      } else if (addressFormData.state.trim().length < 2) {
        errors.state = 'State must be at least 2 characters long';
      } else if (addressFormData.state.trim().length > 50) {
        errors.state = 'State must not exceed 50 characters';
      } else if (!/^[a-zA-Z\s-]+$/.test(addressFormData.state.trim())) {
        errors.state = 'State can only contain letters, spaces, and hyphens';
      }

      if (!addressFormData.country.trim()) {
        errors.country = 'Country is required';
      } else if (addressFormData.country.trim().length < 2) {
        errors.country = 'Country must be at least 2 characters long';
      } else if (addressFormData.country.trim().length > 50) {
        errors.country = 'Country must not exceed 50 characters';
      } else if (!/^[a-zA-Z\s-]+$/.test(addressFormData.country.trim())) {
        errors.country = 'Country can only contain letters, spaces, and hyphens';
      }

      if (!addressFormData.mobile.trim()) {
        errors.mobile = 'Mobile number is required';
      } else if (!/^\+?[0-9]{10,15}$/.test(addressFormData.mobile.trim())) {
        errors.mobile = 'Mobile number must be 10-15 digits with an optional leading +';
      }

      // If there are errors, set them and return
      if (Object.keys(errors).length > 0) {
        setAddressFormErrors(errors);
        return;
      }

      // Clear errors if validation passes
      setAddressFormErrors({});

      setLoading(true);
      const url = editingAddressId
        ? `${GLOBAL_API_URL}/address/${editingAddressId}`
        : `${GLOBAL_API_URL}/address`;

      const method = editingAddressId ? 'put' : 'post';

      // Include user ID in the request body for new addresses
      const requestData = {
        ...addressFormData,
        user: savedUser.id // This will be ignored by backend for updates
      };

      const response = await axios[method](
        url,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${savedUser.tokens.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(editingAddressId
          ? '✅ Address updated successfully!'
          : '✅ New address added successfully!'
        );
        fetchAddresses(savedUser.id);
        setShowAddressForm(false);
        setEditingAddressId(null);
        setAddressFormData({
          address_line: "",
          city: "",
          state: "",
          country: "",
          mobile: userData?.mobile || "" // Set default mobile from user data
        });
      }
    } catch (error) {
      handleApiError(error, editingAddressId ? 'updating' : 'adding');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (addresses.length <= 1) {
      toast.error('Cannot delete your only address. Please add another address first.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this address? This action cannot be undone.')) {
      return;
    }

    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (!savedUser || !savedUser.tokens?.accessToken) {
        toast.error('🔒 Authentication required. Please login to delete address.');
        return;
      }

      setLoading(true);
      const response = await axios.delete(
        `${GLOBAL_API_URL}/address/${addressId}`,
        {
          headers: {
            Authorization: `Bearer ${savedUser.tokens.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('🗑️ Address deleted successfully!');
        fetchAddresses(savedUser.id);
      }
    } catch (error) {
      handleApiError(error, 'deleting');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (!savedUser || !savedUser.tokens?.accessToken) {
        toast.error('🔒 Authentication required. Please login to manage addresses.');
        return;
      }

      setLoading(true);
      const response = await axios.put(
        `${GLOBAL_API_URL}/address/${addressId}`,
        { isDefault: true },
        {
          headers: {
            Authorization: `Bearer ${savedUser.tokens.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('⭐ Address set as default successfully!');
        fetchAddresses(savedUser.id);
      }
    } catch (error) {
      handleApiError(error, 'updating default');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setAddressFormData({
      address_line: address.address_line,
      city: address.city,
      state: address.state,
      country: address.country,
      mobile: address.mobile
    });
    setAddressFormErrors({});
    setEditingAddressId(address._id);
    setShowAddressForm(true);
  };

  const handleAddNewAddress = () => {
    setShowAddressForm(true);
    setEditingAddressId(null);
    setAddressFormData({
      address_line: "",
      city: "",
      state: "",
      country: "",
      mobile: userData?.mobile || "" // Set default mobile from user data
    });
    setAddressFormErrors({});
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(editMode).forEach(field => {
        if (editMode[field] && editableFieldRefs.current[field] && !editableFieldRefs.current[field].contains(event.target)) {
          handleSave(field);
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editMode, formData]);

  const handleEdit = (field) => {
    setEditMode(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (e, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSave = async (field) => {
    if (!formData[field] || formData[field] === userData[field]) {
      setEditMode(prev => ({ ...prev, [field]: false }));
      return;
    }

    try {
      setLoading(prev => ({ ...prev, [field]: true }));

      // Send data as JSON instead of FormData
      const response = await axios.put(
        `${GLOBAL_API_URL}/user/profile/update/${userData.id}`,
        { [field]: formData[field] },
        {
          headers: {
            Authorization: `Bearer ${userData.tokens.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Update localStorage with the complete updated user data from response
        const updatedUserData = {
          ...userData,
          ...response.data.data // Use the data from server response
        };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        setUserData(updatedUserData);
        toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(error.response?.data?.message || `Error updating ${field}`);
      // Revert changes
      setFormData(prev => ({
        ...prev,
        [field]: userData[field]
      }));
    } finally {
      setLoading(prev => ({ ...prev, [field]: false }));
      setEditMode(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      handleSave(field);
    } else if (e.key === 'Escape') {
      setFormData(prev => ({
        ...prev,
        [field]: userData[field]
      }));
      setEditMode(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      e.target.value = null;
      return;
    }

    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      toast.error('Only JPG, PNG and WEBP images are allowed');
      e.target.value = null;
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await axios.put(
        `${GLOBAL_API_URL}/user/profile/update/${userData.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${userData.tokens.accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success("Profile image updated successfully!");
        const updatedUserData = {
          ...userData,
          ...response.data.data
        };
        // Update user storage
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        setUserData(updatedUserData);
        setAvatarFile(null); // Clear pending upload state
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error(error.response?.data?.message || "Error uploading image");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const EditableField = ({ field, icon: Icon, label, value }) => (
    <div className="col-md-6">
      <div className="p-3 border rounded bg-light">
        <div className="d-flex align-items-center mb-2">
          <Icon className="text-primary me-2" />
          <h6 className="mb-0">{label}</h6>
        </div>
        <div className="d-flex align-items-center" ref={el => editableFieldRefs.current[field] = el}>
          {editMode[field] && field === 'name' ? (
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={formData[field]}
                onChange={(e) => handleChange(e, field)}
                onKeyDown={(e) => handleKeyDown(e, field)}
                disabled={loading[field]}
                autoFocus
              />
              {loading[field] && (
                <span className="input-group-text">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </span>
              )}
            </div>
          ) : (
            <>
              <p className="text-muted mb-0 me-2">{value || 'Not provided'}</p>
              {field === 'name' && (
                <button
                  className="btn btn-link btn-sm p-0"
                  onClick={() => handleEdit(field)}
                >
                  <IconPencil className="text-primary" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (!userData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Profile Information</h4>
                <span className={`badge ${userData.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                  {userData.status}
                </span>
              </div>
            </div>

            <div className="card-body">
              {/* AVATAR SECTION */}
              <div className="d-flex flex-column align-items-center mb-5 pb-4 border-bottom position-relative">
                  <div className="position-relative mb-3">
                      <div 
                         className="rounded-circle overflow-hidden shadow-sm border border-3 border-white d-flex justify-content-center align-items-center bg-light" 
                         style={{ width: "130px", height: "130px" }}
                      >
                          {avatarPreview ? (
                              <img src={avatarPreview} alt="Preview" className="w-100 h-100 object-fit-cover" />
                          ) : userData?.avatar ? (
                              <img src={`${GLOBAL_API_URL.replace('/api', '')}${userData.avatar}`} alt="Avatar" className="w-100 h-100 object-fit-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                              <IconPerson className="text-secondary" style={{ width: "60px", height: "60px" }} />
                          )}
                      </div>
                      
                      <button 
                         className="btn btn-primary rounded-circle position-absolute shadow-sm"
                         style={{ bottom: "0px", right: "0px", width: "40px", height: "40px", padding: 0 }}
                         onClick={() => fileInputRef.current?.click()}
                         title="Change Photo"
                         disabled={uploadingAvatar}
                      >
                          <IconPencil />
                      </button>
                      <input 
                         type="file" 
                         ref={fileInputRef} 
                         onChange={handleAvatarChange} 
                         className="d-none" 
                         accept="image/jpeg, image/png, image/webp, image/jpg" 
                      />
                  </div>
                  
                  {avatarFile && (
                      <div className="d-flex align-items-center gap-2 animate__animated animate__fadeIn">
                          <button 
                             className="btn btn-sm btn-success fw-bold rounded-pill px-3 shadow-sm d-flex align-items-center"
                             onClick={handleAvatarUpload}
                             disabled={uploadingAvatar}
                          >
                             {uploadingAvatar ? (
                                <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Uploading...</>
                             ) : (
                                "Save Photo"
                             )}
                          </button>
                          <button 
                             className="btn btn-sm btn-outline-secondary rounded-pill px-3 shadow-sm"
                             onClick={() => {
                                 setAvatarFile(null);
                                 setAvatarPreview(null);
                             }}
                             disabled={uploadingAvatar}
                          >
                             Cancel
                          </button>
                      </div>
                  )}
              </div>
              
              <div className="row g-4">
                {/* User ID - Not editable */}
                <div className="col-md-6">
                  <div className="p-3 border rounded bg-light">
                    <div className="d-flex align-items-center mb-2">
                      <IconFingerprint className="text-primary me-2" />
                      <h6 className="mb-0">User ID</h6>
                    </div>
                    <p className="text-muted mb-0 small">{userData.id}</p>
                  </div>
                </div>

                {/* Editable Fields */}
                <EditableField
                  field="name"
                  icon={IconPerson}
                  label="Full Name"
                  value={userData.name}
                />

                <EditableField
                  field="email"
                  icon={IconEnvelope}
                  label="Email Address"
                  value={userData.email}
                />

                <EditableField
                  field="mobile"
                  icon={IconPhone}
                  label="Mobile Number"
                  value={userData.mobile}
                />
              </div>
            </div>
          </div>

          {/* Addresses Card */}
          <div className="card shadow-lg mt-4 border-0">
            <div className="card-header bg-gradient-primary text-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <IconLocation className="me-2" size={24} />
                  <h4 className="mb-0">Delivery Addresses</h4>
                </div>
                <button
                  className="btn btn-light btn-sm d-flex align-items-center"
                  onClick={handleAddNewAddress}
                >
                  <IconPlus className="me-1" /> Add New Address
                </button>
              </div>
            </div>
            <div className="card-body p-4">
              {showAddressForm && (
                <div className="mb-4">
                  <div className="card border-primary">
                    <div className="card-header bg-primary bg-opacity-10">
                      <h5 className="mb-0 text-primary">
                        {editingAddressId ? 'Edit Address' : 'Add New Address'}
                      </h5>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleAddressSubmit} className="needs-validation">
                        <div className="row g-3">
                          <div className="col-12">
                            <div className="form-floating">
                              <input
                                type="text"
                                className={`form-control ${addressFormErrors.address_line ? 'is-invalid' : ''}`}
                                id="addressLine"
                                placeholder="Enter address line"
                                value={addressFormData.address_line}
                                onChange={(e) => {
                                  setAddressFormData(prev => ({
                                    ...prev,
                                    address_line: e.target.value.slice(0, 100)
                                  }));
                                  if (addressFormErrors.address_line) {
                                    setAddressFormErrors(prev => ({ ...prev, address_line: '' }));
                                  }
                                }}
                                maxLength="100"
                                minLength="5"
                                required
                              />
                              <label htmlFor="addressLine">Address Line (5-100 characters)</label>
                              <small className="text-muted d-block mt-1">{addressFormData.address_line.length}/100 characters</small>
                              {addressFormErrors.address_line && (
                                <div className="invalid-feedback d-block" style={{ color: '#dc3545' }}>
                                  {addressFormErrors.address_line}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-floating">
                              <input
                                type="text"
                                className={`form-control ${addressFormErrors.city ? 'is-invalid' : ''}`}
                                id="city"
                                placeholder="Enter city"
                                value={addressFormData.city}
                                onChange={(e) => {
                                  setAddressFormData(prev => ({
                                    ...prev,
                                    city: e.target.value.slice(0, 50)
                                  }));
                                  if (addressFormErrors.city) {
                                    setAddressFormErrors(prev => ({ ...prev, city: '' }));
                                  }
                                }}
                                maxLength="50"
                                minLength="2"
                                pattern="[a-zA-Z\s-]+"
                                required
                              />
                              <label htmlFor="city">City (2-50 characters)</label>
                              <small className="text-muted d-block mt-1">Letters, spaces, and hyphens only</small>
                              {addressFormErrors.city && (
                                <div className="invalid-feedback d-block" style={{ color: '#dc3545' }}>
                                  {addressFormErrors.city}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-floating">
                              <input
                                type="text"
                                className={`form-control ${addressFormErrors.state ? 'is-invalid' : ''}`}
                                id="state"
                                placeholder="Enter state"
                                value={addressFormData.state}
                                onChange={(e) => {
                                  setAddressFormData(prev => ({
                                    ...prev,
                                    state: e.target.value.slice(0, 50)
                                  }));
                                  if (addressFormErrors.state) {
                                    setAddressFormErrors(prev => ({ ...prev, state: '' }));
                                  }
                                }}
                                maxLength="50"
                                minLength="2"
                                pattern="[a-zA-Z\s-]+"
                                required
                              />
                              <label htmlFor="state">State (2-50 characters)</label>
                              <small className="text-muted d-block mt-1">Letters, spaces, and hyphens only</small>
                              {addressFormErrors.state && (
                                <div className="invalid-feedback d-block" style={{ color: '#dc3545' }}>
                                  {addressFormErrors.state}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-floating">
                              <input
                                type="text"
                                className={`form-control ${addressFormErrors.country ? 'is-invalid' : ''}`}
                                id="country"
                                placeholder="Enter country"
                                value={addressFormData.country}
                                onChange={(e) => {
                                  setAddressFormData(prev => ({
                                    ...prev,
                                    country: e.target.value.slice(0, 50)
                                  }));
                                  if (addressFormErrors.country) {
                                    setAddressFormErrors(prev => ({ ...prev, country: '' }));
                                  }
                                }}
                                maxLength="50"
                                minLength="2"
                                pattern="[a-zA-Z\s-]+"
                                required
                              />
                              <label htmlFor="country">Country (2-50 characters)</label>
                              <small className="text-muted d-block mt-1">Letters, spaces, and hyphens only</small>
                              {addressFormErrors.country && (
                                <div className="invalid-feedback d-block" style={{ color: '#dc3545' }}>
                                  {addressFormErrors.country}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-floating">
                              <input
                                type="tel"
                                className={`form-control ${addressFormErrors.mobile ? 'is-invalid' : ''}`}
                                id="mobile"
                                placeholder="Enter mobile number"
                                value={addressFormData.mobile}
                                onChange={(e) => {
                                  setAddressFormData(prev => ({
                                    ...prev,
                                    // Allow + and digits, limit to 16 length to fit + and 15 digits
                                    mobile: e.target.value.replace(/[^\d+]/g, '').slice(0, 16)
                                  }));
                                  if (addressFormErrors.mobile) {
                                    setAddressFormErrors(prev => ({ ...prev, mobile: '' }));
                                  }
                                }}
                                maxLength="16"
                                minLength="10"
                                pattern="^\+?[0-9]{10,15}$"
                                inputMode="tel"
                                required
                              />
                              <label htmlFor="mobile">Mobile Number (10-15 digits)</label>
                              <small className="text-muted d-block mt-1">Optional leading + followed by 10-15 digits</small>
                              {addressFormErrors.mobile && (
                                <div className="invalid-feedback d-block" style={{ color: '#dc3545' }}>
                                  {addressFormErrors.mobile}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="d-flex gap-2">
                              <button
                                type="submit"
                                className="btn btn-primary px-4"
                                disabled={loading}
                              >
                                {loading ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    {editingAddressId ? 'Updating...' : 'Adding...'}
                                  </>
                                ) : (
                                  <>
                                    {editingAddressId ? '💾 Update' : '➕ Add'} Address
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                  setShowAddressForm(false);
                                  setEditingAddressId(null);
                                  setAddressFormData({
                                    address_line: "",
                                    city: "",
                                    state: "",
                                    country: "",
                                    mobile: ""
                                  });
                                  setAddressFormErrors({});
                                }}
                                disabled={loading}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading addresses...</span>
                  </div>
                  <p className="text-muted mt-3 mb-0">Loading your addresses...</p>
                </div>
              ) : (
                <div className="row g-4">
                  {addresses.map((address) => (
                    <div key={address._id} className="col-md-6">
                      <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-2">
                                <IconLocation className="text-primary" />
                              </div>
                              <h6 className="mb-0">Delivery Address</h6>
                              {address.isDefault && (
                                <span className="badge bg-success ms-2">Default</span>
                              )}
                            </div>
                            <div className="btn-group">
                              {!address.isDefault && (
                                <button
                                  className="btn btn-outline-success btn-sm"
                                  onClick={() => handleSetDefault(address._id)}
                                  disabled={loading}
                                  title="Set as Default"
                                >
                                  Default
                                </button>
                              )}
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleEditAddress(address)}
                                disabled={loading}
                                title="Edit Address"
                              >
                                <IconPencil />
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteAddress(address._id)}
                                disabled={loading || addresses.length <= 1}
                                title="Delete Address"
                              >
                                <IconTrash />
                              </button>
                            </div>
                          </div>
                          <div className="address-details">
                            <p className="mb-2 fs-6">{address.address_line}</p>
                            <p className="mb-2 text-muted">
                              {address.city}, {address.state}<br />
                              {address.country}
                            </p>
                            <div className="d-flex align-items-center text-primary">
                              <IconPhone className="me-2" />
                              <span>{address.mobile}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {addresses.length === 0 && !showAddressForm && (
                    <div className="col-12">
                      <div className="text-center py-5">
                        <div className="mb-3">
                          <IconLocation size={48} className="text-muted" />
                        </div>
                        <h5 className="text-muted mb-3">No addresses found</h5>
                        <button
                          className="btn btn-primary"
                          onClick={handleAddNewAddress}
                        >
                          <IconPlus className="me-1" /> Add Your First Address
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfileView;
