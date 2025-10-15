import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useNoteSocket } from "../hooks/useNoteSocket";
import toast from "react-hot-toast";

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
    const [shareEmail, setShareEmail] = useState("");

    // Get user info for socket
    const [loggedInUser, setLoggedInUser] = useState<{ email: string; username?: string } | null>(null);

    // Get user from localStorage, will change to cookies later
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

    // Socket integration for real-time collaboration
    const noteId = Array.isArray(id) ? id[0] : id;
    const userId = loggedInUser?.email || '';
    const username = loggedInUser?.username || loggedInUser?.email?.split('@')[0] || 'Anonymous';

    // Handle incoming content changes from other users
    const handleIncomingContentChange = useCallback((data: any) => {
        if (data.field === 'title') {
            setTitle(data.value);
        } else if (data.field === 'content') {
            setContent(data.value);
        }
    }, []);

    const { isConnected, emitContentChange } = useNoteSocket(noteId || null, userId, username, handleIncomingContentChange);

    // Auto-save functionality
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const autoSave = useCallback(async () => {
        if (!noteId || !title.trim()) return;

        setIsSaving(true);
        try {
            const res = await fetch(`/api/id?id=${noteId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content }),
            });

            if (res.ok) {
                setLastSaved(new Date());
            }
        } catch (error) {
            // Auto-save failed silently
        } finally {
            setIsSaving(false);
        }
    }, [noteId, title, content]);

    // Auto-save on content change with debounce
    useEffect(() => {
        if (!noteId) return;

        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout for auto-save (2 seconds after last change)
        saveTimeoutRef.current = setTimeout(() => {
            autoSave();
        }, 2000);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [title, content, autoSave]);

    // Handlers for title and content changes with real-time sync
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (noteId && isConnected) {
            emitContentChange('title', newTitle);
        }
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);
        if (noteId && isConnected) {
            emitContentChange('content', newContent);
        }
    };

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
            } catch (err) {
                if (err instanceof Error) {
                  setMessage(err.message);
                } else {
                  setMessage("Unknown error");
                }
                setIsSuccess(false);
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
        } catch (err) {
            if (err instanceof Error) {
              setMessage(err.message);
            } else {
              setMessage("Unknown error");
            }
            setIsSuccess(false);
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
        }catch (err) {
            if (err instanceof Error) {
              setMessage(err.message);
            } else {
              setMessage("Unknown error");
            }
            setIsSuccess(false);
          }
    }

    async function handleShare() {
        if (!id || Array.isArray(id)) return;
        if (!shareEmail) {
            setMessage("Please enter an email to share with");
            return;
        }

        try {
            const res = await fetch("/api/share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ noteId: id, email: shareEmail }),
            });

            if (!res.ok) throw new Error("Could not share the note");
            setIsSuccess(false);
            setMessage(`Note shared with ${shareEmail}`);
            setIsSuccess(true);
            setShareEmail("");
        } catch (err) {
            if (err instanceof Error) {
              setMessage(err.message);
            } else {
              setMessage("Unknown error");
            }
            setIsSuccess(false);
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

                <Link href="/trash" passHref>
                    <button className="w-full bg-purple-800/80 hover:bg-purple-700 py-3 px-4 rounded-lg shadow-lg">
                        Trash
                    </button>
                </Link>
            </aside>

            {/* Main */}
            <main className="flex-1 p-10">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-purple-300 drop-shadow-lg">
                        Edit Note
                    </h2>
                    <div className="flex items-center gap-4 text-sm">
                        <div className={`flex items-center gap-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            Sync {isConnected ? 'Enabled' : 'Offline'}
                        </div>
                        {isSaving && (
                            <div className="text-blue-400 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                                Saving...
                            </div>
                        )}
                        {lastSaved && !isSaving && (
                            <div className="text-gray-400">
                                Saved {lastSaved.toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 mb-10 bg-black/60 border border-purple-900 p-6 rounded-2xl shadow-xl backdrop-blur-md"
                >
                    {/* {isConnected && (
                        <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg">
                            <div className="flex items-center gap-2 text-green-300">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm">
                                    Live collaboration enabled - changes will sync in real-time
                                </span>
                            </div>
                        </div>
                    )} */}

                    <input
                        className="border border-purple-700 bg-black/80 p-3 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white"
                        placeholder="Titel"
                        value={title}
                        onChange={handleTitleChange}
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
                        onChange={handleContentChange}
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

                {/* Delning */}
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