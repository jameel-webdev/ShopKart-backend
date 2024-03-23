import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model.js";
import { NewUserRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "../middlewares/error.js";

export const newUser = TryCatch(
  async (
    req: Request<{}, {}, NewUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, photo, gender, dob, _id } = req.body;
    console.log(name, email, photo, gender, dob, _id);
    const newUser = await User.create({
      name,
      email,
      photo,
      gender,
      dob: new Date(dob),
      _id,
    });

    return res
      .status(201)
      .json({ success: true, message: `Welcome, ${newUser.name}`, newUser });
  }
);
