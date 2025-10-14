import { useEffect, useState } from "react";
import Link from "next/link";
import { Note, NoteContent} from "@/components/NoteCompontent";


import { requireAuth } from "@/lib/auth";

import { GetServerSideProps, GetServerSidePropsContext } from "next";

     export const getServerSideProps: GetServerSideProps = async (ctx) => {
            
              return await requireAuth(ctx) || {redirect: { destination: '/login', permanent: false }};
            
            };



export default function NotesListPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Hämta alla anteckningar
  useEffect(() => {
    async function fetchNotes() {
      try {
        const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        const loggedInUser = raw ? JSON.parse(raw) : null;
        if (!loggedInUser?.email) {
          setMessage("User not logged in");
          setLoading(false);
          return;
        }
        
        const res = await fetch(`/api/notes?userId=${loggedInUser.email}`);
        if (!res.ok) throw new Error("Failed to fetch notes");
        const data = await res.json();
        setNotes(data);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
        setMessage("Failed to fetch notes");
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    }
  
    fetchNotes();
  }, []);
  

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

      if (!res.ok) throw new Error("Could not move note to trash");

      setNotes((prev) => prev.filter((note) => note._id !== noteId));
      setMessage("Note moved to trash successfully!");
      setIsSuccess(true);
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage("Unknown error");
      }
      setIsSuccess(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-purple-300">Notes list</h1>
        <Link href="/notes">
          <button className="bg-purple-700 px-4 py-2 rounded-xl hover:bg-purple-600 shadow-md">
            New Note
          </button>
        </Link>
      </div>

      {message && (
        <div
          className={`mb-6 p-3 rounded-lg text-center font-medium shadow-md ${
            isSuccess
              ? "bg-green-600/70 text-green-100"
              : "bg-red-600/70 text-red-100"
          }`}
        >
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-gray-400">No notes yet</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <li
              key={note._id}
              className="border border-purple-700 rounded-2xl p-5 bg-black/70 shadow-lg flex flex-col"
            >

              <NoteContent note={note} handleMoveToTrash={handleMoveToTrash} />

            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
