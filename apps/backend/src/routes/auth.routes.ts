import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "@repo/db";
import { signupSchema, signinSchema } from "../schemas/auth.schema";
import { validateBody } from "../middleware/validate";
import { signToken } from "../services/jwt";

export const authRouter = Router();

const isProd = process.env.NODE_ENV === "production";

authRouter.post("/signup", validateBody(signupSchema), async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      balance: {
        create: {
          available: 0,
          locked: 0,
        },
      },
    },
  });

  const token = signToken(user.id);

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

authRouter.post("/signin", validateBody(signinSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(user.id);

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  });

  return res.json({ message: "Logged out" });
});
