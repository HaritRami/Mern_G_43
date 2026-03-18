import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const authenticateToken = async (req, res, next) => {
    try {
        // Prefer the access token from cookie, fall back to Authorization header
        const authHeader = req.headers['authorization'];
        const tokenFromHeader = authHeader && authHeader.split(' ')[1] ? authHeader.split(' ')[1] : authHeader;
        const token = req.cookies?.accessToken || tokenFromHeader;

        if (!token) {
            return res.status(401).json({
                message: "Authentication required",
                error: true,
                success: false
            });
        }

        try {
            // Verify the token with the same secret that was used to sign it
            const secret = process.env.SECRET_KEY_ACCESS_TOKEN || process.env.ACCESS_TOKEN_SECRET;
            if (!secret) {
                return res.status(500).json({
                    message: "Server misconfiguration: access token secret is missing.",
                    error: true,
                    success: false
                });
            }

            const decoded = jwt.verify(token, secret);

            // Ensure correct payload property (`id` or `userId`)
            const userId = decoded.id || decoded.userId;
            if (!userId) {
                return res.status(401).json({
                    message: "Invalid token payload",
                    error: true,
                    success: false
                });
            }

            // Fetch user from DB (excluding sensitive fields)
            const user = await User.findById(userId).select("-password -refresh_token");

            if (!user) {
                return res.status(401).json({
                    message: "User not found",
                    error: true,
                    success: false
                });
            }

            req.user = user;
            next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(403).json({
                    message: "Token expired",
                    error: true,
                    success: false,
                    expired: true
                });
            }
            return res.status(401).json({
                message: "Invalid token",
                error: true,
                success: false
            });
        }
    } catch (error) {
        next(error); // Pass unexpected errors to global error handler
    }
};

export const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({
            message: "Admin access required",
            error: true,
            success: false
        });
    }
}; 