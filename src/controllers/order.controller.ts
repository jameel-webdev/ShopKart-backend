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

export const myOrders = TryCatch(async (req, res, next) => {
  const { id: userId } = req.query;

  let orders = [];
  const key = `myorders-${userId}`;
  if (nodeCache.has(key)) {
    orders = JSON.parse(nodeCache.get(key) as string);
  } else {
    orders = await Order.find({ userId });
    nodeCache.set(key, JSON.stringify(orders));
  }
  return res.status(200).json({
    success: true,
    orders,
  });
});

export const getOneOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const key = `order-${id}`;
  let oneOrder;
  if (nodeCache.has(key)) {
    oneOrder = JSON.parse(nodeCache.get(key) as string);
  } else {
    oneOrder = await Order.findById(id).populate("user", "name");
    if (!oneOrder) {
      return next(new ErrorHandler("Order not fount", 404));
    }
    nodeCache.set(key, JSON.stringify(oneOrder));
  }
  return res.status(200).json({
    success: true,
    oneOrder,
  });
});

export const getAllOrders = TryCatch(async (req, res, next) => {
  let allorders = [];

  if (nodeCache.has("allorders")) {
    allorders = JSON.parse(nodeCache.get("allorders") as string);
  } else {
    allorders = await Order.find().populate("user", "name");
    nodeCache.set("allorders", JSON.stringify(allorders));
  }
  return res.status(200).json({
    success: true,
    allorders,
  });
});

export const updateOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }
  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;
    case "Shipped":
      order.status = "Delivered";
      break;
    default:
      order.status = "Delivered";
      break;
  }

  await order.save();

  revalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });
  return res.status(200).json({
    success: true,
  });
});
export const deleteOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) return next(new ErrorHandler("Order Not Found", 404));

  await order.deleteOne();

  revalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });
  return res.status(200).json({
    success: true,
  });
});
