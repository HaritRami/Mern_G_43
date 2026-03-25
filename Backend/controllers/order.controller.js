import Order from "../models/order.model.js";
import AddressModel from "../models/address.model.js";
import ProductModel from "../models/product.model.js";
import CartProductModel from "../models/cartProduct.model.js";
import { generateInvoicePDF } from "../utils/invoiceGenerator.js";
import sendemail from "../email_handler/sendEmail.js";
import { orderConfirmationTemplate } from "../email_handler/orderEmailTemplate.js";
import { couponEmailTemplate } from "../email_handler/couponEmailTemplate.js";
import CouponModel from "../models/coupon.model.js";
import fs from 'fs';
import path from 'path';
export const createOrder = async (req, res) => {
  try {
    console.log('createOrder body', req.body);
    // allow optional fields; grab them if provided
    const {
      orderId,
      productId,
      productDetail,
      paymentId,
      paymentStatus,
      deliveryAddress,
      subTotalAmt,
      totalAmt,
      invoiceReceipt,
      trackingDate
    } = req.body;

    // ensure unique orderId if not provided
    const orderIdToUse = orderId || `order_${Date.now()}_${Math.floor(Math.random()*1000)}`;

    // SECURITY OVERRIDE: Ignore req.body.userId completely.
    // Ensure the order is STRICTLY bound to the authenticated user's token identity.
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized. Valid token required to place an order." });
    }
    const authUserId = req.user._id;
    const userIds = [authUserId]; // strictly force to the token owner

    let addressId = deliveryAddress;
    if (deliveryAddress && typeof deliveryAddress === 'object' && !deliveryAddress._id) {
      const addressDoc = new AddressModel({
        user: authUserId, // force token identity
        address_line: deliveryAddress.address_line || "",
        city: deliveryAddress.city || "",
        state: deliveryAddress.state || "",
        country: deliveryAddress.country || "",
        mobile: req.user.mobile || deliveryAddress.mobile || null, // lock actual mobile over explicit deliveryAddress object
        is_delete: false
      });
      const savedAddr = await addressDoc.save();
      addressId = savedAddr._id;
    }

    const newOrder = new Order({
      userId: userIds,
      orderId: orderIdToUse,
      productId: productId || null,
      productDetail: productDetail || {},
      paymentId: paymentId || "",
      paymentStatus: paymentStatus || "",
      deliveryAddress: addressId,
      subTotalAmt: subTotalAmt || 0,
      totalAmt: totalAmt || 0,
      invoiceReceipt: invoiceReceipt || 0,
      trackingDate: trackingDate || new Date(Date.now() + 3*24*60*60*1000)
    });

    console.log('newOrder object before save', newOrder);
    await newOrder.save();
    res.status(201).json({ message: "Order created successfully", newOrder });
  } catch (error) {
    console.error('Error creating order', error);
    if (error.errors) console.error('Validation errors', error.errors);
    console.error('Create order payload', req.body);
    res.status(500).json({ message: "Error creating order", error: error.message, details: error.errors || null });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId productId deliveryAddress');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    const sellerId = req.user._id;
    // Find products owned by this seller
    const products = await ProductModel.find({ userId: sellerId }).select('_id');
    const productIds = products.map(p => p._id);
    
    // Find orders containing these products
    const orders = await Order.find({ productId: { $in: productIds } })
      .populate('userId productId deliveryAddress')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching seller orders", error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized", data: null, error: "Unauthorized" });
    }
    const orders = await Order.find({ userId: req.user._id })
      .populate('productId deliveryAddress')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, message: "Orders retrieved", data: orders, error: null });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Error fetching orders", data: null, error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('userId productId deliveryAddress');
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, productId, productDetail, paymentId, paymentStatus, deliveryAddress, subTotalAmt, totalAmt, invoiceReceipt } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { userId, productId, productDetail, paymentId, paymentStatus, deliveryAddress, subTotalAmt, totalAmt, invoiceReceipt },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order updated successfully", updatedOrder });
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error: error.message });
  }
};

