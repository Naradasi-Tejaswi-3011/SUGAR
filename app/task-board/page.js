"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function TaskBoardPage() {
  const [tasks, setTasks] = useState([]);
  const [inputTask, setInputTask] = useState("");
  const [taskCategory, setTaskCategory] = useState("top-priority");

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("zenova-tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("zenova-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (inputTask.trim() === "") return;
    
    const newTask = {
      id: Date.now().toString(),
      text: inputTask,
      category: taskCategory,
      time: new Date().toLocaleString()
    };
    
    setTasks([...tasks, newTask]);
    setInputTask("");
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const updateTaskCategory = (taskId, newCategory) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, category: newCategory } 
        : task
    ));
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, category) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    updateTaskCategory(taskId, category);
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case "top-priority": return "⚠️";
      case "important": return "⭐";
      case "optional": return "✓";
      case "completed": return "👍";
      default: return "📝";
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case "top-priority": return "bg-red-100";
      case "important": return "bg-yellow-100";
      case "optional": return "bg-blue-100";
      case "completed": return "bg-green-100";
      default: return "bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-blue-500 hover:text-blue-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Kanban Task Board</h1>
          </div>
          <UserButton />
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Task Input Section */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={inputTask}
                onChange={(e) => setInputTask(e.target.value)}
                placeholder="Enter a task"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
              />
              <select
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="top-priority">Top Priority</option>
                <option value="important">Important</option>
                <option value="optional">Optional</option>
              </select>
              <button
                onClick={addTask}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Task
              </button>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Top Priority Column */}
            <div className="kanban-column">
              <div className="bg-red-100 p-4 rounded-t-lg">
                <h2 className="text-lg font-semibold flex items-center">
                  <span className="mr-2">⚠️</span> Top Priority
                </h2>
              </div>
              <div 
                className="bg-white p-4 rounded-b-lg shadow-inner min-h-[300px]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, "top-priority")}
              >
                {tasks
                  .filter(task => task.category === "top-priority")
                  .map(task => (
                    <div 
                      key={task.id}
                      className="task-item bg-white border border-gray-200 p-3 rounded-lg mb-3 shadow"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{task.text}</span>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ❌
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{task.time}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Important Column */}
            <div className="kanban-column">
              <div className="bg-yellow-100 p-4 rounded-t-lg">
                <h2 className="text-lg font-semibold flex items-center">
                  <span className="mr-2">⭐</span> Important
                </h2>
              </div>
              <div 
                className="bg-white p-4 rounded-b-lg shadow-inner min-h-[300px]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, "important")}
              >
                {tasks
                  .filter(task => task.category === "important")
                  .map(task => (
                    <div 
                      key={task.id}
                      className="task-item bg-white border border-gray-200 p-3 rounded-lg mb-3 shadow"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{task.text}</span>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ❌
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{task.time}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Optional Column */}
            <div className="kanban-column">
              <div className="bg-blue-100 p-4 rounded-t-lg">
                <h2 className="text-lg font-semibold flex items-center">
                  <span className="mr-2">✓</span> Optional
                </h2>
              </div>
              <div 
                className="bg-white p-4 rounded-b-lg shadow-inner min-h-[300px]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, "optional")}
              >
                {tasks
                  .filter(task => task.category === "optional")
                  .map(task => (
                    <div 
                      key={task.id}
                      className="task-item bg-white border border-gray-200 p-3 rounded-lg mb-3 shadow"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{task.text}</span>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ❌
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{task.time}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Completed Column */}
            <div className="kanban-column">
              <div className="bg-green-100 p-4 rounded-t-lg">
                <h2 className="text-lg font-semibold flex items-center">
                  <span className="mr-2">👍</span> Completed
                </h2>
              </div>
              <div 
                className="bg-white p-4 rounded-b-lg shadow-inner min-h-[300px]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, "completed")}
              >
                {tasks
                  .filter(task => task.category === "completed")
                  .map(task => (
                    <div 
                      key={task.id}
                      className="task-item bg-white border border-gray-200 p-3 rounded-lg mb-3 shadow"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium line-through text-gray-500">{task.text}</span>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ❌
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{task.time}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 