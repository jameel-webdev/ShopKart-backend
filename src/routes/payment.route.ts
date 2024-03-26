import express from "express";
import {
  allCoupons,
  applyDiscount,
  createPaymentIntent,
  deleteCoupon,
  newCoupon,
} from "../controllers/payment.controller.js";
import { adminOnly } from "../middlewares/auth.js";

const router = express.Router();

//Route - /api/payment/create
router.post("/create", createPaymentIntent);

//Route - /api/payment/coupon/new
router.post("/coupon/new", adminOnly, newCoupon);

//Route - /api/payment/discount
router.get("/discount", applyDiscount);

//Route - /api/payment/coupon/all
router.get("/coupon/all", adminOnly, allCoupons);

//Route - /api/payment/coupon/:id
router.delete("/coupon/:id", adminOnly, deleteCoupon);

export default router;
