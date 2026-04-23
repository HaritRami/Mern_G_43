import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    orderId: {
      type: String,
      required: [true, "Provide OrderId"],
      unique: true,
    },
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
    productDetail: {
      name: {
        type: String,
        default: '' // optional name field
      },
      quantity: {
        type: Number,
        default: 1
      },
      images: {
        type: [String],
        default: [],
      },
    },
    paymentId: {
      type: String, // Updated to string, assuming payment ID is a reference or identifier
      default: "",  // Default empty string if not set
    },
    paymentStatus: {
      type: String,
      default: "", // Default is an empty string
    },
    deliveryAddress: {
      type: mongoose.Schema.ObjectId,
      ref: "Address", // Fixed the reference to the Address model
    },
    subTotalAmt: {
      type: Number,
      default: 0,
    },
    totalAmt: {
      type: Number,
      default: 0,
    },
    invoiceReceipt: {
      type: String,
      default: "",   // stores the PDF filename, e.g. "invoice_ORD-1714000000000.pdf"
    },
    trackingDate: {
      type: Date,
      default: () => new Date(Date.now() + 3*24*60*60*1000) // default 3 days from creation
    },
    couponCode: {
      type: String,
      default: "",
    },
    couponDiscount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // Correct placement of timestamps
);

const OrderModel = mongoose.model("Order", orderSchema);
export default OrderModel;
