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

// Public / Frontend AI template loading
reviewRouter.get('/ai-reply', generateReviewTemplate);

// Public — anyone can read reviews
reviewRouter.get('/:productId', getProductReviews);

// Protected — must be logged in
reviewRouter.post('/', authenticateToken, addReview);
reviewRouter.get('/check/:productId', authenticateToken, checkReviewExists);
reviewRouter.put('/:reviewId', authenticateToken, updateReview);
reviewRouter.delete('/:reviewId', authenticateToken, deleteReview);

// Admin Routes for Managing JSON Templates
// We use simple authenticateToken for safety. Role guarding should be applied in a full production environment.
reviewRouter.get('/admin/templates', authenticateToken, getAllTemplates);
reviewRouter.post('/admin/templates', authenticateToken, addTemplate);
reviewRouter.put('/admin/templates/:id', authenticateToken, updateTemplate);
reviewRouter.delete('/admin/templates/:id', authenticateToken, deleteTemplate);

export default reviewRouter;
