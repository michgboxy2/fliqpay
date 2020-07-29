import { Request, Response, NextFunction } from "express";
import { User } from "../auth/userModel";
import { UserRoles } from "../services/userRoles";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.currentUser) {
    return res.status(401).send({ message: "you are not signed in" });
  }

  next();
};

export const checkIfAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.currentUser) {
    return res.status(401).send({ message: "you are not signed in" });
  }

  let user = await User.findById(req.currentUser.id);

  if (user?.role !== UserRoles.Admin) {
    return res
      .status(401)
      .send({ message: "Only admins are allowed to perform this operation" });
  }

  next();
};
