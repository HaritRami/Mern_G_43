import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000/api/").replace(/\/+$/, "");

const statCards = [
    { key: "users", label: "Total Users", icon: "bi-people-fill", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { key: "products", label: "Products", icon: "bi-box-seam-fill", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { key: "categories", label: "Categories", icon: "bi-tags-fill", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { key: "orders", label: "Orders", icon: "bi-cart-check-fill", gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
];

const Dashboard = () => {
    const [stats, setStats] = useState({ users: 0, products: 0, categories: 0, orders: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const savedUser = JSON.parse(localStorage.getItem("user"));
                const headers = { Authorization: `Bearer ${savedUser?.tokens?.accessToken}` };
                const config = { headers, withCredentials: true };

                const [usersRes, productsRes, categoriesRes, ordersRes] = await Promise.allSettled([
                    axios.get(`${API_URL}/user/user-count`, config),
                    axios.get(`${API_URL}/product`, config),
                    axios.get(`${API_URL}/category`, config),
                    axios.get(`${API_URL}/order`, config),
                ]);

                setStats({
                    users: usersRes.status === "fulfilled" ? (usersRes.value.data?.data?.count || 0) : 0,
                    products: productsRes.status === "fulfilled" ? (productsRes.value.data?.pagination?.total || productsRes.value.data?.data?.length || 0) : 0,
                    categories: categoriesRes.status === "fulfilled" ? (categoriesRes.value.data?.pagination?.total || categoriesRes.value.data?.data?.length || 0) : 0,
                    orders: ordersRes.status === "fulfilled" ? (Array.isArray(ordersRes.value.data) ? ordersRes.value.data.length : (ordersRes.value.data?.data?.length || 0)) : 0,
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
        </>
    );
};

export default Dashboard;
