import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Cache the connection on the global object so it survives module reloads
// (dev HMR) and is reused across serverless invocations on the same warm
// container. Without this, each request can spawn a new / half-open
// connection and Mongoose buffers operations until they time out (→ 500).
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache =
  global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

export default async function dbConnect(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  // Reuse the connection only when it is fully established (readyState === 1).
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false, // fail fast instead of buffering into a timeout
      serverSelectionTimeoutMS: 8000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset so the next request retries the connection instead of reusing
    // a rejected promise forever.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
