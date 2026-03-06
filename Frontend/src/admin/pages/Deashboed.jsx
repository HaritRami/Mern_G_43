import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import PageTitle from "../components/PageTitle";

const Dashboard = () => {
    const [userCount, setUserCount] = useState(0);
    const [productCount, setProductCount] = useState(0);
    const [categoryCount, setCategoryCount] = useState(0);
    const [recentProducts, setRecentProducts] = useState([]);
    const [recentCategories, setRecentCategories] = useState([]);
    const [loading, setLoading] = useState({
        users: true,
        products: true,
        categories: true
    });
    const API_URL = "http://localhost:5000/api";

    useEffect(() => {
        fetchUserCount();
        fetchProductCount();
        fetchCategoryCount();
        fetchRecentProducts();
        fetchRecentCategories();
    }, []);

    const fetchUserCount = async () => {
        try {
            const savedUser = JSON.parse(localStorage.getItem("user"));
            const response = await axios.get(`${API_URL}/user/user-count`, {
                headers: {
                    Authorization: `Bearer ${savedUser.tokens.accessToken}`
                }
            });

            if (response.data && response.data.success) {
                setUserCount(response.data.data.count);
            }
        } catch (error) {
            console.error('Error fetching user count:', error);
            toast.error('Error fetching user count');
        } finally {
            setLoading(prev => ({ ...prev, users: false }));
        }
    };

    const fetchProductCount = async () => {
        try {
            const savedUser = JSON.parse(localStorage.getItem("user"));
            const response = await axios.get(`${API_URL}/product`, {
                headers: {
                    Authorization: `Bearer ${savedUser.tokens.accessToken}`
                }
            });

            if (response.data && response.data.success) {
                setProductCount(response.data.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching product count:', error);
            toast.error('Error fetching product count');
        } finally {
            setLoading(prev => ({ ...prev, products: false }));
        }
    };

    const fetchCategoryCount = async () => {
        try {
            const savedUser = JSON.parse(localStorage.getItem("user"));
            const response = await axios.get(`${API_URL}/category`, {
                headers: {
                    Authorization: `Bearer ${savedUser.tokens.accessToken}`
                }
            });

            if (response.data && response.data.success) {
                setCategoryCount(response.data.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching category count:', error);
            toast.error('Error fetching category count');
        } finally {
            setLoading(prev => ({ ...prev, categories: false }));
        }
    };

    const fetchRecentProducts = async () => {
      debugger;
        try {
            const savedUser = JSON.parse(localStorage.getItem("user"));
            const response = await axios.get(`${API_URL}/product?page=1&limit=5`, {
                headers: {
                    Authorization: `Bearer ${savedUser.tokens.accessToken}`
                }
            });

            if (response.data && response.data.success) {
                setRecentProducts(response.data.data);
                console.log(recentProducts);
                
            }
        } catch (error) {
            console.error('Error fetching recent products:', error);
            toast.error('Error fetching recent products');
        }
    };

    const fetchRecentCategories = async () => {
        try {
            const savedUser = JSON.parse(localStorage.getItem("user"));
            const response = await axios.get(`${API_URL}/category?page=1&limit=5`, {
                headers: {
                    Authorization: `Bearer ${savedUser.tokens.accessToken}`
                }
            });

            if (response.data && response.data.success) {
                setRecentCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching recent categories:', error);
            toast.error('Error fetching recent categories');
        }
    };

    return (
        <>
            <main id="main" className="main">
                <PageTitle title="Dashboard" />
                <section className="section dashboard">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="row">
                                {/* Products Card */}
                                <div className="col-xxl-4 col-md-4">
                                    <div className="card info-card">
                                        <div className="card-body">
                                            <h5 className="card-title">Products <span>| Total</span></h5>
                                            <div className="d-flex align-items-center">
                                                <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-primary">
                                                    <i className="bi bi-cart text-white" />
                                                </div>
                                                <div className="ps-3">
                                                    {loading.products ? (
                                                        <div className="spinner-border spinner-border-sm" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    ) : (
                                                        <h6>{productCount}</h6>
                                                    )}
                                                    <span className="text-muted small pt-2">Total Products</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Categories Card */}
                                <div className="col-xxl-4 col-md-4">
                                    <div className="card info-card">
                                        <div className="card-body">
                                            <h5 className="card-title">Categories <span>| Total</span></h5>
                                            <div className="d-flex align-items-center">
                                                <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-success">
                                                    <i className="bi bi-grid text-white" />
                                                </div>
                                                <div className="ps-3">
                                                    {loading.categories ? (
                                                        <div className="spinner-border spinner-border-sm" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    ) : (
                                                        <h6>{categoryCount}</h6>
                                                    )}
                                                    <span className="text-muted small pt-2">Total Categories</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Users Card */}
                                <div className="col-xxl-4 col-md-4">
                                    <div className="card info-card">
                                        <div className="card-body">
                                            <h5 className="card-title">Users <span>| Total</span></h5>
                                            <div className="d-flex align-items-center">
                                                <div className="card-icon rounded-circle d-flex align-items-center justify-content-center bg-info">
                                                    <i className="bi bi-people text-white" />
                                                </div>
                                                <div className="ps-3">
                                                    {loading.users ? (
                                                        <div className="spinner-border spinner-border-sm" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    ) : (
                                                        <h6>{userCount}</h6>
                                                    )}
                                                    <span className="text-muted small pt-2">Registered Users</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Products Table */}
                                <div className="col-12">
                                    <div className="card recent-sales overflow-auto">
                                        <div className="card-body">
                                            <h5 className="card-title">Recent Products</h5>
                                            <table className="table table-borderless">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">Image</th>
                                                        <th scope="col">Name</th>
                                                        <th scope="col">Category</th>
                                                        <th scope="col">Price</th>
                                                        <th scope="col">Stock</th>
                                                        <th scope="col">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recentProducts.map((product) => (
                                                        <tr key={product._id}>
                                                            <td>
                                                                <img 
                                                                    src={product.images[0] || 'https://via.placeholder.com/50'} 
                                                                    alt={product.name}
                                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                                />
                                                            </td>
                                                            <td>{product.name}</td>
                                                            <td>{product.category[0].name || 'N/A'}</td>
                                                            <td>${product.price}</td>
                                                            <td>{product.stock}</td>
                                                            <td>
                                                                <span className={`badge bg-${product.Public ? 'success' : 'warning'}`}>
                                                                    {product.Public ? 'Active' : 'Draft'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Categories Table */}
                                <div className="col-12">
                                    <div className="card recent-sales overflow-auto">
                                        <div className="card-body">
                                            <h5 className="card-title">Recent Categories</h5>
                                            <table className="table table-borderless">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">Image</th>
                                                        <th scope="col">Name</th>
                                                        <th scope="col">Description</th>
                                                        <th scope="col">Created At</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recentCategories.map((category) => (
                                                        <tr key={category._id}>
                                                            <td>
                                                                <img 
                                                                    src={category.image ? `http://localhost:5000${category.image}` : 'https://via.placeholder.com/50'} 
                                                                    alt={category.name}
                                                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = 'https://via.placeholder.com/50';
                                                                    }}
                                                                />
                                                            </td>
                                                            <td>{category.name}</td>
                                                            <td>{category.description || 'N/A'}</td>
                                                            <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
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

export default Dashboard;