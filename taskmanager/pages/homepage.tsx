import { requireAuth } from '@/lib/auth';
//import {SessionUser} from '@/models/sessionUser';
//import User, {IUser} from '@/models/User';
import { GetServerSideProps } from "next";
import { SessionUser } from '@/types/SessionUser';


export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await requireAuth(ctx, "/login");
};

export default function Home({ user }: { user: SessionUser }) {
  
  const handleTimerClick = async () => {
    window.location.href = "/timer";
  };

  const handleNote = () => {
    window.location.href = "/notes"
  }
  
  const handleLogout = async () => {

        try {
       await fetch("/api/logout", {

      })
    } catch (err) {


      console.error("error in apu logout", err);
    }

    window.location.href = "/login"

  }


  const handleDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-purple-950 to-black">
      <div className="bg-black/70 p-10 rounded-2xl shadow-2xl w-[28rem] text-center">
        <h1 className="text-4xl font-bold text-purple-400 mb-6 drop-shadow-lg">
          Welcome {user.username}!
        </h1>
  
        <h2 className="text-lg font-medium text-gray-300 mb-8 drop-shadow-md">
          Ctrl + S your energy, we are working smart!
        </h2>
  
        <div className="flex flex-col space-y-4">
          <button
            onClick={handleTimerClick}
            className="w-full py-3 bg-purple-900 text-white font-semibold rounded-lg shadow-md hover:bg-black transition"
          >
            Timer
          </button>
  
          <button
            onClick={handleNote}
            className="w-full py-3 bg-purple-900 text-white font-semibold rounded-lg shadow-md hover:bg-black transition"
          >
            Notes
          </button>
  
          <button
            onClick={handleDashboard}
            className="w-full py-3 bg-purple-900 text-white font-semibold rounded-lg shadow-md hover:bg-black transition"
          >
            Todo Dashboard
          </button>
  
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-black text-purple-400 font-semibold rounded-lg shadow-md hover:bg-purple-900 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );  
  
}
