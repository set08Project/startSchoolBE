import { connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config();
// process.env.MONGO_DB_URL_LOCAL as string
export const dbConfig = async () => {
  try {
    return await connect(
      "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0"
    )
      .then(() => {
        console.log("database connection established🔥❤️🔥");
      })
      .catch((err) => console.error());
  } catch (error) {
    return error;
  }
};
