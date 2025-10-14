import { useState } from "react";

export default function Home() {
  // spara input values !!!!
  const [email, setEmailValue] = useState("");
  const [password, setPassword] = useState("");


  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });


      const data = await res.json();
      console.log("Response from backed", data);

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("login succeflul");
        window.location.href = "/homepage"
      } else {
        alert(data.message || "login failed ")
      }


    } catch (err) {
      console.error("error conncetiong to backend", err);
      alert("something went wrong");
    }


  };
  // redirect to signup
  const handleSignUp = () => {
    window.location.href = "/register";
  };

  const handleForgotPassword = async () => {
    const email = prompt("Enter your email address:");
    if (!email) return;

    const res = await fetch('/api/forgotPassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Password reset link has been sent to your email.");
    } else {
      alert("Error: " + data.error);
    }
  };


  return (

    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from black via-purple-950 to black">


      <div className="bg-black p-8 rounded-2x1 shadow-2x1 w-96">


        <h1 className="text-2xl fony-bold text-center text-purple-400 mb-6">Login</h1>

        <input
          type="text"
          placeholder="email"
          value={email}
          onChange={(e) => setEmailValue(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg bg-gray-800 text-white placeholder-gray focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={password}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-purple-600"
        />

        <button
          onClick={handleLogin}
          className="w-full mb-3 py-3 bg-purple-900 text-white font-semibold rounded-lg shadow-md hover:bg-black transition"
        >
          Login
        </button>

        <button
          onClick={handleSignUp}
          className="w-full py-3 bg-purple-900 text-white font-semibold rounded-lg shadow-md hover:bg-black transition"
        >
          Don’t have an account? Register
        </button>
        
        <div className="mt-6 text-center text-gray-400">
          <label className="text-lg">Forgot your password?</label>
          <button
            onClick={handleForgotPassword}
            className="text-lg text-[#00bfff] hover:underline"
          >
            Reset it!
          </button>
        </div>
      </div>
    </div>
  );
}
