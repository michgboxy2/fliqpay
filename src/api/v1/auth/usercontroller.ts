import { Request, Response, NextFunction } from "express";
// import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { User } from "./userModel";
import { Password } from "../services/password";

export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    return res.status(400).send({ message: "invalid credentials" });
  }

  const passwordMatch = await Password.compare(existingUser.password, password);

  if (!passwordMatch) {
    return res.status(400).send({ message: "invalid Credentials" });
  }

  //generate JWT
  const userJwt = jwt.sign(
    {
      id: existingUser.id,
      email: existingUser.email,
    },
    process.env.JWT_KEY!
  );

  //STORE TOKEN IN SESSION OBJECT
  req.session = {
    jwt: userJwt,
  };

  res.status(200).send(existingUser);
};

export const signUp = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(403).send({ message: "Email in use" });
  }

  const user = User.build({ email, password, role });
  await user.save();

  //generate JWT
  const userJwt = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_KEY!
  );

  //STORE TOKEN IN SESSION OBJECT
  req.session = {
    jwt: userJwt,
  };

  res.status(201).send(user);
};

export const loggedOnUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.send({ currentUser: req.currentUser || null });
};
