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

    const order = await Order.create({
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

    revalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
      productId: order.orderItems.map((i) => String(i.productId)),
    });

    return res.status(201).json({
      success: true,
      message: "Order placed success",
    });
  }
);

export const myOrders = TryCatch(async (req, res, next) => {
  const user = req.query.id as string;
  let orders = [];
  const key = `myorders-${user}`;
  if (nodeCache.has(key)) {
    orders = JSON.parse(nodeCache.get(key) as string);
  } else {
    orders = await Order.find({ user });
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
  let order;
  if (nodeCache.has(key)) {
    order = JSON.parse(nodeCache.get(key) as string);
  } else {
    order = await Order.findById(id).populate("user", "name");
    if (!order) {
      return next(new ErrorHandler("Order not fount", 404));
    }
    nodeCache.set(key, JSON.stringify(order));
  }
  return res.status(200).json({
    success: true,
    order,
  });
});

export const getAllOrders = TryCatch(async (req, res, next) => {
  let orders = [];

  if (nodeCache.has("allorders")) {
    orders = JSON.parse(nodeCache.get("allorders") as string);
  } else {
    orders = await Order.find().populate("user", "name");
    nodeCache.set("allorders", JSON.stringify(orders));
  }
  return res.status(200).json({
    success: true,
    orders,
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
    message: "Order processed successfully",
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
    message: "Order deleted successfully",
  });
});
