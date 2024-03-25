import express from "express";
import { connectDb } from "./utils/db.js";
import { errorMiddleware } from "./middlewares/error.js";
import NodeCache from "node-cache";
import { config } from "dotenv";

// Importing Routes
import userRoutes from "./routes/user.route.js";
import productRoutes from "./routes/product.route.js";
import orderRoutes from "./routes/order.route.js";
import paymentRoutes from "./routes/payment.route.js";

config();
const port = process.env.PORT || 5000;
const dbUrl = process.env.MONGODB_URI || "";
connectDb(dbUrl); //Database connection

export const nodeCache = new NodeCache(); //NodeCache

const app = express();

//Middleware-Inbuilt
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Api wronking with /api/v1");
});

//Using Routes
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment", paymentRoutes);

//Making a folder static to access files
app.use("/uploads", express.static("uploads"));

//Middleware-Custom
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
