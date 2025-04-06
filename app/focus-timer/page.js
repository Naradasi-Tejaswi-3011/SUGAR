"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function FocusTimerPage() {
  const [mode, setMode] = useState("focus"); // focus or break
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);

  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Time's up, change mode
            const newMode = mode === "focus" ? "break" : "focus";
            
            // Play sound
            const audio = new Audio("/bell.mp3");
            audio.play().catch(e => console.log("Audio play error:", e));
            
            // If switching from focus to break
            if (newMode === "break") {
              // Increment cycle counter
              const newCycles = cycles + 1;
              setCycles(newCycles);
              
              // Check if it's time for a long break
              if (newCycles % longBreakInterval === 0) {
                return longBreakDuration * 60;
              } else {
                return breakDuration * 60;
              }
            } else {
              // Switching from break to focus
              return focusDuration * 60;
            }
            
            setMode(newMode);
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isActive && timeLeft !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, cycles, breakDuration, focusDuration, longBreakDuration, longBreakInterval]);

  const startTimer = () => {
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMode("focus");
    setTimeLeft(focusDuration * 60);
    setCycles(0);
  };

  const skipToBreak = () => {
    if (mode === "focus") {
      setMode("break");
      
      // Check if it's time for a long break
      const newCycles = cycles + 1;
      setCycles(newCycles);
      
      if (newCycles % longBreakInterval === 0) {
        setTimeLeft(longBreakDuration * 60);
      } else {
        setTimeLeft(breakDuration * 60);
      }
    } else {
      setMode("focus");
      setTimeLeft(focusDuration * 60);
    }
    
    setIsActive(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalTime = mode === "focus" 
      ? focusDuration * 60 
      : (cycles % longBreakInterval === 0 ? longBreakDuration : breakDuration) * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-blue-500 hover:text-blue-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Focus Timer</h1>
          </div>
          <UserButton />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className={`p-8 ${mode === "focus" ? "bg-blue-500" : "bg-green-500"} text-white`}>
            <h2 className="text-2xl font-bold text-center">
              {mode === "focus" ? "Focus Time" : (cycles % longBreakInterval === 0 ? "Long Break" : "Short Break")}
            </h2>
            <div className="flex justify-center my-6">
              <div className="w-64 h-64 rounded-full border-8 border-white flex items-center justify-center relative">
                <div 
                  className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-transparent"
                  style={{
                    background: `conic-gradient(from 0deg, transparent ${getProgressPercentage()}%, rgba(255,255,255,0.3) ${getProgressPercentage()}%)`,
                    clipPath: "circle(50% at center)"
                  }}
                ></div>
                <span className="text-5xl font-bold z-10">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              {!isActive ? (
                <button 
                  onClick={startTimer}
                  className="bg-white text-blue-500 hover:bg-blue-50 py-2 px-6 rounded-full font-semibold transition-colors"
                >
                  Start
                </button>
              ) : (
                <button 
                  onClick={pauseTimer}
                  className="bg-white text-blue-500 hover:bg-blue-50 py-2 px-6 rounded-full font-semibold transition-colors"
                >
                  Pause
                </button>
              )}
              <button 
                onClick={resetTimer}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 py-2 px-6 rounded-full font-semibold transition-colors"
              >
                Reset
              </button>
              <button 
                onClick={skipToBreak}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 py-2 px-6 rounded-full font-semibold transition-colors"
              >
                Skip
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <p className="text-lg font-medium text-gray-800">Cycles Completed: {cycles}</p>
              <div className="flex mt-2">
                {Array.from({ length: longBreakInterval }).map((_, index) => (
                  <div 
                    key={index} 
                    className={`w-6 h-6 rounded-full mr-2 ${index < (cycles % longBreakInterval) ? 'bg-blue-500' : 'bg-gray-200'}`}
                  ></div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Focus Duration (mins)
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={focusDuration}
                  onChange={(e) => {
                    setFocusDuration(parseInt(e.target.value) || 25);
                    if (mode === "focus") setTimeLeft(parseInt(e.target.value) * 60 || 25 * 60);
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Break (mins)
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={breakDuration}
                  onChange={(e) => {
                    setBreakDuration(parseInt(e.target.value) || 5);
                    if (mode === "break" && cycles % longBreakInterval !== 0) 
                      setTimeLeft(parseInt(e.target.value) * 60 || 5 * 60);
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Long Break (mins)
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={longBreakDuration}
                  onChange={(e) => {
                    setLongBreakDuration(parseInt(e.target.value) || 15);
                    if (mode === "break" && cycles % longBreakInterval === 0) 
                      setTimeLeft(parseInt(e.target.value) * 60 || 15 * 60);
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Long Break After (cycles)
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={longBreakInterval}
                  onChange={(e) => setLongBreakInterval(parseInt(e.target.value) || 4)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-xl shadow-md max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4">The Pomodoro Technique</h3>
          <ol className="space-y-2 list-decimal list-inside text-gray-700">
            <li>Choose a task you want to accomplish</li>
            <li>Set the timer for 25 minutes (a "Pomodoro")</li>
            <li>Work on the task until the timer rings</li>
            <li>Take a short break (5 minutes)</li>
            <li>After 4 Pomodoros, take a longer break (15-30 minutes)</li>
          </ol>
          <p className="mt-4 text-gray-600">
            This technique helps maintain focus and avoid burnout by alternating between
            concentrated work and brief rest periods.
          </p>
        </div>
      </main>
    </div>
  );
} 