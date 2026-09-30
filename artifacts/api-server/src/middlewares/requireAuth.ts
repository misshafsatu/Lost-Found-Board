import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

export function getClerkUserId(req: Request): string | null {
  const auth = getAuth(req);
  return auth?.userId ?? null;
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const userId = getClerkUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  next();
}