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
    updatedAt: string;
};

export default function EditNotePage() {
    const router = useRouter();
    const { id } = router.query;

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    // Hämta anteckningen
    useEffect(() => {
        if (!id || Array.isArray(id)) return;

        const fetchNote = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/id?id=${id}`);
                if (!res.ok) throw new Error("Could not retrieve the note");
                setIsSuccess(false);
                const data: Note = await res.json();
                setTitle(data.title || "");
                setContent(data.content || "");
            } catch (err: any) {
                setMessage(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNote();
    }, [id]);

    // Uppdatera anteckningen
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!id || Array.isArray(id)) return;

        try {
            const res = await fetch(`/api/id?id=${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content }),
            });

            if (!res.ok) throw new Error("Could not update the note");
            setIsSuccess(false);
            setMessage("Note updated successfully!");
            setIsSuccess(true);
            setTimeout(() => router.push("/notesList"), 1500);
        } catch (err: any) {
            setMessage(err.message);
        }
    }

    // Flytta till skräp
    async function handleMoveToTrash() {
        if (!id || Array.isArray(id)) return;
        const confirmMove = confirm("Move this note to Trash?");
        if (!confirmMove) return;

        try {
            const res = await fetch(`/api/id?id=${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isDeleted: true }),
            });

            if (!res.ok) throw new Error("Couldn't move to trash");
            setIsSuccess(false);
            setMessage("Moved successfully!");
            setIsSuccess(true);
            setTimeout(() => router.push("/notesList"), 1500);
        } catch (err: any) {
            setMessage(err.message);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
                <aside className="w-72 backdrop-blur-md bg-black/40 border-r border-purple-900 p-6 flex flex-col gap-6 items-center justify-center shadow-xl">
                    <h1 className="text-2xl font-bold text-purple-400 tracking-wide mb-6">
                        Notes
                    </h1>
                    <Link href="/notesList" passHref>
                        <button className="w-full bg-purple-800/80 hover:bg-purple-700 py-3 px-4 rounded-lg shadow-lg">
                            Notes list
                        </button>
                    </Link>
                    <button className="w-full bg-purple-800/80 hover:bg-purple-700 py-3 px-4 rounded-lg shadow-lg">
                        Settings
                    </button>
                    <button className="w-full bg-purple-900/80 hover:bg-purple-950 py-3 px-4 rounded-lg shadow-lg">
                        trash
                    </button>
                </aside>
                <main className="flex-1 p-10 flex items-center justify-center">
                    <p className="text-gray-400 text-xl">Laddar anteckning...</p>
                </main>
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
                    <button className="w-full bg-purple-800/80 hover:bg-purple-700 py-3 px-4 rounded-lg shadow-lg">
                        Notes list
                    </button>
                </Link>

                <button className="w-full bg-purple-800/80 hover:bg-purple-700 py-3 px-4 rounded-lg shadow-lg">
                    Settings
                </button>
                <button className="w-full bg-purple-900/80 hover:bg-purple-950 py-3 px-4 rounded-lg shadow-lg">
                    trash
                </button>
            </aside>

            {/* Main */}
            <main className="flex-1 p-10">
                <h2 className="text-3xl font-bold mb-8 text-purple-300 drop-shadow-lg">
                    Edit Note
                </h2>

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

                    {/* Preview */}
                    <div className="mt-2 p-4 border border-purple-700 rounded-xl bg-black/50 shadow-inner prose prose-invert max-w-none break-words">
                        <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                        >
                            {content || "Förhandsgranskning visas här..."}
                        </ReactMarkdown>
                    </div>

                    <textarea
                        className="border border-purple-700 bg-black/80 p-3 rounded-lg resize-none focus:ring-2 focus:ring-purple-600 outline-none text-white mt-2 min-h-[100px]"
                        placeholder="Skriv din anteckning här..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 shadow-md hover:shadow-purple-800 transition-all"
                        >
                            Save changes
                        </button>

                        <button
                            type="button"
                            onClick={handleMoveToTrash}
                            className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-500 shadow-md transition-all"
                        >
                            Move to trash
                        </button>
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
