import mongoose from "mongoose";

const uri = process.env.MONGODB_URI!;
const g = globalThis as unknown as { _mongoose?: Promise<typeof mongoose> };

export function connectDB() {
  if (!g._mongoose) {
    g._mongoose = mongoose.connect(uri).catch((e) => {
      g._mongoose = undefined;
      throw e;
    });
  }
  return g._mongoose;
}