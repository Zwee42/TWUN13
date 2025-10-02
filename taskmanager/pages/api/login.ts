
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User"
import bcrypt from "bcryptjs";

// async????
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== "POST") {
        return res.status(405).json({message:"onLY post requests allowed"});

    }

    try {
        await dbConnect();
        console.log("connected to the database");

        const {email, password} = req.body;
        console.log("login försök:", {email, password});

        if (!email || !password) {
            return res.status(400).json({message: "u missed a feild"});

        }



            const user = await User.findOne({email});
            if (!user) {
                    return res.status(400).json({message: "user not found"});
            }

            const isMatch = await bcrypt.compare(password, user.password);
               
            if(!isMatch) {
                    return res.status(400).json({message: "haha, wrong password"});
                }

            return res.status(200).json({
                message: "Login succeful?? yay",
                user: {username: user.name, email: user.email}
            })


    } catch(err) {
        console.error("error in apu login", err);
        return res.status(500).json({error: "something went wrong :("});
    }
    
}