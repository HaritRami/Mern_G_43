import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../config/apiConfig";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      const authConfig = {
        headers: { Authorization: `Bearer ${savedUser?.tokens?.accessToken}` }
      };
      
      const response = await axios.get(`${API_URL}/coupon/admin/list`, authConfig);
      if (response.data.success) {
        setCoupons(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="card shadow mb-4">
        <div className="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 className="m-0 font-weight-bold text-primary">Generated Coupons</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount %</th>
                  <th>Min. Purchase</th>
                  <th>Issued Date</th>
                  <th>Expiry Date</th>
                  <th>Usage Limit</th>
                  <th>Used Count</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No coupons generated yet.
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <td className="font-weight-bold text-danger">{coupon.code}</td>
                      <td>{coupon.discountPercent}%</td>
                      <td>${coupon.minPurchaseAmount}</td>
                      <td>{new Date(coupon.createdAt).toLocaleDateString()}</td>
                      <td>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                      <td>{coupon.usageLimit}</td>
                      <td>{coupon.usedCount}</td>
                      <td>
                        {coupon.isActive && new Date(coupon.expiryDate) >= new Date() ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-secondary">Inactive / Expired</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coupons;
