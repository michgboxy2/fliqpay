import mongoose from "mongoose";
import dotenv from "dotenv";
import { app } from "./server/server";

dotenv.config();

const {
  JWT_KEY,
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_URI,
  MONGO_PORT,
} = process.env;

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  try {
    await mongoose.connect(
      `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_URI}:${MONGO_PORT}/tickets`,
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
