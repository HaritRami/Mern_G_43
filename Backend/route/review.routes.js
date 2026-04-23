import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
  checkReviewExists
} from '../controllers/review.controller.js';

import {
  generateReviewTemplate,
  getAllTemplates,
  addTemplate,
  updateTemplate,
  deleteTemplate
} from '../controllers/template.controller.js';

const reviewRouter = express.Router();

// ── IMPORTANT: Specific static routes MUST come before dynamic /:param routes ──

// Public / Frontend AI template loading
reviewRouter.get('/ai-reply', generateReviewTemplate);

// Protected — check if current user reviewed (must be BEFORE /:productId)
reviewRouter.get('/check/:productId', authenticateToken, checkReviewExists);

// Admin Routes (must be BEFORE /:productId so "admin" is not treated as a productId)
reviewRouter.get('/admin/templates', authenticateToken, getAllTemplates);
reviewRouter.post('/admin/templates', authenticateToken, addTemplate);
reviewRouter.put('/admin/templates/:id', authenticateToken, updateTemplate);
reviewRouter.delete('/admin/templates/:id', authenticateToken, deleteTemplate);

// Public — fetch paginated reviews for a product (dynamic, goes last)
reviewRouter.get('/:productId', getProductReviews);

// Protected — create / update / delete
reviewRouter.post('/', authenticateToken, addReview);
reviewRouter.put('/:reviewId', authenticateToken, updateReview);
reviewRouter.delete('/:reviewId', authenticateToken, deleteReview);

export default reviewRouter;
