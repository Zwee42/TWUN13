import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ error: 'Password required' });
    }

    await dbConnect();

    const user = await User.findOne({
        resetToken: token,
        resetTokenExpire: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
        return res.status(400).json({ error: 'Ogiltig eller utgången token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpire = null;

    await user.save();
    console.log(' Användare sparad');

    return res.status(200).json({ message: 'Password has been reset' });
}