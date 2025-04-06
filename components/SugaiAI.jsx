"use client";

import React, { useState } from 'react';
import { marked } from 'marked';

export default function SugaiAI({ onClose }) {
  const [query, setQuery] = useState("");
  const [geminiResult, setGeminiResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    
    const geminiApiKey = 'AIzaSyCfbAmg_l4s88ZLDUK492hqnxn7wdHyRY4';
    const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    try {
      const response = await fetch(`${geminiUrl}?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "contents": [{
            "parts": [{
              "text": query
            }]
          }]
        })
      });

      const data = await response.json();
      const resultText = data.candidates && 
                        data.candidates[0] && 
                        data.candidates[0].content && 
                        data.candidates[0].content.parts && 
                        data.candidates[0].content.parts[0] && 
                        data.candidates[0].content.parts[0].text || 
                        "Sorry, I couldn't process that request.";

      // Convert markdown to HTML
      const formattedResult = marked(resultText);
      setGeminiResult(formattedResult);
      // Clear the input field after submission
      setQuery("");
    } catch (error) {
      console.error('Error:', error);
      setGeminiResult("Error occurred while processing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-pink-500">SUGAI AI</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-auto mb-4 bg-gray-50 p-4 rounded-lg">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : geminiResult ? (
            <div 
              className="prose prose-pink max-w-none" 
              dangerouslySetInnerHTML={{ __html: geminiResult }}
            />
          ) : (
            <div className="text-gray-500 italic text-center py-10">
              Ask me anything! I'm here to help with your studies.
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask SUGAI anything..."
            className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <button 
            type="submit" 
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold p-3 rounded-r-lg transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "..." : "Ask"}
          </button>
        </form>
      </div>
    </div>
  );
} 