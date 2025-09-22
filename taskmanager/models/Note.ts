import mongoose, {Document,Schema,Model} from "mongoose";

export interface INote extends Document{
    title: string;
    content: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        userId: { type: String, required: true },
  },
  { timestamps: true }
);

const Note: Model<INote> =
  mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);

export default Note;