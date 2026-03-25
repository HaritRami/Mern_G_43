import CouponModel from "../models/coupon.model.js";

// @desc    Validate a coupon code
// @route   POST /api/coupon/validate
// @access  Private
export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "Please enter a coupon code" });
    }

    const coupon = await CouponModel.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid coupon code" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: "Coupon is no longer active" });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: "Coupon expired" });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: "This coupon has already been used" });
    }

    if (cartTotal && cartTotal < coupon.minPurchaseAmount) {
      return res.status(400).json({ success: false, message: "Minimum purchase $" + coupon.minPurchaseAmount + " required" });
    }

    // Calculate discount amount based strictly on percentage
    const discountAmount = (cartTotal * coupon.discountPercent) / 100;

    res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmount: discountAmount,
      },
      message: "Coupon applied successfully"
    });

  } catch (error) {
    console.error("Error validating coupon:", error);
    res.status(500).json({ success: false, message: "Error validating coupon. Please try again later." });
  }
};

// @desc    Get all coupons for admin
// @route   GET /api/coupon/admin/list
// @access  Private (Admin)
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await CouponModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ success: false, message: "Failed to fetch coupons" });
  }
};
