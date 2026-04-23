import ReviewModel from '../models/review.model.js';
import ProductModel from '../models/product.model.js';
import mongoose from 'mongoose';

// ─── Helper: Recalculate and persist product rating aggregates ────────────────
// Called after every create / update / delete to keep averageRating + totalReviews
// in sync. Uses MongoDB aggregation for accurate floating-point math.
const recalculateProductRating = async (productId) => {
  // Cast to ObjectId so the $match works correctly regardless of whether
  // productId arrives as a string (from req.params) or already as ObjectId.
  const oid = new mongoose.Types.ObjectId(productId.toString());
  const result = await ReviewModel.aggregate([
    { $match: { productId: oid } },
    {
      $group: {
        _id: '$productId',
        totalReviews: { $sum: 1 },
        ratingSum:    { $sum: '$rating' }
      }
    }
  ]);

  if (result.length === 0) {
    // All reviews deleted — reset to defaults
    await ProductModel.findByIdAndUpdate(productId, {
      averageRating: 0,
      totalReviews:  0
    });
  } else {
    const { totalReviews, ratingSum } = result[0];
    const averageRating = Math.round((ratingSum / totalReviews) * 10) / 10; // 1 decimal

    await ProductModel.findByIdAndUpdate(productId, {
      averageRating,
      totalReviews
    });
  }
};

// ─── POST /api/reviews ────────────────────────────────────────────────────────
// Add a new review. One review per user per product enforced by DB index.
export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Ensure product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Insert — the unique compound index will throw code 11000 on duplicate
    const review = await ReviewModel.create({
      userId,
      productId,
      rating: Number(rating),
      comment: comment?.trim() || ''
    });

    await recalculateProductRating(productId);

    // Populate user info for immediate front-end use
    const populated = await review.populate('userId', 'name avatar');

    return res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: populated
    });

  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key — user already reviewed this product
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }
    console.error('addReview error:', error);
    return res.status(500).json({ success: false, message: 'Unable to submit review. Please try again.' });
  }
};

// ─── GET /api/reviews/:productId ─────────────────────────────────────────────
// Fetch paginated reviews for a product, sorted by query param.
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      sort  = 'latest',   // 'latest' | 'highest' | 'lowest'
      page  = 1,
      limit = 10
    } = req.query;

    const product = await ProductModel.findById(productId).select('averageRating totalReviews name');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Build sort order
    const sortMap = {
      latest:  { createdAt: -1 },
      highest: { rating: -1, createdAt: -1 },
      lowest:  { rating:  1, createdAt: -1 }
    };
    const sortOption = sortMap[sort] || sortMap.latest;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      ReviewModel.find({ productId })
        .populate('userId', 'name avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      ReviewModel.countDocuments({ productId })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        averageRating: product.averageRating,
        totalReviews:  product.totalReviews,
        pagination: {
          total,
          page:  parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('getProductReviews error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
};

// ─── PUT /api/reviews/:reviewId ───────────────────────────────────────────────
// Update a review — only the author can edit it.
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'You can only edit your own review' });
    }

    if (rating)   review.rating  = Number(rating);
    if (comment !== undefined) review.comment = comment.trim();
    await review.save();

    await recalculateProductRating(review.productId);

    const populated = await review.populate('userId', 'name avatar');

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: populated
    });
  } catch (error) {
    console.error('updateReview error:', error);
    return res.status(500).json({ success: false, message: 'Error updating review' });
  }
};

// ─── DELETE /api/reviews/:reviewId ───────────────────────────────────────────
// Delete a review — only the author or Admin can delete it.
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId   = req.user._id;
    const userRole = req.user.role;

    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (review.userId.toString() !== userId.toString() && userRole !== 'Admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own review' });
    }

    const productId = review.productId;
    await ReviewModel.findByIdAndDelete(reviewId);
    await recalculateProductRating(productId);

    return res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('deleteReview error:', error);
    return res.status(500).json({ success: false, message: 'Error deleting review' });
  }
};

// ─── GET /api/reviews/check/:productId ───────────────────────────────────────
// Check if the current authenticated user has already reviewed a product.
export const checkReviewExists = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const review = await ReviewModel.findOne({ userId, productId });

    return res.status(200).json({
      success: true,
      hasReviewed: !!review,
      review: review || null
    });
  } catch (error) {
    console.error('checkReviewExists error:', error);
    return res.status(500).json({ success: false, message: 'Error checking review status' });
  }
};


