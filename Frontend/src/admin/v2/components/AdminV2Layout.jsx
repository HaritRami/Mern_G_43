import React from "react";
import AdminV2Header from "./AdminV2Header";
import AdminV2Sidebar from "./AdminV2Sidebar";
import AdminV2Footer from "./AdminV2Footer";
import "../admin-v2.css";

const AdminV2Layout = ({ children }) => (
    <div className="admin-v2-layout">
        <AdminV2Header />
        <AdminV2Sidebar />
        <div className="admin-v2-content-wrapper">
            <main id="main" className="main">
                <div className="container-fluid">{children}</div>
            </main>
            <AdminV2Footer />
        </div>
    </div>
);

export default AdminV2Layout;
