import mongoose from "mongoose";

export const connectDb = async (uri: string) => {
  try {
    const connect = await mongoose.connect(uri, {
      dbName: "Ecommerse2024",
    });
    console.log(`MongoDb connected on host ${connect.connection.host}`);
  } catch (error) {
    console.log("MongoDb connection failed");
    process.exit(1);
  }
};
