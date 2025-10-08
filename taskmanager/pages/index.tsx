export default function Home() {

  const handleSignUp = () => {
    window.location.href = "/register";
  };

  const handleSignIn = () => {
    window.location.href = "/login";
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-black to-black">

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <h5 className="text-4xl text-white font-bold mb-8 drop-shadow-lg">
          HMP
        </h5>

        <button
          onClick={handleSignIn}
          className="w-40 mb-4 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition"
        >
          Login
        </button>

        <button
          onClick={handleSignUp}
          className="w-40 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition"
        >
          Register
        </button>
      </div>
    </main>
  );
}
