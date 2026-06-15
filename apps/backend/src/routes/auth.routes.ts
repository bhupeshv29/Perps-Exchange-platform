import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "@repo/db/client";
import { signupSchema, signinSchema } from "../schemas/auth.schema";
import { validateBody } from "../middleware/validate";
import { signToken } from "../services/jwt";

export const authRouter = Router();

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
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
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
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out" });
});