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

export default function NotesPage() {
  const router = useRouter();
  const { id } = router.query;
  const isEditing = Boolean(id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Hämta anteckningen vid redigering
  useEffect(() => {
    if (!isEditing || !id) return;

    const fetchNote = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/notes/${id}`);
        if (!res.ok) throw new Error("Could not retrieve the note");
        const note = await res.json();
        setTitle(note.title || "");
        setContent(note.content || "");
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
      if (isEditing && id) {
        const res = await fetch(`/api/notes/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
        });
        if (!res.ok) throw new Error("Could not uptade the note");
        setIsSuccess(false);
        setMessage("!");
        setTimeout(() => router.push("/notesList"), 1500);
        return;
      }

      // Skapa ny anteckning
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, userId: "testuser" }),
      });
      if (!res.ok) throw new Error("Could not save the note");
      setIsSuccess(false);
      setMessage("Note updated successfully");
      setIsSuccess(true);
      setTitle("");
      setContent("");
      setTimeout(() => setMessage(""), 2000);
    } catch (err: any) {
      setMessage(err.message);
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
      setIsSuccess(false);
      setMessage("Note moved to trash");
      setIsSuccess(true);
      setTimeout(() => router.push("/notesList"), 1500); // gå tillbaka till lista
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white items-center justify-center">
        <p className="text-gray-400 text-xl">Laddar anteckning...</p>
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

        <Link href="/notes" passHref>
          <button className="w-full bg-purple-800/80 hover:bg-purple-700 py-3 px-4 rounded-lg text-center shadow-lg">
            Settings
          </button>
        </Link>

        <Link href="/trash" passHref>
          <button className="w-full bg-purple-900/80 hover:bg-purple-950 py-3 px-4 rounded-lg text-center shadow-lg">
            trash
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
            placeholder="Titel"
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
              {isEditing ? "Uppdatera" : "Spara"}
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

        {message && (
          <div
            className={`mb-6 p-3 rounded-lg text-center font-medium shadow-md ${isSuccess ? "bg-green-600/70 text-green-100" : "bg-red-600/70 text-red-100"
              }`}
          >
            {message}
          </div>
        )}
      </main>
    </div>
  );
}
