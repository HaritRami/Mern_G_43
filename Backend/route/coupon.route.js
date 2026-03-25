import { Router } from 'express';
import { validateCoupon, getAllCoupons } from '../controllers/coupon.controller.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.middleware.js';

const couponRouter = Router();

couponRouter.post('/validate', authenticateToken, validateCoupon);
couponRouter.get('/admin/list', authenticateToken, authorizeAdmin, getAllCoupons);

export default couponRouter;
