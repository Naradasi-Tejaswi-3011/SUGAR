"use client";
import { useState } from 'react';

export default function ZenAI() {
    const [geminiResult, setGeminiResult] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        const queryInput = document.getElementById('queryInput');
        const query = queryInput.value.trim();

        const geminiApiKey = 'AIzaSyCfbAmg_l4s88ZLDUK492hqnxn7wdHyRY4';
        const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

        if (!query) return;

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
            const resultText = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text || "No Result";

            setGeminiResult(resultText);

        } catch (error) {
            console.error('Error:', error);
            setGeminiResult("Error occurred while processing your request.");
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Zen AI</h2>
            <form id="searchForm" onSubmit={handleSubmit}>
                <input
                    type="text"
                    id="queryInput"
                    placeholder="Enter your query"
                    className="w-full p-2 border border-gray-300 rounded mb-2"
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition-colors">
                    Search
                </button>
            </form>
            {geminiResult && (
                <div className="mt-4 p-2 bg-gray-100 rounded">
                    <p className="whitespace-pre-line">{geminiResult}</p>
                </div>
            )}
        </div>
    );
} 