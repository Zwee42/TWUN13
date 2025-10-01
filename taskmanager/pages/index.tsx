import { useEffect } from 'react';
import toast from 'react-hot-toast';


export default function Home() {

  const funnyMessages = [
    "🎉 Your productivity is so high, even your coffee is jealous!",
    "💡 Did you know? Procrastination is just your brain's way of saying 'let's think about this more'",
    "🚀 You're crushing it! Even the keyboard is impressed by your typing skills!",
    "🎭 Plot twist: Your to-do list is actually a bestselling novel waiting to happen",
    "🧠 Your brain just leveled up! +10 productivity points!",
    "⚡ Warning: You're working so efficiently, you might break the space-time continuum",
    "🎪 Step right up! Witness the amazing productivity circus starring... YOU!",
    "🦾 Your focus is so sharp, it could cut through Monday blues like butter",
    "🎯 Bullseye! You're hitting your goals like a productivity ninja!",
    "🌟 Breaking news: Local human achieves legendary status in task completion!",
    "🎮 Achievement unlocked: Master of Getting Things Done!",
    "🦄 You're so productive, unicorns are taking notes on your workflow",
    "🔥 Your productivity is fire! The smoke detector is getting nervous",
    "🏆 And the award for 'Most Likely to Conquer the World Through Organization' goes to...",
    "🎨 Your task management skills are so beautiful, they belong in a museum!"
  ];

  useEffect(() => {
    const showRandomToast = () => {
      const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
      toast(randomMessage, {
        icon: '🎉',
        duration: 15000,
      });
    };

    // Show first toast after 1 minute
    const initialTimer = setTimeout(showRandomToast, 6000);
    
    // Then show toast every minute
    const interval = setInterval(showRandomToast, 6000);

    // Cleanup function
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

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
