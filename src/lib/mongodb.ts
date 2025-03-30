import mongoose from "mongoose";
import config from "@/config";

// Định nghĩa kiểu cho mongoose cache
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Mở rộng global để có thể sử dụng mongoose
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = config.db.uri;

if (!MONGODB_URI) {
  throw new Error("Vui lòng cấu hình MONGODB_URI trong file .env");
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

// Khởi tạo global.mongoose nếu chưa tồn tại
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: config.db.dbName,
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      console.log(`MongoDB connected to ${config.db.dbName} [${config.app.environment}]`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error(`MongoDB connection error: ${e}`);
    throw e;
  }

  return cached.conn;
}
