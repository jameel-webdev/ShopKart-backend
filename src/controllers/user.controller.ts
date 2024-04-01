import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model.js";
import { NewUserRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "../middlewares/error.js";
import { generateToken } from "../utils/generate-token.js";

export const newUser = TryCatch(
  async (
    req: Request<{}, {}, NewUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, photo, gender, dob, _id } = req.body;
    let user = await User.findById(_id);
    if (user) {
      return res
        .status(200)
        .json({ success: true, message: `Welcome, ${user.name}` });
    } else {
      let userByEmail = await User.findOne({ email });
      if (userByEmail) {
        generateToken(res, userByEmail._id);
        return res.status(200).json({
          success: true,
          message: `Welcome, ${userByEmail.name}`,
          newUser: userByEmail,
        });
      }
    }

    if (!_id || !name || !email || !photo || !gender || !dob) {
      next(new ErrorHandler("Please provide all fields", 400));
    }

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

export const getAllUsers = TryCatch(async (req, res, next) => {
  const users = await User.find({});

  return res.status(200).json({ success: true, users });
});

export const getUserById = TryCatch(async (req, res, next) => {
  const id = req.params.id;

  const user = await User.findById(id);

  if (!user) return next(new ErrorHandler("Invalid Id", 400));

  return res.status(200).json({ success: true, user });
});

export const deleteUserById = TryCatch(async (req, res, next) => {
  const id = req.params.id;

  const user = await User.findById(id);

  if (!user) return next(new ErrorHandler("Invalid Id", 400));

  await user.deleteOne();

  return res
    .status(200)
    .json({ success: true, message: "User Deleted Successfully" });
});

export const logoutUser = TryCatch(async (req, res, next) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true });
});
