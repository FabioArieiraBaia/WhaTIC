import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import authConfig from "../config/auth";
import AppError from "../errors/AppError";

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  companyId: number;
  contactId: number;
}

const isContactAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verify(token, authConfig.secret);
    const { id, profile, companyId, contactId } = decoded as TokenPayload;

    if (profile !== "client") {
        throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    req.user = {
      id,
      profile,
      companyId,
      isSuper: false
    };

    return next();
  } catch (err) {
    throw new AppError("Invalid token.", 401);
  }
};

export default isContactAuth;
