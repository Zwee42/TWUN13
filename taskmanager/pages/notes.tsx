import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

type Note = {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSearch() {
    const res = await fetch("/api/notes");
    const data = await res.json();
    setNotes(data);
    setShowNotes(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, userId: "testuser" }),
    });

    if (res.ok) {
      setMessage("✅ Note saved!");
      setTitle("");
      setContent("");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("❌ Could not save note, title needed");
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
      {/* Sidebar */}
      <aside className="w-72 backdrop-blur-md bg-black/40 border-r border-purple-900 p-6 flex flex-col gap-6 items-center justify-center shadow-xl">
        <h1 className="text-2xl font-bold text-purple-400 tracking-wide mb-6">
          Notes list
        </h1>

        <button
          onClick={handleSearch}
          className="w-full bg-purple-800/80 hover:bg-purple-700 py-3 px-4 rounded-lg text-center transition shadow-lg hover:shadow-purple-900/50"
        >
          Notes list
        </button>
        <button className="w-full bg-purple-800/80 hover:bg-purple-700 py-3 px-4 rounded-lg text-center transition shadow-lg hover:shadow-purple-900/50">
          Settings
        </button>
        <button className="w-full bg-purple-900/80 hover:bg-purple-950 py-3 px-4 rounded-lg text-center transition shadow-lg hover:shadow-purple-900/50">
          Skräp
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-10">
        <h2 className="text-3xl font-bold mb-8 text-purple-300 drop-shadow-lg">
          New Notes
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
          <textarea
            className="border border-purple-700 bg-black/80 p-3 rounded-lg h-32 resize-none focus:ring-2 focus:ring-purple-600 outline-none text-white"
            placeholder="Write your note here (supports **Markdown** and $\\LaTeX$)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            type="submit"
            className="bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 shadow-md hover:shadow-purple-800 transition-all"
          >
            Spara
          </button>
        </form>

        {/* Meddelande */}
        {message && (
          <div
            className={`mb-6 p-3 rounded-lg text-center font-medium shadow-md ${
              message.startsWith("✅")
                ? "bg-green-600/70 text-green-100"
                : "bg-red-600/70 text-red-100"
            }`}
          >
            {message}
          </div>
        )}

        {/* Lista notes */}
        {showNotes && (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <li
                key={note._id}
                className="border border-purple-700 rounded-2xl p-5 bg-black/70 shadow-lg hover:shadow-purple-900/40 transition-all"
              >
                <h3 className="font-bold text-lg text-purple-300 mb-2">
                  {note.title}
                </h3>
                <div className="prose prose-invert max-w-none text-gray-200">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {note.content}
                  </ReactMarkdown>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(note.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
