import express from "express";
import {
  deleteUserById,
  getAllUsers,
  getUserById,
  logoutUser,
  newUser,
} from "../controllers/user.controller.js";
import { adminOnly } from "../middlewares/auth.js";

const router = express.Router();

//Route - /api/user/new
router.post("/new", newUser);

//Route - /api/user/all
router.get("/all", adminOnly, getAllUsers);

//Route - /api/user/:id
router.route("/:id").get(getUserById).delete(adminOnly, deleteUserById);

//Route - /api/user/logout
router.route("/logout").post(logoutUser);

export default router;
