import express from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  importProducts,
  getProductByBarcodeController,
  getProductsByCategory,
  searchProducts
} from "../controllers/product.controller.js";
import multer from 'multer';

const productRouter = express.Router();

// Configure Excel upload
const excelUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Please upload an Excel file'));
    }
  }
});

productRouter.post("/", authenticateToken, upload.array('images', 5), createProduct);
productRouter.get("/", getAllProducts);
productRouter.get("/search", searchProducts);
productRouter.get("/:productId", getProductById);
productRouter.put("/:productId", authenticateToken, upload.array('images', 5), updateProduct);
productRouter.delete("/:productId", authenticateToken, deleteProduct);
productRouter.post("/import", authenticateToken, excelUpload.single('file'), importProducts);
productRouter.get("/barcode/:barcodeId", getProductByBarcodeController);
productRouter.get("/category/:categoryName", getProductsByCategory);

export default productRouter;
