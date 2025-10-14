
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User"
import bcrypt from "bcryptjs";
import {serialize} from "cookie";
import jwt from "jsonwebtoken";
import cookie from "cookie";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {





                 const cookie = serialize ("auth_token", "" , { // textblob = serilaze
                         httpOnly: true, // man kan inte redigera med javaskrcip
                         secure: process.env.NODE_ENV === "production", // encryptera kakan dubbel encypted
                         sameSite: "strict", // bara våran hemsida som kan använda kakan
                         maxAge: 0, // hur lång tid kakan håller i s
                         path: "/", // vilka ställen man har timern på 
                     }) ;

                     res.setHeader("Set-Cookie", cookie);
                
                
                     return res.status(200).json({ message: 'Logged out successfully' });
    
}