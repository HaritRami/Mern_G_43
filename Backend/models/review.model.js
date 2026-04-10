import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    default: '',
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    trim: true
  }
}, {
  timestamps: true
});

// ─── Compound Unique Index ────────────────────────────────────────────────────
// Enforces "one review per user per product" at the database level.
// If a duplicate insert is attempted, MongoDB throws a 11000 error.
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// ─── Compound Query Index ─────────────────────────────────────────────────────
// Speeds up GET /api/reviews/:productId queries.
reviewSchema.index({ productId: 1, createdAt: -1 });

const ReviewModel = mongoose.model('Review', reviewSchema);
export default ReviewModel;
