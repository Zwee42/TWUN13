import type { NextApiRequest, NextApiResponse } from 'next';

import dbConnect from '@/lib/mongodb'

import User from '@/models/User';

import bcrypt from 'bcryptjs';
import { MongoServerError } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {


    if (req.method != "POST") { // post = create new user
        return res.status(405).json({ message: "Only POST requests allowed" });
    }

    try { // try block because if something goes wrong we can catch it 
        await dbConnect(); // connect to the database;


        const { username, email, password } = req.body; // the data som cliet skickar ( frontend) till backend i bodyin;


        console.log("creating user:", username, email);


        if (!username || !email || !password) {
            return res.status(400).json({ message: "whoops! fill in all fields" });
        } // om något saknas.....


        // kanske emailen redan existser?
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "be original" });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "username already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // skapar en ny användare som matchar vprt schema i databasen;
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        return res.status(201).json({ message: "all gwent good!" });




    } catch (err: unknown) {
        console.error(err);

        if (err instanceof MongoServerError && err.code === 11000) {
            return res.status(400).json({ message: "email or username laready taken" });

        }
        return res.status(500).json({ error: " something went wrong :( " });

    }







}