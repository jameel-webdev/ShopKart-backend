import express from "express";
import { getDashboardStats } from "../controllers/stats.controller.js";
import { adminOnly } from "../middlewares/auth.js";

const router = express.Router();

//Route - /api/dashboard/stats
router.get("/stats", adminOnly, getDashboardStats);

export default router;
