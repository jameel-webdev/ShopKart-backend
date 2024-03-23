import express from "express";
import {
  deleteUserById,
  getAllUsers,
  getUserById,
  newUser,
} from "../controllers/user.controller.js";
import { adminOnly } from "../middlewares/auth.js";

const router = express.Router();

//Route - /api/vi/user/new
router.post("/new", newUser);

//Route - /api/vi/user/all
router.get("/all", adminOnly, getAllUsers);

//Route - /api/vi/user/:id
router.route("/:id").get(getUserById).delete(adminOnly, deleteUserById);

export default router;
