import { User } from "../models/user.model.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "./error.js";

// Middleware to allow only admin user
export const adminOnly = TryCatch(async (req, res, next) => {
  const { id } = req.query;
  if (!id) return next(new ErrorHandler("Login Required", 401));

  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("Unauthorized No user found", 401));

  if (user.role !== "admin")
    return next(new ErrorHandler("Admin Authorization Only", 401));

  next();
});
