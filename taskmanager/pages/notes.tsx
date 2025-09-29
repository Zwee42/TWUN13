import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

type Note = {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
};
type User = {
  email: string;
  username?: string;
};

export default function NotesPage() {
  const router = useRouter();
  const { id } = router.query;
  const isEditing = Boolean(id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null); // sparar _id för nya notes

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (raw) {
      try {
        setLoggedInUser(JSON.parse(raw));
      } catch {
        setLoggedInUser(null);
      }
    }
  }, []);

  // Hämta anteckningen vid redigering
  useEffect(() => {
    if (!isEditing || !id) return;

    const fetchNote = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/id?id=${id}`);
        if (!res.ok) throw new Error("Could not retrieve the note");
        setIsSuccess(false);
        const note = await res.json();
        setTitle(note.title || "");
        setContent(note.content || "");
        setNoteId(note._id); // spara id när vi är i edit
      } catch (err: any) {
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, isEditing]);

  // Skapa eller uppdatera anteckning
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (!loggedInUser) {
        setMessage("You must be logged in to create or edit notes.");
        setIsSuccess(false);
        return;
      }

      if (isEditing && id) {
        // uppdatera befintlig note
        const res = await fetch(`/api/id?id=${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
        });
        if (!res.ok) throw new Error("Could not update the note");
        setMessage("Note updated successfully!");
        setIsSuccess(true);
        return;
      }

      // skapa ny note
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, userId: loggedInUser.email }),
      });
      if (!res.ok) throw new Error("Could not save the note");

      const savedNote = await res.json();
      setNoteId(savedNote._id); // spara id så vi kan dela direkt
      setMessage("Note saved successfully!");
      setIsSuccess(true);
    } catch (err: any) {
      setMessage(err.message);
      setIsSuccess(false);
    }
  }

  // Flytta anteckning till skräp
  async function handleMoveToTrash(noteId: string) {
    const confirmMove = confirm("Move this note to Trash?");
    if (!confirmMove) return;

    try {
      const res = await fetch(`/api/id?id=${encodeURIComponent(noteId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: true }),
      });

      if (!res.ok) throw new Error("Could not move note to trash!");
      setMessage("Note moved to trash");
      setIsSuccess(true);
      setTimeout(() => router.push("/notesList"), 1500);
    } catch (err: any) {
      setMessage(err.message);
      setIsSuccess(false);
    }
  }

  // Dela anteckning
  async function handleShare() {
    const currentNoteId = isEditing ? (id as string) : noteId;

    if (!currentNoteId) {
      setMessage("You must save the note before sharing.");
      setIsSuccess(false);
      return;
    }

    if (!shareEmail) {
      setMessage("Please enter an email to share with");
      return;
    }

    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: currentNoteId, email: shareEmail }),
      });

      if (!res.ok) throw new Error("Could not share the note");

      setMessage(`Note shared with ${shareEmail}`);
      setIsSuccess(true);
      setShareEmail("");
    } catch (err: any) {
      setIsSuccess(false);
      setMessage(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white items-center justify-center">
        <p className="text-gray-400 text-xl">Loading note...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
      {/* Sidebar */}
      <aside className="w-72 backdrop-blur-md bg-black/40 border-r border-purple-900 p-6 flex flex-col gap-6 items-center justify-center shadow-xl">
        <h1 className="text-2xl font-bold text-purple-400 tracking-wide mb-6">
          Notes
        </h1>

        <Link href="/notesList" passHref>
          <button className="w-full bg-purple-800/80 hover:bg-purple-700 py-3 px-4 rounded-lg text-center shadow-lg">
            Notes list
          </button>
        </Link>

        <Link href="/trash" passHref>
          <button className="w-full bg-purple-900/80 hover:bg-purple-950 py-3 px-4 rounded-lg text-center shadow-lg">
            Trash
          </button>
        </Link>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-10">
        <h2 className="text-3xl font-bold mb-8 text-purple-300 drop-shadow-lg">
          {isEditing ? "Edit note" : "New Note"}
        </h2>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 mb-10 bg-black/60 border border-purple-900 p-6 rounded-2xl shadow-xl backdrop-blur-md"
        >
          <input
            className="border border-purple-700 bg-black/80 p-3 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Live preview */}
          <div className="mt-2 p-4 border border-purple-700 rounded-xl bg-black/50 shadow-inner prose prose-invert max-w-none break-words">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {content || "Preview will appear here..."}
            </ReactMarkdown>
          </div>

          <textarea
            className="border border-purple-700 bg-black/80 p-3 rounded-lg resize-none focus:ring-2 focus:ring-purple-600 outline-none text-white mt-2 min-h-[100px]"
            placeholder="Write your note here (supports **Markdown** and $\\LaTeX$)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 shadow-md transition-all"
            >
              {isEditing ? "Update" : "Save"}
            </button>

            {isEditing && id && (
              <button
                type="button"
                onClick={() => handleMoveToTrash(id as string)}
                className="bg-red-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-red-500 shadow-md transition-all"
              >
                Move to trash
              </button>
            )}
          </div>
        </form>

        {/* Share */}
        <div className="flex gap-3 mb-6">
          <input
            className="border border-purple-700 bg-black/80 p-3 rounded-lg text-white flex-1"
            placeholder="Enter email to share with"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
          />
          <button
            onClick={handleShare}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-500 shadow-md transition-all"
          >
            Share
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-3 rounded-lg text-center font-medium shadow-md ${
              isSuccess ? "bg-green-600/70 text-green-100" : "bg-red-600/70 text-red-100"
            }`}
          >
            {message}
          </div>
        )}
      </main>
    </div>
  );
}
