// pages/api/share.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import Note, { INote } from "@/models/Note";

type Data =
  | { success: boolean; message: string }
  | { success: boolean; sharedWith: string[] };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { noteId, email } = req.body;

  if (!noteId || !email) {
    return res.status(400).json({ success: false, message: "Missing noteId or email" });
  }

  try {
    const note = (await Note.findById(noteId)) as INote | null;

    if (!note) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    }

    // säkerställ att sharedWith alltid är en array
    note.sharedWith = note.sharedWith || [];

    if (!note.sharedWith.includes(email)) {
      note.sharedWith.push(email);
      await note.save();
    }

    return res
      .status(200)
      .json({ success: true, sharedWith: note.sharedWith });
  } catch (err: any) {
    console.error("Error sharing note:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}