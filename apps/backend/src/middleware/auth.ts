import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/jwt";

export type AuthRequest = Request & {
  userId?: string;
};

function getBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;

  if (!header) return undefined;

  const [type, token] = header.split(" ");

  if (type !== "Bearer") return undefined;

  return token;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token ?? getBearerToken(req);

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