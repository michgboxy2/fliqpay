import express, { Request, Response } from "express";
import { json, urlencoded } from "body-parser";
import cors from "cors";
import cookieSession from "cookie-session";

import { api } from "../api/v1/api";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cors());

app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);

app.use("/api", api);

app.all("*", async (req, res) => {
  return res.status(404).send({ message: "page not found" });
});

app.use((err: Error, req: Request, res: Response) => {
  return res.status(400).send({ errors: err });
});

export { app };
