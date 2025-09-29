import { useEffect, useState } from "react";
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
    isDeleted?: boolean;
};

export default function TrashPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    // Hämta traschade anteckningar
    useEffect(() => {
        async function fetchTrash() {
            try {
                setLoading(true);
                const res = await fetch("/api/notes?includeDeleted=true");
                if (!res.ok) throw new Error("Could not retrieve trash folder");
                setIsSuccess(false);
                const data: Note[] = await res.json();
                setNotes(data.filter((n) => n.isDeleted));
            } catch (err: any) {
                setMessage(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchTrash();
    }, []);

    // Återställ anteckning
    async function handleRestore(id: string) {
        const confirmRestore = confirm("Restore this note?");
        if (!confirmRestore) return;

        try {
            const res = await fetch(`/api/id?id=${encodeURIComponent(id)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isDeleted: false }),
            });
            if (!res.ok) throw new Error("Could not restore");
            setIsSuccess(false);
            setNotes((prev) => prev.filter((n) => n._id !== id));
            setMessage("Note restored successfully!");
            setIsSuccess(true);
            setTimeout(() => setMessage(""), 2000);
        } catch (err: any) {
            setMessage(err.message);
        }
    }

    // Radera permanent
    async function handlePermanentDelete(id: string) {
        const confirmDelete = confirm("Delete permanently? This cannot be undone");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`/api/id?id=${encodeURIComponent(id)}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Could not delete permanently");
            setNotes((prev) => prev.filter((n) => n._id !== id));
            setMessage(" Note permanently deleted");
            setTimeout(() => setMessage(""), 2000);
        } catch (err: any) {
            setMessage(err.message);
        }
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
            {/* Sidebar */}
            <aside className="w-72 backdrop-blur-md bg-black/40 border-r border-purple-900 p-6 flex flex-col gap-6 items-center justify-center shadow-xl">
                <h1 className="text-2xl font-bold text-purple-400 tracking-wide mb-6">
                    Notes
                </h1>

                <Link href="/notesList" passHref>
                    <button className="w-full bg-purple-800/80 hover:bg-purple-700 py-3 px-4 rounded-lg text-center transition shadow-lg hover:shadow-purple-900/50">
                        Notes list
                    </button>
                </Link>

                <Link href="/notes" passHref>
                    <button className="w-full bg-purple-800/80 hover:bg-purple-700 py-3 px-4 rounded-lg text-center transition shadow-lg hover:shadow-purple-900/50">
                        New note
                    </button>
                </Link>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-10">
                <h2 className="text-3xl font-bold mb-8 text-purple-300 drop-shadow-lg">
                    Trash
                </h2>

                {message && (
                    <div
                        className={`mb-6 p-3 rounded-lg text-center font-medium shadow-md ${isSuccess ? "bg-green-600/70 text-green-100" : "bg-red-600/70 text-red-100"
                            }`}
                    >
                        {message}
                    </div>
                )}


                {loading ? (
                    <p className="text-gray-400">Laddar anteckningar i skräp...</p>
                ) : notes.length === 0 ? (
                    <p className="text-gray-400">Inga anteckningar i skräp</p>
                ) : (
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notes.map((note) => (
                            <li
                                key={note._id}
                                className="border border-purple-700 rounded-2xl p-5 bg-black/70 shadow-lg flex flex-col"
                            >
                                <h3 className="font-bold text-lg text-purple-300 mb-2">
                                    {note.title}
                                </h3>

                                <div className="mt-4 p-4 border border-purple-700 rounded-xl bg-black/50 prose prose-invert max-w-none break-words flex-1">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                    >
                                        {note.content || "Inget innehåll"}
                                    </ReactMarkdown>
                                </div>

                                <span className="text-xs text-gray-400 mt-2">
                                    {new Date(note.createdAt).toLocaleString()}
                                </span>

                                <div className="flex gap-3 mt-3">
                                    <button
                                        onClick={() => handleRestore(note._id)}
                                        className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500 shadow"
                                    >
                                        Återställ
                                    </button>

                                    <button
                                        onClick={() => handlePermanentDelete(note._id)}
                                        className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500 shadow"
                                    >
                                        Radera permanent
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
