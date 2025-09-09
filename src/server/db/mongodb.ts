import { handleServerError } from "@/utils/handleError";
import mongoose from "mongoose";
import '../models'; // Ensures models are loaded
const MONGODB_URI = process.env.MONGODB_URI;

// Interface for global object to avoid TypeScript errors
interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

declare global {
  // Ensure the global object has the mongoose property
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

// Check if the global object already has the mongoose property, otherwise set it
global.mongoose = global.mongoose || { conn: null, promise: null };

const cached = global.mongoose;

async function connectToDatabase(): Promise<mongoose.Connection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    if (!MONGODB_URI) {
      throw new Error(
        "Please define the MONGODB_URI environment variable"
      );
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => mongoose.connection)
      .catch((err) => {

        handleServerError({
          error: err,
          location: "connectToDatabase",
        });
        
        cached.conn = null;
        cached.promise = null;
        throw err;
      })
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;


export function getMongoClient() {
  return mongoose.connection.getClient();
}

