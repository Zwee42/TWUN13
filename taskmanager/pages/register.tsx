
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
          alert("whoops! u missed some fields u lil frog");
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
            setMessage(data.message || data.error);
        }catch (err ) {
            console.error(err);
            setMessage("Failed to register");
        }
        
      };

  

  return (
  
        <div className="flex items-center justify-center h-screen">
            < input 
            type = "text"
            value = {email}
            onChange = {(e) => setEmailValue(e.target.value)}
            placeholder = "email"
            className="border p-2 rounded"
            /> 



            < input 
            type = "text"
            value = {username}
            onChange = {(e) => setUserValue(e.target.value)} // triggers an event
            placeholder = "username"
            className="border p-2 rounded"
            /> 

            < input 
            type = "text"
            value = {password}
            onChange = {(e) => setPasswordValue(e.target.value)}
            placeholder = "password"
            className="border p-2 rounded"
            /> 

             <button onClick= {handleRegister}
          className="px-6 py-3 bg-purple-600 text-white font-semibold shadow-md hover:bg-blue-700"
            >
          Register
        </button>

            <button  onClick = {handleLogin}        
             className="px-6 py-3 bg-purple-600 text-white font-semibold shadow-md hover:bg-blue-700"
            > already have an acc? login </button>


        </div>

  );
}
