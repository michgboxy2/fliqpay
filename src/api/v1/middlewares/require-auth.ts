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

export const OrganizationAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.currentUser) {
      return res.status(401).send({ message: "you are not signed in" });
    }

    let user = await User.findById(req.currentUser.id);

    if (user?.role === UserRoles.User) {
      return res
        .status(401)
        .send({ message: "customers are not allowed to perform this role" });
    }

    next();
  } catch (err) {
    return res.status(400).send({ message: "something went wrong" });
  }
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
