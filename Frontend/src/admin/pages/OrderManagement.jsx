import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import PageTitle from "../components/PageTitle";

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const API_URL = "http://localhost:5000/api";

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/order`);
            setOrders(response.data || []);
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
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            order.orderId?.toLowerCase().includes(term) ||
            order.paymentStatus?.toLowerCase().includes(term) ||
            order.userId?.[0]?.name?.toLowerCase()?.includes(term)
        );
    });

    return (
        <main id="main" className="main">
            <PageTitle title="Order Management" />
            <div className="card">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title">Orders</h5>
                        <div className="input-group w-auto">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
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
                                        <th>User</th>
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
                                                <td>{order.paymentStatus || "-"}</td>
                                                <td>{order.totalAmt != null ? `$${order.totalAmt.toFixed(2)}` : "-"}</td>
                                                <td>{new Date(order.createdAt).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4">
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
