import mongoose from "mongoose";
import { nanoid } from 'nanoid';

const productSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        default: ""
    }],
    category: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Category'
    }],
    subCategory: [{
        type: mongoose.Schema.ObjectId,
        ref: 'SubCategory'
    }],
    unit: {
        type: String,
        default: ""
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    price: {
        type: Number,
        default: null,
        min: [0, 'Price cannot be negative']
    },
    discount: {
        type: Number,
        default: null,
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100%']
    },
    description: {
        type: String,
        default: ""
    },
    moreDetail: {
        type: Object,
        default: {}
    },
    Public: {
        type: Boolean,
        default: true
    },
    barcodeId: {
        type: String,
        default: () => nanoid(10),
        unique: true
    },
    // ─── Review Aggregates ────────────────────────────────────────────────────
    // Denormalised for fast reads. Recalculated whenever a review is added/
    // updated/deleted by the review controller.
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

const ProductModel = mongoose.model("Product", productSchema);
export default ProductModel;