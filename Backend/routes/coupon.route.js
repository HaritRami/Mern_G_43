import express from 'express';
import { validateCoupon, getAllCoupons } from '../controllers/coupon.controller.js';
import { verifyAccessToken } from '../middleware/jwt.middleware.js';

const couponRouter = express.Router();

// Apply tokens verification
// Using verifyAccessToken according to typical setup you might have
couponRouter.post('/validate', verifyAccessToken, validateCoupon);

// If you have a specific admin middleware, it could be added here.
// But for now we just verify access token.
couponRouter.get('/admin/list', verifyAccessToken, getAllCoupons);

export default couponRouter;
