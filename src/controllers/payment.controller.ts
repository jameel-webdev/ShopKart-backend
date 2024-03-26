import { stripe } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.model.js";
import ErrorHandler from "../utils/utility-class.js";

export const createPaymentIntent = TryCatch(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount) {
    return next(new ErrorHandler("Please provide the amount", 400));
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(amount) * 100,
    currency: "inr",
  });

  return res.status(201).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
});

export const newCoupon = TryCatch(async (req, res, next) => {
  const { couponCode, amount } = req.body;
  if (!couponCode || !amount) {
    return next(new ErrorHandler("Please enter both code and amount", 400));
  }

  await Coupon.create({ couponCode, amount });
  return res.status(201).json({
    success: true,
    message: `Coupon ${couponCode} created successfully`,
  });
});

export const applyDiscount = TryCatch(async (req, res, next) => {
  const { couponCode } = req.query as any;

  const discount = await Coupon.findOne({ couponCode });
  if (!discount) {
    return next(new ErrorHandler("Invalid coupon code", 400));
  }

  return res.status(201).json({
    success: true,
    discount: discount.amount,
  });
});

export const allCoupons = TryCatch(async (req, res, next) => {
  const coupons = await Coupon.find({});

  return res.status(200).json({
    success: true,
    coupons,
  });
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await Coupon.findByIdAndDelete(id);

  if (!coupon) {
    return next(new ErrorHandler("Coupon not found", 400));
  }

  return res.status(200).json({
    success: true,
    message: `Coupon ${coupon.couponCode} deleted succesfully`,
  });
});
