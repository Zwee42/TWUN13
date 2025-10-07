import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import Link from "next/link";



export type Note = {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  sharedWith?: string[];
};

export function NoteContent({ note, handleMoveToTrash }: { note: Note, handleMoveToTrash: (noteId: string) => void }) {

  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <h3 className="font-bold text-lg text-purple-300 mb-2">
        {note.title}
      </h3>

      {note.sharedWith && note.sharedWith.length > 0 && (
        <p className="text-sm text-blue-400 mb-2">Shared with you</p>
      )}

      <div

        className={"mt-2 p-4 border border-purple-700 rounded-xl bg-black/50 max-w-none flex-1 min-h-[20vh] overflow-y-hidden transition-all duration-300" }
      >
        <div className={"prose prose-invert" + (expanded ? "" : " overflow-scroll h-[27vh] ")}>
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {note.content}
          </ReactMarkdown>
        </div>
        <span className="text-xs text-gray-400 mt-2">
          {new Date(note.createdAt).toLocaleString()}
        </span>

        <div className="flex gap-2 mt-3">
          {/* Edit-knapp skickar till id.tsx */}
          <Link href={`/id?id=${note._id}`}>
            <button className="bg-purple-700 px-3 py-1 rounded-lg hover:bg-purple-600 shadow">
              Edit
            </button>
          </Link>

          <button
            onClick={() => handleMoveToTrash(note._id)}
            className="bg-red-600 px-3 py-1 rounded-lg hover:bg-red-500 shadow"
          >
            Delete
          </button>

          <button onClick={() => setExpanded(!expanded)} className="bg-gray-600 px-3 py-1 rounded-lg hover:bg-gray-500 shadow">
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>


        <style jsx global>{`
        .katex,
        .katex * {
          white-space: normal !important;
          word-break: break-word !important;
          overflow-wrap: anywhere !important;
        }
      `}</style>

      </div>

    </div>
  );
}
