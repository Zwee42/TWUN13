
export default function Home() {
  const handleTimerClick = async () => {
    window.location.href = "/timer";
  };

  const handleNote= () => {
    window.location.href ="/notes"
  } 
       const handleLogin = () => {
        window.location.href ="/login"
      } 



  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-purple-950 to-black">
      <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-lg">
        Welcome
      </h1>

      <button
        onClick={handleTimerClick}
        className="mb-4 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition"
      >
        Timer
      </button>



     <button
        onClick={handleNote}
        className="mb-4 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition"
      >
        Notes
      </button>

       <button
        onClick={handleTimerClick}
        className="mb-4 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition"
      >
        collaboration
      </button>

       <button
        onClick={handleLogin}
        className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition"
      >
        Back to login
      </button>



    </div>
  );
}
