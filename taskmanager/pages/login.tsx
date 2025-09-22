import { useState } from "react";

export default function Home() {
  // spara input values !!!!
  const [email, setEmailValue] = useState("");
  const [password, setPassword] = useState("");

  
  const handleLogin = async () => {
    if (!email || !password) {
      alert("ehm, please fill in all fields........");
      return;
    }
    
    try {

      const res = await fetch("/api/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password}),
      });


        const data = await res.json();
        console.log("Response from backedn", data);

        if (res.ok) {
          alert ("login succeflul, woo ");
        } else {
          alert("login failed ")
        }


    } catch (err) {
      console.error("error conncetiong to backend", err);
      alert ("something went wrong :3");
    }


  };

  // redirect to signup
  const handleSignUp = () => {
    window.location.href = "/register";
  };



  

  return (
    <main className="relative w-full h-screen overflow-hidden">
      
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#2E1A47",
          clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 100%)",
        }}
      ></div>
      <div
        className="absolute inset-0 bg-black"
        style={{ clipPath: "polygon(0 60%, 100% 0, 100% 100%, 0 100%)" }}
      ></div>

      {/* content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-4">
        <h5 className="text-4xl text-white mb-6">login</h5>

        {/* username input */}
        <input
          type="text"
          placeholder="email"
          value={email}
          onChange={(e) => setEmailValue(e.target.value)}
          className="px-4 py-2 rounded-md border border-gray-400 focus:outline-none"
        />

        {/* password input */}
        <input
          value={password}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 rounded-md border border-gray-400 focus:outline-none"
        />

        {/* login button */}
        <button
          onClick={handleLogin}
          className="px-6 py-3 bg-purple-600 text-white font-semibold shadow-md hover:bg-blue-700"
        >
          Login
        </button>

        {/* sign up redirect */}
        <button
          onClick={handleSignUp}
          className="px-6 py-3 bg-purple-600 text-white font-semibold shadow-md hover:bg-blue-700"
        >
          Don’t have an account? — Register
        </button>
      </div>
    </main>
  );
}
