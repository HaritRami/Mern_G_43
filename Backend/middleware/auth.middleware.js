import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const authenticateToken = async (req, res, next) => {
    try {
        // Prefer the access token from cookie, fall back to Authorization header
        const token = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: "Authentication required",
                error: true,
                success: false
            });
        }

        try {
            // Verify the token
            const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN || process.env.ACCESS_TOKEN_SECRET);

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