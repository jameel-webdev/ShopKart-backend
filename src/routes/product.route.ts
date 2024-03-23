import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import {
  deleteProduct,
  getAdminProducts,
  getAllCategories,
  getAllProduts,
  getLatestProducts,
  getSingleProduct,
  newProduct,
  updateProduct,
} from "../controllers/product.controller.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

//Route - /api/product/new
router.post("/new", adminOnly, singleUpload, newProduct);

//Route - /api/product/latest
router.get("/latest", getLatestProducts);

//Route - /api/product/all - allproduct
router.get("/all", getAllProduts);

//Route - /api/product/categories
router.get("/categories", getAllCategories);

//Route - /api/product/admin/products
router.get("/admin-products", adminOnly, getAdminProducts);

//Route - /api/product/:id
router
  .route("/:id")
  .get(getSingleProduct)
  .put(adminOnly, singleUpload, updateProduct)
  .delete(adminOnly, deleteProduct);

export default router;
