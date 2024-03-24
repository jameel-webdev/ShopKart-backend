import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { NewOrderRequestBody } from "../types/types.js";
import { Order } from "../models/order.model.js";
import { reduceStock } from "../utils/reduceStock.js";
import { revalidateCache } from "../utils/cache-revalidation.js";
import ErrorHandler from "../utils/utility-class.js";
import { nodeCache } from "../app.js";

export const newOrder = TryCatch(
  async (req: Request<{}, {}, NewOrderRequestBody>, res, next) => {
    const {
      shippingInfo,
      shippingCharges,
      user,
      orderItems,
      subtotal,
      tax,
      discount,
      total,
    } = req.body;

    if (!shippingInfo || !user || !orderItems || !subtotal || !tax || !total) {
      return next(new ErrorHandler("Please provide all fields", 400));
    }

    await Order.create({
      shippingInfo,
      shippingCharges,
      user,
      orderItems,
      subtotal,
      tax,
      discount,
      total,
    });

    await reduceStock(orderItems);

    await revalidateCache({ order: true, product: true, admin: true });

    return res.status(201).json({
      success: true,
      message: "Order placed success",
    });
  }
);

export const getOneOrder = TryCatch(async (req, res, next) => {
  return res.status(200).json({
    success: true,
  });
});

export const getAllOrders = TryCatch(async (req, res, next) => {
  let allorders = [];

  if (nodeCache.has("allorders")) {
    allorders = JSON.parse(nodeCache.get("allorders") as string);
  } else {
    allorders = await Order.find({});
    nodeCache.set("allorders", JSON.stringify(allorders));
  }
  return res.status(200).json({
    success: true,
    allorders,
  });
});
export const updateOrder = TryCatch(async (req, res, next) => {
  return res.status(200).json({
    success: true,
  });
});
export const deleteOrder = TryCatch(async (req, res, next) => {
  return res.status(200).json({
    success: true,
  });
});
