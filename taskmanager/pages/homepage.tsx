import { requireAuth } from '@/lib/auth';
//import {SessionUser} from '@/models/sessionUser';
//import User, {IUser} from '@/models/User';
import { GetServerSideProps } from "next";
import { SessionUser } from '@/types/SessionUser';


export const getServerSideProps: GetServerSideProps = async (ctx) => {

  return await requireAuth(ctx) || { redirect: { destination: "/login", permanent: false } };

};
 // import cookies



export default function Home({ user }: { user: SessionUser }) {


  console.log(user);

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



  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-purple-950 to-black">
      <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-lg">
        Welcome {user.username}!
      </h1>

      <h1 className="text font-bold text-grey mb-8 drop-shadow-lg">
        Ctrl + S your energy, we are working smart!
      </h1>

      <button
        onClick={handleTimerClick}
        className="mb-4 px-13 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition"
      >
        Timer
      </button>


      <button
        onClick={handleNote}
        className="mb-4 px-13 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition"
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
        onClick={handleLogout}
        className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition"
      >
        Back to login
      </button>



    </div>
  );
}
