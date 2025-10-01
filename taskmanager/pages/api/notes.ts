import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from "@/lib/mongodb";
import Note from "@/models/Note";
import { FilterQuery } from "mongoose";
import { INote } from "@/models/Note";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  try {
    if (req.method === "GET") {
      const includeDeleted = req.query.includeDeleted === "true";
      const userId = req.query.userId as string;

      console.log(userId);
      if (!userId) return res.status(400).json({ message: "User not logged in" });

      // Bygg query för användarens anteckningar OCH delade anteckningar
      const baseQuery = {
        $or: [
          { userId }, // Användarens egna anteckningar
          { sharedWith: userId } // Anteckningar delade med användaren
        ]
      };


      let finalQuery: FilterQuery<typeof Note> = baseQuery;

      // Om vi INTE ska inkludera borttagna anteckningar, lägg till isDeleted villkor
      if (!includeDeleted) {
        finalQuery = {
          $and: [
            baseQuery,
            {
              $or: [
                { isDeleted: false },
                { isDeleted: { $exists: false } } // Fallback för gamla anteckningar utan isDeleted
              ]
            }
          ]
        };
      }

      const notes = await Note.find(finalQuery).sort({ createdAt: -1 });
      return res.status(200).json(notes);
    }

    if (req.method === "POST") {
      const { title, content, userId } = req.body;

      if (!title) return res.status(400).json({ message: "Title is required" });
      if (!userId) return res.status(400).json({ message: "User not logged in" });

      const newNote = await Note.create({
        title,
        content,
        userId,
        isDeleted: false
      });
      return res.status(201).json(newNote);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: "Unknown error" });
  }
}