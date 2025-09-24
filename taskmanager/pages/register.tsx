
import { set } from "mongoose";
import { useState } from "react";

export default function Home() {
      const [email, setEmailValue] = useState(""); 
      const [username, setUserValue] = useState(""); 
    const [message, setMessage] = useState("");
      const [password, setPasswordValue] = useState(""); 

 
      const handleLogin = () => {
        window.location.href ="/login"
      }

      const handleRegister = async () => {
          if (!email || !username || !password) {
          alert("whoops! u missed some fields ");
             return; 
  }
        // console.log("teststetstes sksjsj");
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, username, password}),
            });

            const data = await res.json();

            if (!res.ok) {
              alert(data.message || "something went wrong");
              return;
            }

            
            alert("succefull register!");
            console.log("Register attempt:", { email, username, password });

            //window.location.href = "/login";

        }catch (err ) {
            console.error(err);
            setMessage("Failed to register");
        }
        
      };

  

  return (

    // full screen with centered content and dark gradient background

    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-purple-950 to black">

      
      <div className="bg-black p-8 rounded-2x1 shadow-2xl w-96"> 
        
        <h1 className = "text-2xl fony-bold text-center text-purple-400 mb-6">Register</h1>
      
        <input 
          type="text"
          value={email}
          onChange={(e) => setEmailValue(e.target.value)}
          placeholder="Email"
          className="w-full mb-4 p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

        <input 
          type="text"
          value={username}
          onChange={(e) => setUserValue(e.target.value)}
          placeholder="Username"
          className="w-full mb-4 p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />


        <input
          type="password"
          value={password}
          onChange={(e) => setPasswordValue(e.target.value)}
          placeholder="Password"
          className="w-full mb-6 p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          /> 


        <button 
          onClick={handleRegister}
          className="w-full mb-3 py-3 bg-purple-900 text-white font-semibold rounded-lg shadow-md hover:bg-black transition"
          >Register</button>


        <button 
          onClick={handleLogin}
          className="w-full py-3 bg-purple-950 text-white font-semibold rounded-lg shadow-md hover:bg-black transition"
          >Already have an account? Login</button>





      </div>
            

    </div>
  
        // <div className="flex items-center justify-center h-screen">
        //     < input 
        //     type = "text"
        //     value = {email}
        //     onChange = {(e) => setEmailValue(e.target.value)}
        //     placeholder = "email"
        //     className="border p-2 rounded"
        //     /> 

        //     < input 
        //     type = "text"
        //     value = {username}
        //     onChange = {(e) => setUserValue(e.target.value)} // triggers an event
        //     placeholder = "username"
        //     className="border items-center justify-center p-2 rounded"
        //     /> 

        //     < input 
        //     type = "text"
        //     value = {password}
        //     onChange = {(e) => setPasswordValue(e.target.value)}
        //     placeholder = "password"
        //     className="border p-2 rounded"
        //     /> 

        //      <button onClick= {handleRegister}
        //   className="px-6 py-3 bg-purple-600 text-white font-semibold shadow-md hover:bg-blue-700"
        //     >
        //   Register
        // </button>

        //     <button  onClick = {handleLogin}        
        //      className="px-6 py-3 bg-purple-600 text-white font-semibold shadow-md hover:bg-blue-700"
        //     > already have an acc? login </button>


        // </div>

  );
}
