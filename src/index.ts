import mongoose from "mongoose";
import dotenv from "dotenv";
import { app } from "./server/server";

dotenv.config();

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  try {
    await mongoose.connect(
      "mongodb://username:password1@ds121331.mlab.com:21331/tickets",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      }
    );
    console.log("connected to MongoDb");
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};

app.listen(3000, async () => {
  console.log("server started on port 3000!!!!!");
});

start();
