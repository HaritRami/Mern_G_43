import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../../context/UserContext";

const AdminV2Header = () => {
    const { logout } = useUser();
    const toggleSidebarBtnRef = useRef(null);

    const handleLogout = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}user/logout`, {
                method: "POST",
                credentials: "include",
            });

            if (response.ok) {
                logout();
                window.location.href = "/";
            }
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    useEffect(() => {
        const button = toggleSidebarBtnRef.current;
        if (!button) return;

        const handleClick = () => {
            document.body.classList.toggle("toggle-sidebar");
        };

        button.addEventListener("click", handleClick);
        return () => button.removeEventListener("click", handleClick);
    }, []);

    const savedUser = JSON.parse(localStorage.getItem("user"));

    return (
        <header className="header fixed-top d-flex align-items-center bg-dark">
            <div className="d-flex align-items-center justify-content-between w-100 px-3">
                <div className="d-flex align-items-center">
                    <button
                        ref={toggleSidebarBtnRef}
                        className="btn btn-link text-white d-lg-none me-2"
                        type="button"
                        aria-label="Toggle sidebar"
                    >
                        <i className="bi bi-list" />
                    </button>
                    <Link to="/admin" className="logo d-flex align-items-center text-decoration-none">
                        <img src="assets/img/logo.png" alt="logo" style={{ height: 32 }} />
                        <span className="d-none d-lg-block ms-2 text-white">Nexa Admin</span>
                    </Link>
                </div>

                <nav className="header-nav ms-auto">
                    <ul className="d-flex align-items-center mb-0">
                        <li className="nav-item dropdown pe-3">
                            <a className="nav-link nav-profile d-flex align-items-center" href="#" data-bs-toggle="dropdown">
                                <img
                                    src={
                                        savedUser?.avatar
                                            ? `http://localhost:5000${savedUser.avatar}`
                                            : "assets/img/profile-img.jpg"
                                    }
                                    alt="Profile"
                                    className="rounded-circle"
                                    style={{ width: "36px", height: "36px", objectFit: "cover" }}
                                />
                                <span className="d-none d-md-block dropdown-toggle ps-2 text-white">
                                    {savedUser?.name || "Admin"}
                                </span>
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
                                <li className="dropdown-header text-center">
                                    <div className="d-flex flex-column align-items-center">
                                        <img
                                            src={
                                                savedUser?.avatar
                                                    ? `http://localhost:5000${savedUser.avatar}`
                                                    : "assets/img/profile-img.jpg"
                                            }
                                            alt="Profile"
                                            className="rounded-circle mb-2"
                                            style={{ width: "64px", height: "64px", objectFit: "cover" }}
                                        />
                                        <h6 className="mb-0">{savedUser?.name || "Admin"}</h6>
                                        <div className="mt-2 d-flex align-items-center">
                                            <span className="me-2">{savedUser?.role || "Admin"}</span>
                                            {savedUser?.status === "Active" ? (
                                                <i className="bi bi-check-circle-fill text-success" />
                                            ) : (
                                                <i className="bi bi-x-circle-fill text-danger" />
                                            )}
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>
                                <li>
                                    <Link className="dropdown-item d-flex align-items-center" to="/admin/profile">
                                        <i className="bi bi-person" />
                                        <span>My Profile</span>
                                    </Link>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>
                                <li>
                                    <button className="dropdown-item d-flex align-items-center btn btn-link" onClick={handleLogout}>
                                        <i className="bi bi-box-arrow-right" />
                                        <span>Sign Out</span>
                                    </button>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default AdminV2Header;
