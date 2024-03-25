import mongoose from "mongoose";
import { trim } from "validator";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter name"],
    },
    photo: {
      type: String,
      required: [true, "Please add photo"],
    },
    price: {
      type: Number,
      required: [true, "Please provide price"],
    },
    stock: {
      type: Number,
      required: [true, "Please provide stock"],
    },
    category: {
      type: String,
      trim: true,
      required: [true, "Please provide category"],
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", schema);
