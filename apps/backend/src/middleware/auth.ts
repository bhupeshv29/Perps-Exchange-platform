import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/jwt";

export type AuthRequest = Request & {
  userId?: string;
};

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
