

import { useEffect, useState } from "react";
import {motion} from "framer-motion";

"use Client" // säger till Next.js that detta är bara till för de som använder sidan.
            // finns ingenting på servern som görs




export default function Home() {

    // settting = to after the different modes is the default state
    const [activeMode, setActiveMode] = useState("Timer"); // acriveMode sparar den mode jag är i
    const [timeLeft, setTimeLeft] = useState(25 * 60); // har koll på hur många sekunder jag har kvar 
    const [isRunning, setIsRunning] = useState(false); // är timern på eller av?
    const [showSetting, setShowSettings] = useState(false); // tror ej jag kommer använda denna
    const [durations, setDurations] = useState ({
        Timer: 0.2 * 60,
        "short break": 5 * 60,
        "long break": 15 * 60,
    }) // sparar hur långa alla mode är i sekunder


    const modes = ["Timer", "short break", "long break" ] // en lista med de olika modes


    /* runs whenever isRunning changes
    if running --> creates a timer that subtracts 1 from timeLeft every second
    if paused --> clears the interval.
    return makes sure we clean up the interval when the component re-renders */

    useEffect(() => {
        let interval : NodeJS.Timeout;

        if(isRunning) {
                 interval = setInterval(() => {
                        setTimeLeft((prev) => (prev > 0 ? prev -1 : 0));
                    }, 1000)
                     }  else {
                             clearInterval(interval);
                             } 
            return() => clearInterval(interval);
     }, [isRunning]);

        
        /* whenever you switch mode, reset timeLeft to the modes duration
        for example: switching to short break sets the time to 5 * 60 */ 
        useEffect(() => {
            setTimeLeft(durations[activeMode])
        }, [activeMode, durations]);




        /*if the timer hits zero then we wait one second, and then we switch to the next mode
        i might wanna remove this. */ 
        useEffect(() => {

            if(timeLeft === 0) {
                // audioRef.current.play();

                setTimeout(() =>  {
                    switchMode();
                }, 1000)
            }

        }, [timeLeft])


        const switchMode = () => {
            const currentIndex = modes.indexOf(activeMode);
            const nextIndex =( currentIndex + 1 ) % modes.length;
            setActiveMode(modes[nextIndex]);
        }

        const totalTime = durations[activeMode];
        const progress = (timeLeft/ totalTime) * 100;

        const color = () => {
            if (progress > 50) return "#ff6b6b";
            if ( progress > 25) return "oklch(0.7688 0.188 70.08)";

            return "oklch(0.505 0.213 27.518)"
        }

        let seconds : string;

        const formatTime = (seconds) => {
            const minutes = Math.floor( seconds / 60) ;
            const secs = seconds % 60;

            return `${minutes} : ${secs < 10 ? "0" : ""}${secs}`;
        };



    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black text-purple-950">

            <h1 className="mb-6 text-2x1 font-semibold lg:text-4sx1">

                Hello my Productivity Timer

            </h1>

            <div className="flex items-center space-x-4 rounded-full bg-white p-2">

                {modes.map((mode) => (

                    <button
                    /*IFALL den knappen vi är på just nu är samma some MODE så låt den se annerlunda ut */
                        key={mode}
                        onClick = {() => setActiveMode(mode)}
                        className= {`rounded-full px-4 py-2 text-sm font-medium transition lg:text-lg 
                            ${activeMode === mode ?

                            "bg-purple-500 text-black" : "text-blue-400 hover:text-purple-700"}`}
                        >
                            {mode}
                        </button>
                    ))};
                
            

            </div>

            <div className = "relative mt-12 flex items-center justify-center lg:mt-20 lg:scale-125">
                    <svg width= "260" height="260" viewBox="0 0 100 100">
                        <circle 
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="purple"
                        strokeWidth="5"
                        fill="none"

                           />


                        <motion.circle 
                        cx="50"
                        cy="50"
                        r="45"
                        stroke={color()}
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={283}
                        
                        
                        strokeDashoffset={283 * (1 - progress)}
                         strokeLinecap="round"
                         initial = {{strokeDashoffset: 283}}
                         animate = {{strokeDashoffset: 283 - (progress/100) * 283}}
                         transition = {{ ease: "linear", duration: 1}}


                         
                         />
                    </svg>

                    <div className="absolute text-5xl font-bold">{formatTime(timeLeft)}</div>

            </div>

            <button 
            onClick={() => setIsRunning(!isRunning)}
            className= "mt-8 rounded-full bg-purple-600 px-6 py-2 font-semibold text-white lg:mt-20 lg:scale-125">

                {isRunning ? "PAUSE" : "START"}
                    
            </button>

            
                 
        
        </div>



    )
}
