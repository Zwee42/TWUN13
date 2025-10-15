import { useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { requireAuth } from "@/lib/auth";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await requireAuth(ctx) || { redirect: { destination: '/login', permanent: false } };
};

type Note = {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted?: boolean;
};

export default function TrashPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Håller koll på vilka anteckningar som är expanderade
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Hämta traschade anteckningar
  useEffect(() => {
    async function fetchTrash() {
      try {
        setLoading(true);
        const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        const loggedInUser = raw ? JSON.parse(raw) : null;
        if (!loggedInUser?.email) {
          setMessage("User not logged in");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/notes?includeDeleted=true&userId=${loggedInUser.email}`);
        if (!res.ok) throw new Error("Could not retrieve trash folder");

        const data: Note[] = await res.json();
        const deletedNotes = data.filter((n) => n.isDeleted === true);
        setNotes(deletedNotes);
      } catch (err) {
        if (err instanceof Error) setMessage(err.message);
        else setMessage("Unknown error");
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    }
    fetchTrash();
  }, []);

  // Återställ anteckning
  async function handleRestore(id: string) {
    if (!confirm("Restore this note?")) return;

    try {
      const res = await fetch(`/api/id?id=${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: false }),
      });
      if (!res.ok) throw new Error("Could not restore note");

      setNotes(prev => prev.filter(n => n._id !== id));
      setMessage("Note restored successfully!");
      setIsSuccess(true);
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      if (err instanceof Error) setMessage(err.message);
      else setMessage("Unknown error");
      setIsSuccess(false);
    }
  }

  // Radera permanent
  async function handlePermanentDelete(id: string) {
    if (!confirm("Delete permanently? This cannot be undone")) return;

    try {
      const res = await fetch(`/api/id?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Could not delete permanently");

      setNotes(prev => prev.filter(n => n._id !== id));
      setMessage("Note permanently deleted");
      setIsSuccess(true);
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      if (err instanceof Error) setMessage(err.message);
      else setMessage("Unknown error");
      setIsSuccess(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
      {/* Sidebar */}
      <aside className="w-72 backdrop-blur-md bg-black/40 border-r border-purple-900 p-6 flex flex-col gap-6 items-center justify-center shadow-xl">
        <h1 className="text-2xl font-bold text-purple-400 tracking-wide mb-6">HMP</h1>
        <Link href="/notesList"><button className="w-full bg-purple-800/80 hover:bg-purple-700 py-3 px-4 rounded-lg text-center shadow-lg">Notes</button></Link>
        <Link href="/notes"><button className="w-full bg-purple-800/80 hover:bg-purple-700 py-3 px-4 rounded-lg text-center shadow-lg">Create note</button></Link>
        <Link href="/homepage"><button className="w-full bg-purple-800/80 hover:bg-purple-700 py-3 px-4 rounded-lg text-center shadow-lg">Home</button></Link>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-10">
        <h2 className="text-3xl font-bold mb-8 text-purple-300 drop-shadow-lg">Trash</h2>

        {message && (
          <div className={`mb-6 p-3 rounded-lg text-center font-medium shadow-md ${isSuccess ? "bg-green-600/70 text-green-100" : "bg-red-600/70 text-red-100"}`}>
            {message}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400">Loading notes in trash...</p>
        ) : notes.length === 0 ? (
          <p className="text-gray-400">No notes in trash</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <li key={note._id} className="border border-purple-700 rounded-2xl p-5 bg-black/70 shadow-lg flex flex-col">
                <h3 className="font-bold text-lg text-purple-300 mb-2">{note.title}</h3>

                {/* Innehåll med expand/collapse */}
                <div className={`mt-4 p-4 border border-purple-700 rounded-xl bg-black/50 prose prose-invert max-w-none break-words transition-all duration-300 ${expandedNotes[note._id] ? "" : "h-[20vh] overflow-auto"}`}>
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {note.content || "Inget innehåll"}
                  </ReactMarkdown>
                </div>

                <span className="text-xs text-gray-400 mt-2">{new Date(note.createdAt).toLocaleString()}</span>

                {/* Kontrollknappar */}
                <div className="flex gap-3 mt-3 flex-wrap">
                  <button onClick={() => handleRestore(note._id)} className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500 shadow">
                    Restore
                  </button>
                  <button onClick={() => handlePermanentDelete(note._id)} className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500 shadow">
                    Delete permanently
                  </button>
                  <button onClick={() => toggleExpand(note._id)} className="bg-gray-600 px-3 py-1 rounded-lg hover:bg-gray-500 shadow">
                    {expandedNotes[note._id] ? "Collapse" : "Expand"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
