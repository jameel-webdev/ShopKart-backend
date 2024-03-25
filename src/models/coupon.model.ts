import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: [true, "Please enter the coupon code"],
      unique: true,
    },
    amount: {
      type: Number,
      required: [true, "Please enter the discount amount"],
    },
  },
  {
    timestamps: true,
  }
);

export const Coupon = mongoose.model("Coupon", schema);
