import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from "@/lib/mongodb";
import Note from "@/models/Note";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();

    try {
        if (req.method === "GET") {
          const notes = await Note.find();
          return res.status(200).json(notes);
        }
    
        if (req.method === "POST") {
          const { title, content, userId } = req.body;
          const newNote = await Note.create({ title, content, userId });
          return res.status(201).json(newNote);
        }
    
        return res.status(405).json({ message: "Method not allowed" });
      } catch (error: any) {
        return res.status(500).json({ message: error.message });
      }
    }