import express from "express";
import { userRouter } from "./auth/userRouter";
import { ticketRouter } from "./ticket/ticketRouter";
import { commentRouter } from "./comments/commentRouter";

const api = express.Router();

api.use("/users", userRouter);
api.use("/tickets", ticketRouter);
api.use("/comments", commentRouter);

export { api };
