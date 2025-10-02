import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import Note from "@/models/Note";
import mongoose from "mongoose";


export default async function handler(req: NextApiRequest, res:NextApiResponse) {
    await dbConnect();
    const {id} = req.query;
    const {method} =req;

    if(!id|| Array.isArray(id)) return res.status(400).json({message: "Invalid id"});
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json ({message: "Invalid ObjectId"});

    try{
        if (method === "GET"){
            const note = await Note.findById(id);
            if (!note) return res.status(404).json({ message: "Note not found" });
      return res.status(200).json(note);
        }
        if (method === "PUT") {
            
            const { title, content } = req.body;
            if (!title) return res.status(400).json({ message: "Title is required" });
      
            const updated = await Note.findByIdAndUpdate(id, { title, content }, { new: true });
            return res.status(200).json(updated);
          }
      
          if (method === "PATCH") {
            // Partiell update — vi använder detta för att sätta isDeleted true/false (trash/restore)
            const { isDeleted } = req.body;
            if (typeof isDeleted !== "boolean") return res.status(400).json({ message: "isDeleted boolean required" });
      
            const updated = await Note.findByIdAndUpdate(id, { isDeleted }, { new: true });
            return res.status(200).json(updated);
          }
      
          if (method === "DELETE") {
            // Permanent radering
            await Note.findByIdAndDelete(id);
            return res.status(200).json({ message: "Deleted" });
          }
      
          return res.status(405).json({ message: "Method not allowed" });
        } catch (err) {
          if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
          }
          return res.status(500).json({ message: "Unknown error" });
        }
        
    }
