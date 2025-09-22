



export default function Home() {

  const handleSignUp = () => {
    window.location.href = "/register"; // väntar på att bli called
};


  const handleSignIn = () => {
    window.location.href = "/login";
  }



  return (

    


<main className="relative w-full h-screen overflow-hidden">


  <div className="absolute inset-0" 
        style={{
            backgroundColor: "#2E1A47",
            clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 100%)' }}></div>

  <div className="absolute inset-0 bg-black" style={{ clipPath: 'polygon(0 60%, 100% 0, 100% 100%, 0 100%)' }}></div>

  <div className="relative z-10 flex flex-col items-center justify-center h-full">
    <h5 className="text-4xl text-white mb-6">Hello My Productivity</h5>
    <button
     onClick ={handleSignIn}
    className="px-6 py-3 bg-purple-600 text-white font-semibold shadow-md hover:bg-blue-700">
      Login
    </button>

    < button 
      onClick={handleSignUp}
    className="px-6 py-3 bg-purple-600 text-white font-semibold shadow-md hover:bg-blue-700">
     register </button>
  </div>

</main>



  );
}
