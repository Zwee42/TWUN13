import mongoose, {Document,Schema,Model} from "mongoose";

export interface INote extends Document{
    title: string;
    content: string;
    userId?: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        userId: { type: String, required: true },
        isDeleted: {type:Boolean, default: false}
  },
  { timestamps: true }
);

const Note: Model<INote> =
  mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);

export default Note;