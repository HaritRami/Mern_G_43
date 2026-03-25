import React from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
    { to: "/admin", icon: "bi-grid", label: "Dashboard" },
    { to: "/admin/products", icon: "bi-box-seam", label: "Products" },
    { to: "/admin/categories", icon: "bi-list-check", label: "Categories" },
    // { to: "/admin/subcategories", icon: "bi-tags", label: "Sub-Categories" },
    { to: "/admin/users", icon: "bi-people", label: "Users" },
    { to: "/admin/sellers", icon: "bi-shop", label: "Sellers" },
    { to: "/admin/orders", icon: "bi-basket", label: "Orders" },
    { to: "/admin/coupons", icon: "bi-ticket-perforated", label: "Coupons" },
    //{ to: "/admin/settings", icon: "bi-gear", label: "Settings" },
];

const AdminV2Sidebar = () => {
    const location = useLocation();

    const isActive = (path) => {
        if (path === "/admin") {
            return location.pathname === "/admin" || location.pathname === "/admin/";
        }
        return location.pathname.startsWith(path);
    };

    return (
        <aside id="admin-sidebar" className="sidebar">
            <ul className="sidebar-nav" id="sidebar-nav">
                {navItems.map((item) => (
                    <li className="nav-item" key={item.to}>
                        <Link
                            className={`nav-link ${!isActive(item.to) ? "collapsed" : ""}`}
                            to={item.to}
                        >
                            <i className={`bi ${item.icon}`} />
                            <span>{item.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default AdminV2Sidebar;
