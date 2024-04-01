import jwt from "jsonwebtoken";

export const generateToken = (res: any, userId: string) => {
  try {
    const jwtSecret: string | undefined = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT secret is not defined.");
    }
    const token = jwt.sign({ userId }, jwtSecret, {
      expiresIn: "30d",
    });
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "None",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Issue With Assiging JWT`);
  }
};
