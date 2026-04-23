import { API_URL as GLOBAL_API_URL } from '../../config/apiConfig';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import PageTitle from "../components/PageTitle";
import Cookies from "js-cookie";

axios.defaults.withCredentials = true;

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [sellers, setSellers] = useState([]);
    const [selectedSeller, setSelectedSeller] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);

    const API_URL = `${GLOBAL_API_URL}`;

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const savedUser = JSON.parse(localStorage.getItem("user"));
            const token = savedUser?.tokens?.accessToken;
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const isUserAdmin = savedUser?.role === "Admin";
            setIsAdmin(isUserAdmin);

            const orderEndpoint = isUserAdmin ? `${API_URL}/order` : `${API_URL}/order/seller`;
            const response = await axios.get(orderEndpoint, config);
            setOrders(response.data || []);

            if (isUserAdmin) {
                const usersResponse = await axios.get(`${API_URL}/user?limit=1000`, config);
                if (usersResponse.data && usersResponse.data.data) {
                    const sellerList = usersResponse.data.data.filter(u => u.role === "Seller");
                    setSellers(sellerList);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error fetching orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filtered = orders.filter((order) => {
        let matchesSeller = true;
        if (isAdmin && selectedSeller) {
            const orderSellerId = order.productId?.userId?._id || order.productId?.userId;
            matchesSeller = orderSellerId === selectedSeller;
        }

        if (!matchesSeller) return false;

        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            order.orderId?.toLowerCase().includes(term) ||
            order.paymentStatus?.toLowerCase().includes(term) ||
            order.userId?.[0]?.name?.toLowerCase()?.includes(term) ||
            order.productId?.name?.toLowerCase()?.includes(term)
        );
    });

    return (
        <main id="main" className="main">
            <PageTitle title="Order Management" />
            <div className="card">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title">Orders</h5>
                        <div className="d-flex gap-2 w-auto">
                            {isAdmin && (
                                <select
                                    className="form-select"
                                    value={selectedSeller}
                                    onChange={(e) => setSelectedSeller(e.target.value)}
                                >
                                    <option value="">All Sellers</option>
                                    {sellers.map(s => (
                                        <option key={s._id} value={s._id}>{s.name}</option>
                                    ))}
                                </select>
                            )}
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search orders..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        {isAdmin && <th>Seller</th>}
                                        <th>Status</th>
                                        <th>Total</th>
                                        <th>Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length ? (
                                        filtered.map((order) => (
                                            <tr key={order._id}>
                                                <td>{order.orderId}</td>
                                                <td>{order.userId?.[0]?.name || "-"}</td>
                                                {isAdmin && (
                                                    <td>
                                                        {(() => {
                                                            const sId = order.productId?.userId?._id || order.productId?.userId;
                                                            const found = sellers.find(s => s._id === sId || s.id === sId);
                                                            return found ? found.name : "-";
                                                        })()}
                                                    </td>
                                                )}
                                                <td>{order.paymentStatus || "-"}</td>
                                                <td>{order.totalAmt != null ? `₹{order.totalAmt.toLocaleString('en-IN')}` : "-"}</td>
                                                <td>{new Date(order.createdAt).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={isAdmin ? 6 : 5} className="text-center py-4">
                                                No orders found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default OrderManagement;
