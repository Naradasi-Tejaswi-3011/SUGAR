"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import PageWrapper from "@/components/PageWrapper";
import { useEffect } from "react";

export default function DashboardPage() {
  const { isLoaded, user } = useUser();
  
  const features = [
    {
      title: "Study Room",
      description: "Focused study environment with PDF reader, timers, and break reminders",
      icon: "📚",
      link: "/study-room",
      color: "bg-violet-100 hover:bg-violet-200"
    },
    {
      title: "Task Board",
      description: "Kanban-style task management to organize your study objectives",
      icon: "📝",
      link: "/task-board",
      color: "bg-blue-100 hover:bg-blue-200"
    },
    {
      title: "Study Analytics",
      description: "Track your study habits and progress over time",
      icon: "📊",
      link: "/analytics",
      color: "bg-purple-100 hover:bg-purple-200"
    }
  ];

  return (
    <PageWrapper>
      {/* Floating Sugar Cubes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[1, 2, 3, 4].map((index) => (
          <div 
            key={`cube-${index}`}
            className={`absolute opacity-30 floating-cube-${index}`}
            style={{
              left: `${15 * index}%`,
              top: `${10 * (index % 3) + 15}%`,
              transform: `rotate(${(index * 5) - 5}deg)`
            }}
          >
            <img 
              src="/logo.png" 
              alt="Floating sugar cube" 
              className="w-8 h-8 md:w-10 md:h-10 opacity-30 sugar-logo"
            />
          </div>
        ))}
      </div>
      
      <header className="bg-white shadow-sm rounded-lg relative z-10">
        <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
            SUGAR Dashboard
          </Link>
          <div className="flex items-center space-x-4">
            {isLoaded && user && (
              <p className="text-gray-600">Welcome, {user.firstName || user.username || 'Student'}</p>
            )}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative z-10">
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Continue your learning journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Link 
                key={index} 
                href={feature.link} 
                className={`p-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 ${feature.color} h-full flex flex-col group`}
              >
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-3 group-hover:animate-pulse transition-all duration-300">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="bg-white p-6 rounded-xl shadow-md max-w-5xl mx-auto relative overflow-hidden">
            {/* Small floating bubbles in the Activity section */}
            <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
              {[1, 2, 3, 4, 5].map((index) => (
                <div 
                  key={index}
                  className={`absolute rounded-full bubble-${index} ${
                    index % 2 === 0 ? 'bg-pink-200' : 'bg-purple-200'
                  }`}
                  style={{
                    width: `${(index % 3) * 6 + 6}px`,
                    height: `${(index % 3) * 6 + 6}px`,
                    left: `${(index * 15) % 100}%`,
                    top: `${(index * 20) % 100}%`
                  }}
                />
              ))}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow duration-300">
                <div className="bg-blue-100 p-2 rounded-full mr-4">📚</div>
                <div>
                  <p className="font-medium">You completed a 25-minute study session</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow duration-300">
                <div className="bg-green-100 p-2 rounded-full mr-4">✅</div>
                <div>
                  <p className="font-medium">You completed 3 tasks on your task board</p>
                  <p className="text-sm text-gray-500">Yesterday</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow duration-300">
                <div className="bg-purple-100 p-2 rounded-full mr-4">🏆</div>
                <div>
                  <p className="font-medium">You achieved a 3-day study streak!</p>
                  <p className="text-sm text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Add CSS for sugar animations */}
      <style jsx global>{`
        @keyframes floatCube {
          0% { 
            transform: translateY(0) rotate(0deg); 
          }
          25% {
            transform: translateY(-10px) rotate(2deg);
          }
          50% { 
            transform: translateY(-20px) rotate(5deg); 
          }
          75% {
            transform: translateY(-10px) rotate(-2deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }
        
        @keyframes float {
          0% { 
            transform: translateY(0) scale(1); 
            opacity: 0.4;
          }
          50% { 
            transform: translateY(-10px) scale(1.05); 
            opacity: 0.6;
          }
          100% { 
            transform: translateY(0) scale(1); 
            opacity: 0.4;
          }
        }
        
        /* Fixed positions for floating cubes */
        .floating-cube-1 {
          animation: floatCube 15s ease-in-out infinite;
          animation-delay: 0s;
        }
        .floating-cube-2 {
          animation: floatCube 18s ease-in-out infinite;
          animation-delay: 1s;
        }
        .floating-cube-3 {
          animation: floatCube 20s ease-in-out infinite;
          animation-delay: 2s;
        }
        .floating-cube-4 {
          animation: floatCube 22s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        
        /* Fixed positions for bubbles */
        .bubble-1 {
          animation: float 5s linear infinite;
          animation-delay: 0.2s;
        }
        .bubble-2 {
          animation: float 7s linear infinite;
          animation-delay: 1s;
        }
        .bubble-3 {
          animation: float 9s linear infinite;
          animation-delay: 0.5s;
        }
        .bubble-4 {
          animation: float 8s linear infinite;
          animation-delay: 1.5s;
        }
        .bubble-5 {
          animation: float 10s linear infinite;
          animation-delay: 2s;
        }
        
        /* Remove white background from logo - comprehensive approach */
        .sugar-logo {
          mix-blend-mode: multiply;
          filter: brightness(1.1) contrast(1.2) saturate(1.1);
          background-color: transparent !important;
          box-shadow: none !important;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          position: relative;
          -webkit-background-clip: content-box;
          background-clip: content-box;
          isolation: isolate;
        }
      `}</style>
    </PageWrapper>
  );
} 