import type {NextApiRequest, NextApiResponse} from 'next';

import dbConnect from '@/lib/mongodb'

import  User  from '@/models/User';

import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {


        if ( req.method != "POST") { // post = create new user
            return res.status(405).json({message: "Only POST requests allowed"});
        }

        try { // try block because if something goes wrong we can catch it 
            await dbConnect(); // connect to the database;

            
            const {username, email, password } = req.body; // the data som cliet skickar ( frontend) till backend i bodyin;


            console.log("creating user:", username, email);


            if (!username || !email || !password ) {
                return res.status(400).json ({message: "whoops! fill in all fields"});
            } // om något saknas.....


            // kanske emailen redan existser?
            const existingUser = await User.findOne({ email });
                if (existingUser) {
                    return res.status(400).json({message: "be original"});
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                    // skapar en ny användare som matchar vprt schema i databasen;
                const newUser = new User({username, email, password: hashedPassword});
                await newUser.save();

                return res.status(201).json({message: "all gwent good!"});

                


        } catch (err) {
            console.error(err);
            return res.status(500).json({error: " something went wrong :( "});
        }




}