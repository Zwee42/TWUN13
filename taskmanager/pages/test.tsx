import { set } from "mongoose";
import { useEffect, useState } from "react";


function pausecomp(millis: number) {
    var date: Date = new Date();
    var curDate: Date = new Date();
    do { curDate = new Date(); }
    while(curDate.getTime() - date.getTime() < millis);
}

export default function Home() {

  const [count, setCount] = useState(0);
    const [double, setDouble] = useState(0);
  
    useEffect(() => {
        const interval = setInterval(() => {
            setCount((prevCount) => prevCount + 1);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setDouble(count * 2);
    }, [count]);

    console.log("Render", count, double);
        

  return (
    <main className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-black to-black">

 
    </main>
  );
}
