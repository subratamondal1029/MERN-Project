import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
console.log(process.env.MONGODB_URI);


const connectDb = async () => {
    try {
      const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      console.log(`\n mongoDb connected || DB host ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("Mongodb Connection Error: ", error);
        process.exit(1)        
    }
}

export default connectDb