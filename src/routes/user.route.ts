import express from "express";
import { newUser } from "../controllers/user.controller.js";

const router = express.Router();

//Route - /api/vi/user/new
router.post("/new", newUser);

export default router;
