import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const mongoDbUrl = process.env.MONGODBCONNECTIONSTRING;

const ConnectDb = async () => {
  try {
    const connection = await mongoose.connect(mongoDbUrl);

    console.log("MongoDB connected____");

    return connection;
  } catch (error) {
    console.log(error);
  }
};

export default ConnectDb;
