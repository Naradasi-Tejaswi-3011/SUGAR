"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardPage() {
  const { isLoaded, user } = useUser();
  
  const features = [
    {
      title: "Study Room",
      description: "Focused study environment with PDF reader, timers, and break reminders",
      icon: "📚",
      link: "/study-room",
      color: "bg-pink-100 hover:bg-pink-200"
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 flex justify-between items-center">
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

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Continue your learning journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Link 
                key={index} 
                href={feature.link} 
                className={`p-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 ${feature.color} h-full flex flex-col`}
              >
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-3">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="bg-white p-6 rounded-xl shadow-md max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-full mr-4">📚</div>
                <div>
                  <p className="font-medium">You completed a 25-minute study session</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="bg-green-100 p-2 rounded-full mr-4">✅</div>
                <div>
                  <p className="font-medium">You completed 3 tasks on your task board</p>
                  <p className="text-sm text-gray-500">Yesterday</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
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
    </div>
  );
} 