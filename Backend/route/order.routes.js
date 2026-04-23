import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    getSellerOrders,
    getUserOrders,
    createCheckoutSession,
    getOrderInvoice
} from "../controllers/order.controller.js";

const orderRouter = express.Router();

// ── IMPORTANT: Specific named routes MUST come before dynamic /:id routes ──

// Checkout — processes the whole cart
orderRouter.post("/checkout", authenticateToken, createCheckoutSession);

// Seller & User order lists
orderRouter.get("/seller", authenticateToken, getSellerOrders);
orderRouter.get("/user",   authenticateToken, getUserOrders);

// On-demand invoice download (auth required)
// Pattern: /:orderId/invoice — specific enough that Express won't confuse it with /:id
orderRouter.get("/:orderId/invoice", authenticateToken, getOrderInvoice);

// Generic CRUD (dynamic, goes last)
orderRouter.get("/",    getAllOrders);
orderRouter.post("/",   authenticateToken, createOrder);
orderRouter.get("/:id",    getOrderById);
orderRouter.put("/:id",    updateOrder);
orderRouter.delete("/:id", deleteOrder);

export default orderRouter;
