// types/global.d.ts
import type { Mongoose } from "mongoose";


export {};

declare global {
  // Global cache used in Next.js / serverless mongoose connection helpers
  var mongoose: {
    conn: unknown | null;
    promise: Promise<Mongoose> | null;
    
  };


}

