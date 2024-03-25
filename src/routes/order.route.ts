import express from "express";
import {
  deleteOrder,
  getAllOrders,
  getOneOrder,
  myOrders,
  newOrder,
  updateOrder,
} from "../controllers/order.controller.js";
import { adminOnly } from "../middlewares/auth.js";

const router = express.Router();

//Route - /api/order/new
router.post("/new", newOrder);

//Route - /api/order/myorders
router.get("/myorders", myOrders);

//Route - /api/order/myorders
router.get("/allorders", adminOnly, getAllOrders);

//Route - /api/order/:id
router
  .route("/:id")
  .get(getOneOrder)
  .put(adminOnly, updateOrder)
  .delete(adminOnly, deleteOrder);

export default router;
