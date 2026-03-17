import Order from "../models/order.model.js";
import AddressModel from "../models/address.model.js";

export const createOrder = async (req, res) => {
  try {
    console.log('createOrder body', req.body);
    // allow optional fields; grab them if provided
    const {
      userId,
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

    // ensure userId is array
    let userIds = [];
    if (Array.isArray(userId)) userIds = userId;
    else if (userId) userIds = [userId];

    let addressId = deliveryAddress;
    if (deliveryAddress && typeof deliveryAddress === 'object' && !deliveryAddress._id) {
      const addressDoc = new AddressModel({
        user: userIds[0] || null,
        address_line: deliveryAddress.address_line || "",
        city: deliveryAddress.city || "",
        state: deliveryAddress.state || "",
        country: deliveryAddress.country || "",
        mobile: deliveryAddress.mobile || null,
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
