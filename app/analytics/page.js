"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function AnalyticsPage() {
  // Sample data - in a real app, this would come from a database or API
  const [weeklyData, setWeeklyData] = useState([
    { day: "Monday", score: 15 },
    { day: "Tuesday", score: 20 },
    { day: "Wednesday", score: 45 },
    { day: "Thursday", score: 52 },
    { day: "Friday", score: 68 },
    { day: "Saturday", score: 69 },
    { day: "Sunday", score: 65 },
  ]);

  const [monthlyData, setMonthlyData] = useState([
    { category: "Study", hours: 35, color: "bg-blue-500" },
    { category: "Uninterupted", hours: 20, color: "bg-yellow-500" },
    { category: "Goal-oriented", hours: 15, color: "bg-green-500" },
    { category: "Attention", hours: 10, color: "bg-purple-500" },
    { category: "Reward", hours: 5, color: "bg-pink-500" },
  ]);

  // Calculate total hours for pie chart percentages
  const totalHours = monthlyData.reduce((sum, item) => sum + item.hours, 0);
  
  // Client-side only rendering for the graphs to avoid hydration issues
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Pre-generate fixed values for sprinkle decorations to avoid hydration issues
  const sprinkleScales = [1.1, 0.9, 1.2, 0.8, 1.0, 0.95, 1.15, 0.85, 1.05, 0.75, 1.25, 0.8];
  const sprinkleTranslateY = [1.5, 2.0, 0.5, 1.0, 2.5, 1.8, 0.7, 2.2, 1.3, 0.9, 1.7, 2.3];
  const sprinkleColors = ['#FF80B0', '#FFB0D0', '#FF99CC', '#FFD1DC'];

  // Helper function to generate the sugar cube stack
  const renderSugarCubes = (score) => {
    // Each cube represents exactly 10 points
    const numCubes = Math.floor(score / 10);
    const cubes = [];
    
    for (let i = 0; i < numCubes; i++) {
      // Use fixed index positions for the sparkles
      const showSparkle = [2, 5, 7].includes(i % 10);
      const sparklePosition = { top: `${(i * 10) % 100}%`, left: `${(i * 17) % 100}%` };
      
      cubes.push(
        <div 
          key={i} 
          className="w-full aspect-square bg-gradient-to-br from-[#fffaf0] to-[#f8f0e3] relative mb-[1px] group-hover:from-[#fff5e0] group-hover:to-[#f9e8cb] transition-colors"
          style={{
            boxShadow: "inset -1px -1px 2px rgba(0,0,0,0.1), inset 1px 1px 2px rgba(255,255,255,0.8)"
          }}
        >
          {/* Sugar cube highlights */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white via-transparent to-transparent opacity-60"></div>
          
          {/* Sugar cube texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#e6d1b1_1px,transparent_1px)] bg-[size:3px_3px] opacity-15"></div>
          
          {/* Sugar crystal sparkles - only shown on some cubes with fixed positions */}
          {showSparkle && (
            <div className="absolute w-[3px] h-[3px] bg-white rounded-full animate-pulse" 
                 style={{ 
                   ...sparklePosition,
                   opacity: 0.8,
                   animationDuration: `${1 + ((i % 4) / 2)}s`
                 }}>
            </div>
          )}
        </div>
      );
    }
    
    return cubes;
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Decorative cotton candy clouds in background */}
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-gradient-to-br from-pink-100/30 to-pink-200/20 blur-3xl"></div>
      <div className="absolute top-1/4 -right-24 w-64 h-64 rounded-full bg-gradient-to-br from-purple-100/20 to-blue-100/10 blur-3xl"></div>
      <div className="absolute bottom-1/3 -left-32 w-64 h-64 rounded-full bg-gradient-to-br from-yellow-100/20 to-pink-100/10 blur-3xl"></div>
      
      {/* Sugar crystal corners */}
      <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-[#fffaf0] to-[#f8f0e3] rotate-45 shadow-sm opacity-50"></div>
      </div>
      <div className="absolute bottom-0 left-0 w-16 h-16 overflow-hidden">
        <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-tl from-[#fffaf0] to-[#f8f0e3] rotate-45 shadow-sm opacity-50"></div>
      </div>
      
      <header className="border-b border-gray-100 relative z-10">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center relative">
            <span className="text-4xl font-bold text-pink-500 mr-2">SUGAR</span>
            <span className="text-xl text-gray-600">Analytics</span>
            
            {/* Sugar sprinkles decoration - using pre-generated values to avoid hydration issues */}
            <div className="absolute -top-2 right-0 left-0 h-2 flex space-x-1 pointer-events-none">
              {isClient && [...Array(12)].map((_, i) => (
                <span 
                  key={i} 
                  className="inline-block rounded-full w-1 h-1" 
                  style={{ 
                    backgroundColor: sprinkleColors[i % 4],
                    transform: `scale(${sprinkleScales[i]}) translateY(${sprinkleTranslateY[i]}px)`
                  }}
                />
              ))}
            </div>
            
            {/* Lollipop decoration */}
            <div className="absolute -top-4 -right-16 transform rotate-12">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-300 to-red-300">
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(255,255,255,0.2)_3px,rgba(255,255,255,0.2)_6px)]"></div>
              </div>
              <div className="absolute top-[55%] left-1/2 w-1.5 h-12 bg-gradient-to-b from-pink-200 to-white rounded-full transform -translate-x-1/2"></div>
            </div>
          </div>
          <div className="text-lg text-gray-500 relative">
            Score: 85
            {/* Animated sparkles around score */}
            <span className="absolute -top-1 -right-2 text-yellow-400 animate-ping text-xs">✦</span>
            <span className="absolute bottom-0 -right-3 text-pink-400 animate-pulse text-xs" style={{animationDuration: '2.5s'}}>✦</span>
          </div>
          <UserButton />
        </div>
        
        {/* Sugar-themed decorative banner */}
        <div className="max-w-7xl mx-auto px-8 mt-2 mb-4">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 shadow-sm border border-pink-100 flex items-center gap-4 relative overflow-hidden">
            {/* Sugar cube pile */}
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="w-6 h-6 bg-gradient-to-br from-[#fffaf0] to-[#f8f0e3] rounded-sm relative transform rotate-45 shadow-sm"
                  style={{
                    marginLeft: i > 0 ? '-8px' : '0',
                    boxShadow: "inset -1px -1px 2px rgba(0,0,0,0.1), inset 1px 1px 2px rgba(255,255,255,0.8)"
                  }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(#e6d1b1_1px,transparent_1px)] bg-[size:3px_3px] opacity-15"></div>
                </div>
              ))}
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-medium text-pink-700">Sweet Progress</h3>
              <p className="text-sm text-gray-600">Track your study habits and watch your knowledge grow!</p>
            </div>
            
            {/* Candy stripes in background */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent,transparent_40px,rgba(255,182,193,0.05)_40px,rgba(255,182,193,0.05)_80px)] pointer-events-none"></div>
            
            {/* Cotton candy fluff */}
            <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-gradient-to-br from-pink-100/30 to-purple-100/20 blur-xl pointer-events-none"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 relative z-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 relative">
          Study Analytics
          <div className="absolute -top-6 right-0 text-pink-200 text-opacity-30 font-light text-6xl select-none">SWEET</div>
        </h1>
        
        <div className="grid grid-cols-1 gap-12">
          {/* Weekly Study Score Sugar Cube Graph */}
          <div className="bg-white relative">
            <h2 className="text-3xl font-bold mb-8">Weekly Study Score</h2>
            
            {/* Chart container */}
            <div className="h-[24rem] relative border border-pink-100 mx-auto max-w-4xl rounded-lg overflow-hidden bg-pink-50/50">
              {/* Grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(252,231,243,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(252,231,243,0.6)_1px,transparent_1px)] bg-[size:14.28%_14.28%]"></div>
              
              {/* Y-axis label */}
              <div className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 transform origin-center text-sm font-medium text-pink-400">
                Study Score
              </div>
              
              {/* Sugar cube stacks - only render on client side */}
              {isClient && (
                <div className="absolute bottom-12 left-12 right-12 h-[calc(100%-4rem)] flex items-end justify-between px-16">
                  {weeklyData.map((item, index) => {
                    // Calculate height percentage based on score
                    const heightPercent = Math.min(80, (item.score / 100) * 80);
                    
                    return (
                      <div key={index} className="flex flex-col items-center">
                        {/* Sugar cube stack column */}
                        <div 
                          className="w-10 group relative transition-all duration-300"
                          style={{ height: `${heightPercent}%` }}
                        >
                          <div className="w-full h-full flex flex-col-reverse">
                            {renderSugarCubes(item.score)}
                          </div>
                          
                          {/* Score tooltip on hover */}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-pink-100 px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-pink-800 z-10">
                            Score: {item.score}
                          </div>
                        </div>
                        
                        {/* Day label */}
                        <div className="text-sm font-medium text-gray-500 mt-4">{item.day.substring(0, 3)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Cute sugar cube character */}
              {isClient && (
                <div className="absolute bottom-1 right-1 w-12 h-16">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#fffaf0] to-[#f8f0e3] rounded-sm relative shadow-sm mx-auto">
                    <div className="absolute inset-0 bg-[radial-gradient(#e6d1b1_1px,transparent_1px)] bg-[size:3px_3px] opacity-15"></div>
                    {/* Eyes */}
                    <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-pink-800 rounded-full"></div>
                    <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-pink-800 rounded-full"></div>
                    {/* Smile */}
                    <div className="absolute bottom-1.5 left-1/2 w-3 h-1.5 border-b border-pink-800 rounded-full transform -translate-x-1/2"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Analysis Pie Chart */}
          <div className="bg-white">
            <h2 className="text-3xl font-bold mb-8 relative">
              Monthly Analysis
              <span className="absolute w-12 h-3 bg-pink-100 -z-10 bottom-1 left-0"></span>
            </h2>
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-2/3 flex justify-center">
                {/* Pie Chart - only render on client side */}
                {isClient && (
                  <div className="relative w-64 h-64 mx-auto">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {/* Decorative candy sprinkles around the pie */}
                      <circle cx="50" cy="50" r="55" fill="none" stroke="#ffccee" strokeWidth="0.5" strokeDasharray="2 4" />
                      <circle cx="50" cy="50" r="60" fill="none" stroke="#ffaadd" strokeWidth="0.5" strokeDasharray="1 6" />
                      <circle cx="50" cy="50" r="65" fill="none" stroke="#ffeeff" strokeWidth="0.3" strokeDasharray="1 10" />
                      
                      {monthlyData.map((item, index) => {
                        // Calculate the percentage and angles for the pie slices
                        const percentage = (item.hours / totalHours) * 100;
                        let cumulativePercentage = 0;
                        
                        for (let i = 0; i < index; i++) {
                          cumulativePercentage += (monthlyData[i].hours / totalHours) * 100;
                        }
                        
                        // Convert percentage to coordinates on the circle
                        const startAngle = (cumulativePercentage / 100) * 360;
                        const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
                        
                        const startRadians = (startAngle - 90) * (Math.PI / 180);
                        const endRadians = (endAngle - 90) * (Math.PI / 180);
                        
                        const startX = 50 + 50 * Math.cos(startRadians);
                        const startY = 50 + 50 * Math.sin(startRadians);
                        const endX = 50 + 50 * Math.cos(endRadians);
                        const endY = 50 + 50 * Math.sin(endRadians);
                        
                        // Create SVG path for the pie slice
                        const largeArcFlag = percentage > 50 ? 1 : 0;
                        const pathData = `
                          M 50 50
                          L ${startX} ${startY}
                          A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}
                          Z
                        `;
                        
                        // Calculate position for the percentage label
                        const midAngle = (startAngle + endAngle) / 2;
                        const midRadians = (midAngle - 90) * (Math.PI / 180);
                        const labelX = 50 + 35 * Math.cos(midRadians);
                        const labelY = 50 + 35 * Math.sin(midRadians);
                        
                        return (
                          <g key={index}>
                            <path
                              d={pathData}
                              fill={item.color.replace('bg-', '').replace('-500', '')}
                              stroke="#fff"
                              strokeWidth="1"
                            />
                            {percentage > 8 && (
                              <text 
                                x={labelX} 
                                y={labelY} 
                                fontSize="6" 
                                fill="#fff" 
                                textAnchor="middle" 
                                dominantBaseline="middle"
                                fontWeight="bold"
                              >
                                {Math.round(percentage)}%
                              </text>
                            )}
                          </g>
                        );
                      })}
                      
                      {/* Decorative center circle */}
                      <circle cx="50" cy="50" r="10" fill="#fff" />
                      <circle cx="50" cy="50" r="8" fill="#ffccee" />
                      
                      {/* Sprinkles in the center */}
                      <circle cx="48" cy="47" r="1" fill="#ff99cc" />
                      <circle cx="52" cy="53" r="0.8" fill="#ff80b0" />
                      <circle cx="50" cy="51" r="0.6" fill="#ffb0d0" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="w-full md:w-1/3">
                {/* Legend */}
                <div className="space-y-3 mt-6 md:mt-0">
                  {monthlyData.map((item, index) => (
                    <div key={index} className="flex items-center group">
                      <div className={`w-4 h-4 rounded-full ${item.color} mr-2 group-hover:scale-110 transition-transform`}></div>
                      <div className="text-sm">
                        <span className="font-medium">{item.category}: </span>
                        <span>{item.hours} hrs ({Math.round((item.hours / totalHours) * 100)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Smaller secondary stats in a side-by-side grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Additional statistics */}
            <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 w-16 h-16 bg-pink-50 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-700"></div>
              <h2 className="text-xl font-semibold mb-4">Study Streaks</h2>
              <div className="flex justify-center">
                <div className="text-center px-6">
                  <div className="text-3xl font-bold text-pink-500">7</div>
                  <div className="text-sm text-gray-500">Current Streak</div>
                </div>
                <div className="text-center px-6 border-l border-r border-gray-200">
                  <div className="text-3xl font-bold text-purple-500">21</div>
                  <div className="text-sm text-gray-500">Longest Streak</div>
                </div>
                <div className="text-center px-6">
                  <div className="text-3xl font-bold text-blue-500">85%</div>
                  <div className="text-sm text-gray-500">Consistency</div>
                </div>
              </div>
            </div>

            {/* Study Time Distribution */}
            <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute -left-8 -bottom-8 w-16 h-16 bg-purple-50 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-700"></div>
              <h2 className="text-xl font-semibold mb-4">Study Patterns</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Morning (6am-12pm)</span>
                    <span className="text-sm font-medium text-pink-600">40%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-pink-400 to-pink-500 h-2 rounded-full" style={{ width: "40%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Afternoon (12pm-6pm)</span>
                    <span className="text-sm font-medium text-purple-600">35%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full" style={{ width: "35%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Evening (6pm-12am)</span>
                    <span className="text-sm font-medium text-blue-600">20%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full" style={{ width: "20%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Night (12am-6am)</span>
                    <span className="text-sm font-medium text-indigo-600">5%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-400 to-indigo-500 h-2 rounded-full" style={{ width: "5%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 