
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User"
import bcrypt from "bcryptjs";
import {serialize} from "cookie";


import jwt from "jsonwebtoken";
// import cookie from "cookie";

const SECRET = process.env.JWT_SECRET || "supersecret"; // move to env file

// async????
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== "POST") {
        return res.status(405).json({message:"only post requests allowed"});

    }

    try {
        await dbConnect();
        console.log("connected to the database");

        const {email, password} = req.body;
        console.log("login försök:", {email, password});

        if (!email || !password) {
            return res.status(400).json({message: "please fill in all feilds"});

        }
            const user = await User.findOne({email});
            if (!user) {
                    return res.status(400).json({message: "user not found"});
            }

            const isMatch = await bcrypt.compare(password, user.password);
               
            if(!isMatch) {
                    return res.status(400).json({message: "wrong password"});
                }


                const token = jwt.sign(
                    {
                        email:user.email, username: user.username
                    },
                    SECRET,
                    {expiresIn: "1h" }
                );


                 const cookie = serialize ("auth_token", token,  { // textblob = serilaze
                         httpOnly: true, // man kan inte redigera med javaskrcip
                         secure: process.env.NODE_ENV === "production", // encryptera kakan dubbel encypted
                         sameSite: "strict", // bara våran hemsida som kan använda kakan
                         maxAge: 3600, // hur lång tid kakan håller i s
                         path: "/", // vilka ställen man har timern på 
                     }) ;

                     res.setHeader("Set-Cookie", cookie);




            return res.status(200).json({
                message: "Login succeful",
                user: {username: user.name, email: user.email}
            })


    } catch(err) {
        console.error("error in apu login", err);
        return res.status(500).json({error: "something went wrong :("});
    }
    
}