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
    getInvoice
} from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.post("/", authenticateToken, createOrder);

orderRouter.get("/seller", authenticateToken, getSellerOrders);

orderRouter.get("/user", authenticateToken, getUserOrders);

orderRouter.get("/", getAllOrders);

orderRouter.get("/:id", getOrderById);

orderRouter.put("/:id", updateOrder);

orderRouter.delete("/:id", deleteOrder);

// New checkout route processing whole cart
orderRouter.post("/checkout", authenticateToken, createCheckoutSession);

// Invoice download route (publicly accessible or protected based on preference. making it public/semi-public so it easily downloads)
orderRouter.get("/invoice/:filename", getInvoice);

export default orderRouter;
