import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from "@/lib/mongodb";
import Note from "@/models/Note";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();

    try {
        if (req.method === "GET") {

          const includeDeleted = req.query.includeDeleted=== "true";
          const filter = includeDeleted
          ? {}
          : {$or:[{isDeleted : false}, {isDeleted : {$exists:false} }] };

          const notes = await Note.find(filter).sort({createdAt: -1});
          return res.status(200).json(notes);
        }
    
        if (req.method === "POST") {
          const { title, content, userId } = req.body;
          if(!title) return res.status(400).json({message: "Title is required"});
          
          const newNote = await Note.create({ title, content, userId });
          return res.status(201).json(newNote);
        }
    
        return res.status(405).json({ message: "Method not allowed" });

      } catch (error: any) {
        return res.status(500).json({ message: error.message });
      }
    }