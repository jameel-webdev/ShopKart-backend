import express from "express";
import { connectDb } from "./utils/db.js";
import { errorMiddleware } from "./middlewares/error.js";

// Importing Routes
import userRoutes from "./routes/user.route.js";
import productRoutes from "./routes/product.route.js";

const port = 5000;
connectDb(); //Database connection
const app = express();

//Middleware-Inbuilt
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Api wronking with /api/v1");
});

//Using Routes
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);

//Making a folder static to access files
app.use("/uploads", express.static("uploads"));

//Middleware-Custom
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