export const createCheckoutSession = async (req, res) => {
  try {
    const {
      cartItems,
      paymentId,
      paymentStatus,
      deliveryAddress,
      subTotalAmt,
      totalAmt,
      discount,
      couponCode,
      email,
      mobile
    } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty", data: null, error: "Validation Error" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized. Valid token required to place an order.", data: null, error: "Unauthorized" });
    }
    const authUserId = req.user._id;

    // Validate Stock Before Creating Any Orders
    for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        const dbProduct = await ProductModel.findById(item.productId._id || item.productId);
        if (!dbProduct) {
            return res.status(400).json({ success: false, message: `Product ${item.productId?.name || 'Unknown'} not found.`, data: null, error: "Not Found" });
        }
        if (dbProduct.stock < item.quantity) {
            return res.status(400).json({ success: false, message: `Insufficient stock for ${item.productId?.name || 'Unknown'}. Available: ${dbProduct.stock}`, data: null, error: "Stock Error" });
        }
    }

    // Address handling
    let addressObj = deliveryAddress;
    if (deliveryAddress && !deliveryAddress._id) {
      const addressDoc = new AddressModel({
        user: authUserId,
        address_line: deliveryAddress.address_line || "",
        city: deliveryAddress.city || "",
        state: deliveryAddress.state || "",
        country: deliveryAddress.country || "",
        mobile: mobile || deliveryAddress.mobile || "",
        is_delete: false
      });
      const savedAddr = await addressDoc.save();
      addressObj = { ...deliveryAddress, _id: savedAddr._id };
    }

    const masterOrderId = `ORD-${Date.now()}`;
    const newOrders = [];

    // Create individual orders
    for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        const itemTotal = item.productId.price * item.quantity;
        const itemDiscount = item.productId.discount ? (itemTotal * item.productId.discount) / 100 : 0;
        const itemOrderId = `${masterOrderId}-${i+1}`;

        const newOrder = new Order({
            userId: [authUserId],
            orderId: itemOrderId,
            productId: item.productId._id,
            productDetail: { name: item.productId.name, images: item.productId.images },
            paymentId: paymentId || "",
            paymentStatus: paymentStatus || "",
            deliveryAddress: addressObj._id || addressObj,
            subTotalAmt: itemTotal,
            totalAmt: itemTotal - itemDiscount,
            couponCode: couponCode || "",
            couponDiscount: couponCode ? (itemTotal * (discount / totalAmt)) : 0 // Rough apportionment
        });
        await newOrder.save();
        newOrders.push(newOrder);
    }

    // Clear cart in DB
    await CartProductModel.deleteMany({ userId: authUserId });

    // Generate Invoice
    const orderDataForInvoice = {
        items: cartItems,
        subTotalAmt: subTotalAmt || 0,
        discount: discount || 0,
        totalAmt: totalAmt || 0,
        paymentStatus: paymentStatus || "",
        email: email || req.user.email,
        couponCode: couponCode || ""
    };

    const userObj = { name: req.user.name || 'Customer' };
    const { buffer: pdfBuffer, fileName } = await generateInvoicePDF(orderDataForInvoice, userObj, addressObj, masterOrderId);

    // After order generation, validate use of the coupon if any
    if (couponCode) {
      await CouponModel.findOneAndUpdate(
        { code: couponCode },
        { $inc: { usedCount: 1 } }
      );
    }

    // Coupon Generation Logic
    let generatedCouponCode = null;
    const threshold = parseInt(process.env.COUPON_GENERATION_THRESHOLD_AMOUNT || 1000);
    if (totalAmt >= threshold) {
      const generatedCodeStr = (process.env.COUPON_PREFIX || 'NEXA') + Math.random().toString(36).substring(2, 6).toUpperCase() + Date.now().toString().slice(-4);
      const discountPercent = parseInt(process.env.COUPON_DISCOUNT_PERCENT || 10);
      const expiryDays = parseInt(process.env.COUPON_EXPIRY_DAYS || 30);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);

      const newCoupon = new CouponModel({
        code: generatedCodeStr,
        discountPercent: discountPercent,
        minPurchaseAmount: parseInt(process.env.COUPON_MIN_PURCHASE_AMOUNT || 500),
        expiryDate: expiryDate,
        usageLimit: parseInt(process.env.COUPON_MAX_USAGE_PER_CODE || 1),
      });

      await newCoupon.save();
      generatedCouponCode = newCoupon;
    }

    // Send Email
    try {
      const htmlContent = orderConfirmationTemplate({
          userName: userObj.name,
          orderId: masterOrderId,
          orderData: orderDataForInvoice,
          address: addressObj
      });

      const attachments = [{
          filename: fileName,
          content: pdfBuffer
      }];

      if (generatedCouponCode) {
        const couponEmailHtml = couponEmailTemplate({
            userName: userObj.name,
            couponCode: generatedCouponCode.code,
            discountPercent: generatedCouponCode.discountPercent,
            minPurchaseAmount: generatedCouponCode.minPurchaseAmount,
            expiryDate: generatedCouponCode.expiryDate
        });
        await sendemail({
            sendTo: email || req.user.email,
            Subject: `🎉 You unlocked a reward, ${userObj.name}!`,
            html: couponEmailHtml
        });
      }

      await sendemail({
          sendTo: email || req.user.email,
          Subject: `Order Confirmation - ${masterOrderId}`,
          html: htmlContent,
          attachments
      });
    } catch (emailError) {
      console.error("Failed to send order email, but order was created.", emailError);
    }

    res.status(201).json({ 
        success: true,
        message: "Checkout successful", 
        data: {
            orders: newOrders,
            masterOrderId,
            invoiceUrl: `/api/order/invoice/${fileName}`
        },
        error: null
    });

  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    res.status(500).json({ success: false, message: "Error processing checkout", data: null, error: error.message });
  }
};

export const getInvoice = (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'invoices', filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ message: "Invoice not found" });
    }
};
