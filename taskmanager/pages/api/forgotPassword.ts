import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import { sendResetEmail } from "@/lib/nodemailer";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();
  
    const { email } = req.body;
    await dbConnect();
  
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: 'User not found' });

  const resetToken = crypto.randomBytes(32).toString("hex");
  // denna urelen ska justeras 
 
  const resetUrl = (process.env.NODE_ENV=="production"?"https://hmp.zwee.dev":`http://localhost:3000`)+`/resetPassword?token=${resetToken}`;
  user.resetToken = resetToken;
  user.resetTokenExpire = Date.now() + 1000 * 60 * 15; // 15 min
  await user.save();

  await sendResetEmail(email, resetUrl);
  return res.status(200).json({ message: "Reset link sent to your email" });
}