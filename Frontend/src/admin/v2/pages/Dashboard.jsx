import { API_URL as GLOBAL_API_URL, DOMAIN_URL as GLOBAL_DOMAIN_URL } from '../../../config/apiConfig';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = (process.env.REACT_APP_API_URL || `${GLOBAL_API_URL}/`).replace(/\/+$/, "");

const statCards = [
    { key: "users", label: "Total Users", icon: "bi-people-fill", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { key: "products", label: "Products", icon: "bi-box-seam-fill", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { key: "categories", label: "Categories", icon: "bi-tags-fill", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { key: "orders", label: "Orders", icon: "bi-cart-check-fill", gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
];

const Dashboard = () => {
    const [stats, setStats] = useState({ users: 0, products: 0, categories: 0, orders: 0 });
    const [recentData, setRecentData] = useState({ products: [], sellers: [], orders: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const savedUser = JSON.parse(localStorage.getItem("user"));
                const headers = { Authorization: `Bearer ${savedUser?.tokens?.accessToken}` };
                const config = { headers, withCredentials: true };

                const [usersRes, productsRes, categoriesRes, ordersRes, allUsersRes] = await Promise.allSettled([
                    axios.get(`${API_URL}/user/user-count`, config),
                    axios.get(`${API_URL}/product`, config),
                    axios.get(`${API_URL}/category`, config),
                    axios.get(`${API_URL}/order`, config),
                    axios.get(`${API_URL}/user?limit=100&sortField=createdAt&sortOrder=desc`, config)
                ]);

                setStats({
                    users: usersRes.status === "fulfilled" ? (usersRes.value.data?.data?.count || 0) : 0,
                    products: productsRes.status === "fulfilled" ? (productsRes.value.data?.pagination?.total || productsRes.value.data?.data?.length || 0) : 0,
                    categories: categoriesRes.status === "fulfilled" ? (categoriesRes.value.data?.pagination?.total || categoriesRes.value.data?.data?.length || 0) : 0,
                    orders: ordersRes.status === "fulfilled" ? (Array.isArray(ordersRes.value.data) ? ordersRes.value.data.length : (ordersRes.value.data?.data?.length || 0)) : 0,
                });

                const fetchedProducts = productsRes.status === "fulfilled" ? (productsRes.value.data?.data || []) : [];
                const sortedProducts = [...fetchedProducts].reverse();

                const fetchedOrders = ordersRes.status === "fulfilled" ? (Array.isArray(ordersRes.value.data) ? ordersRes.value.data : (ordersRes.value.data?.data || [])) : [];
                const sortedOrders = [...fetchedOrders].reverse();

                const fetchedUsers = allUsersRes.status === "fulfilled" ? (allUsersRes.value.data?.data || []) : [];

                setRecentData({
                    products: sortedProducts.slice(0, 5),
                    sellers: fetchedUsers.filter(u => u.role === "Seller").slice(0, 5),
                    orders: sortedOrders.slice(0, 5)
                });
            } catch (error) {
                console.error("Dashboard stats error:", error);
                toast.error("Unable to load some dashboard stats.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <>
            <div className="pagetitle">
                <h1>Dashboard</h1>
                <nav>
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item active">Home</li>
                    </ol>
                </nav>
            </div>

            <div className="row g-4">
                {statCards.map((card) => (
                    <div className="col-xxl-3 col-xl-3 col-lg-6 col-md-6 col-sm-6" key={card.key}>
                        <div
                            className="card border-0 shadow-sm"
                            style={{
                                borderRadius: "16px",
                                overflow: "hidden",
                                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                cursor: "default",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-4px)";
                                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.12)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                            }}
                        >
                            <div
                                style={{
                                    background: card.gradient,
                                    padding: "24px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <div>
                                    <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", marginBottom: "4px", fontWeight: 500 }}>
                                        {card.label}
                                    </p>
                                    <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "32px", margin: 0 }}>
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm text-light" />
                                        ) : (
                                            stats[card.key]
                                        )}
                                    </h2>
                                </div>
                                <div
                                    style={{
                                        width: "56px",
                                        height: "56px",
                                        borderRadius: "50%",
                                        background: "rgba(255,255,255,0.2)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <i className={`bi ${card.icon}`} style={{ fontSize: "28px", color: "#fff" }} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Sections */}
            <div className="row mt-4 g-4 mb-5">
                {/* Recent Orders */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: "16px", height: "100%" }}>
                        <div className="card-header bg-white border-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold" style={{ color: "#2d3748" }}>Recent Orders</h5>
                            <i className="bi bi-cart shadow-sm p-2 rounded text-primary bg-primary bg-opacity-10"></i>
                        </div>
                        <div className="card-body px-4">
                            {recentData.orders.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {recentData.orders.map(order => (
                                        <li key={order._id} className="list-group-item px-0 py-3 border-light d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-1 fw-semibold text-truncate" style={{ maxWidth: "150px" }}>{order.orderId}</h6>
                                                <small className="text-muted">{new Date(order.createdAt).toLocaleDateString()}</small>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold text-dark">₹{order.totalAmt?.toLocaleString('en-IN') || "0"}</div>
                                                <span className={`badge rounded-pill ${order.paymentStatus === 'PAID' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`} style={{ fontSize: "0.7rem", fontWeight: 600 }}>
                                                    {order.paymentStatus || "PENDING"}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted mt-3">No recent orders found.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Products */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: "16px", height: "100%" }}>
                        <div className="card-header bg-white border-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold" style={{ color: "#2d3748" }}>New Products</h5>
                            <i className="bi bi-box shadow-sm p-2 rounded text-danger bg-danger bg-opacity-10"></i>
                        </div>
                        <div className="card-body px-4">
                            {recentData.products.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {recentData.products.map(product => (
                                        <li key={product._id} className="list-group-item px-0 py-3 border-light d-flex align-items-center gap-3">
                                            <img
                                                src={product.images?.[0] ? `${GLOBAL_DOMAIN_URL}${product.images[0]}` : "https://via.placeholder.com/48"}
                                                alt={product.name}
                                                style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "10px" }}
                                                className="shadow-sm border"
                                            />
                                            <div className="flex-grow-1 overflow-hidden">
                                                <h6 className="mb-1 fw-semibold text-truncate">{product.name}</h6>
                                                <small className="text-muted d-block text-truncate text-capitalize">{product.category?.name || "Product"}</small>
                                            </div>
                                            <div className="fw-bold text-dark">₹{product.price?.toLocaleString('en-IN')}</div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted mt-3">No recent products found.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Sellers */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: "16px", height: "100%" }}>
                        <div className="card-header bg-white border-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold" style={{ color: "#2d3748" }}>Latest Sellers</h5>
                            <i className="bi bi-person shadow-sm p-2 rounded text-info bg-info bg-opacity-10"></i>
                        </div>
                        <div className="card-body px-4">
                            {recentData.sellers.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {recentData.sellers.map(seller => (
                                        <li key={seller._id} className="list-group-item px-0 py-3 border-light d-flex align-items-center gap-3">
                                            <div className="d-flex justify-content-center align-items-center bg-light text-primary fw-bold rounded-circle shadow-sm border border-white" style={{ width: "46px", height: "46px", fontSize: "1.2rem", padding: "0" }}>
                                                {seller.name?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <div className="flex-grow-1 overflow-hidden">
                                                <h6 className="mb-1 fw-semibold text-truncate">{seller.name}</h6>
                                                <small className="text-muted d-block text-truncate">{seller.email}</small>
                                            </div>
                                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill fw-semibold" style={{ fontSize: "0.75rem" }}>
                                                Active
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted mt-3">No recent sellers found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
