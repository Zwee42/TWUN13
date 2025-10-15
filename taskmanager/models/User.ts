
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {

  username: string;
  email: string;
  password: string;
  newEmail?: string;
  resetToken?: string;
  resetTokenExpire?: number;
}

const UserSchema: Schema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken: { type: String, default: null },
  resetTokenExpire: { type: Date, default: null },
});


export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);