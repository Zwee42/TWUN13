import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from "next/link";


export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('The passwords do not match');
      setIsSuccess(false);
      return;
    }

    const res = await fetch('/api/resetPassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    if (res.ok) {
      setMessage('Your password has been reset');
      setIsSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } else {
      setMessage(`'Something went wrong'}`);
      setIsSuccess(false);
    }
  };

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
      <main className="flex-1 flex flex-col items-center justify-center p-10">
        <h2 className="text-3xl font-bold mb-8 text-purple-300 drop-shadow-lg">
          Reset Password
        </h2>

        <form
          onSubmit={handleReset}
          className="flex flex-col gap-6 bg-black/60 border border-purple-900 p-8 rounded-2xl shadow-xl backdrop-blur-md w-[380px]"
        >
          <div>
            <label
              htmlFor="password"
              className="block text-lg text-purple-300 mb-2"
            >
              New Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-purple-700 bg-black/80 p-3 rounded-lg w-full text-white focus:ring-2 focus:ring-purple-600 outline-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-lg text-purple-300 mb-2"
            >
              Confirm Password:
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border border-purple-700 bg-black/80 p-3 rounded-lg w-full text-white focus:ring-2 focus:ring-purple-600 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 shadow-md transition-all"
          >
            Reset Password
          </button>

          <Link
            href="/"
            className="text-center text-purple-400 hover:underline mt-2"
          >
            ← Back to Startpage
          </Link>

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
        </form>
      </main>
    </div>
  );
}