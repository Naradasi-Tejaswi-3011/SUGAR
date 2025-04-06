"use client";

import React, { useState, useRef, useEffect } from 'react';
// Remove static imports that cause SSR issues
// import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// We'll load PDF.js from CDN directly instead of using npm package
let pdfjsLib;

export default function NoteSummarizer({ onClose }) {
  const [documentText, setDocumentText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [isPdfJsLoaded, setIsPdfJsLoaded] = useState(false);
  const fileInputRef = useRef(null);
  const documentContentRef = useRef(null);

  // Check for existing selection on mount
  useEffect(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
    }

    // Check if we can access the PDF content already loaded in the viewer
    const accessCurrentPdf = async () => {
      // If there's already text selected, we don't need to load the PDF again
      if (selection && selection.toString().trim().length > 0) {
        return;
      }

      try {
        setIsLoading(true);
        
        // Try to access the PDF content from the text layer in the study room
        const textLayerContent = document.querySelector('.textLayer');
        if (textLayerContent) {
          const existingText = textLayerContent.textContent || "";
          
          if (existingText.trim().length > 0) {
            setDocumentText(existingText);
            
            // Create a visual representation of the content
            if (documentContentRef.current) {
              documentContentRef.current.innerHTML = '';
              
              // Split content into paragraphs for better readability
              const paragraphs = existingText.split(/\n\s*\n|\r\n\s*\r\n|\r\s*\r/);
              
              paragraphs.forEach(paragraph => {
                if (paragraph.trim().length > 0) {
                  const para = document.createElement('p');
                  para.className = 'mb-3';
                  para.textContent = paragraph.trim();
                  documentContentRef.current.appendChild(para);
                }
              });
            }
          }
        }
      } catch (error) {
        console.error("Error accessing current PDF content:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    accessCurrentPdf();
  }, []);

  // Dynamically load PDF.js from CDN
  useEffect(() => {
    async function loadPdfJs() {
      try {
        if (typeof window !== 'undefined') {
          // Load PDF.js library script
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
          script.async = true;
          
          script.onload = () => {
            // After script loads, set the worker source
            const pdfjsLib = window.pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            window.pdfjsLib = pdfjsLib;
            setIsPdfJsLoaded(true);
          };
          
          document.body.appendChild(script);
          
          return () => {
            document.body.removeChild(script);
          };
        }
      } catch (error) {
        console.error("Error loading PDF.js:", error);
      }
    }
    loadPdfJs();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);

    if (documentContentRef.current) {
      documentContentRef.current.innerHTML = '';
    }
    
    const fileType = file.type;

    if (fileType === 'application/pdf') {
      if (!window.pdfjsLib) {
        alert("PDF library is still loading. Please try again in a moment.");
        setIsLoading(false);
        return;
      }

      const fileReader = new FileReader();
      fileReader.onload = async function () {
        const typedArray = new Uint8Array(this.result);
        try {
          const pdf = await window.pdfjsLib.getDocument({ data: typedArray }).promise;
          let fullText = '';
          
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + ' ';
            
            if (documentContentRef.current) {
              const pageElement = document.createElement('div');
              pageElement.className = 'pdf-page';
              pageElement.textContent = pageText;
              documentContentRef.current.appendChild(pageElement);
            }
          }
          
          setDocumentText(fullText);
          setIsLoading(false);
        } catch (error) {
          console.error('Error processing PDF:', error);
          setIsLoading(false);
          alert("Error processing PDF: " + error.message);
        }
      };
      fileReader.readAsArrayBuffer(file);
    } else if (fileType === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        setDocumentText(text);
        
        if (documentContentRef.current) {
          const pre = document.createElement('pre');
          pre.textContent = text;
          documentContentRef.current.appendChild(pre);
        }
        setIsLoading(false);
      };
      reader.readAsText(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const reader = new FileReader();
      reader.onload = async function(event) {
        try {
          const arrayBuffer = event.target.result;
          const result = await mammoth.extractRawText({ arrayBuffer });
          const text = result.value;
          setDocumentText(text);
          
          if (documentContentRef.current) {
            const pre = document.createElement('pre');
            pre.textContent = text;
            documentContentRef.current.appendChild(pre);
          }
        } catch (err) {
          console.error('Error processing DOCX:', err);
          alert("Error processing DOCX: " + err.message);
        }
        setIsLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Unsupported file type. Please upload a PDF, TXT, or DOCX file.");
      setIsLoading(false);
    }
  };

  const summarizeSelectedText = () => {
    // Try to get any new selection from the window
    const selection = window.getSelection().toString().trim();
    
    // Use either the new selection or the previously captured selection
    const textToSummarize = selection || selectedText;
    
    if (!textToSummarize) {
      alert("Please select some text to summarize.");
      return;
    }
    
    // Add the selected text to the document content for visualization
    if (documentContentRef.current && textToSummarize.length > 0) {
      // Clear previous content if it was empty
      if (!documentText) {
        documentContentRef.current.innerHTML = '';
      }
      
      const selectionElement = document.createElement('div');
      selectionElement.className = 'selected-text bg-yellow-50 p-3 border border-yellow-200 rounded mb-3';
      
      const header = document.createElement('div');
      header.className = 'text-sm font-medium text-gray-700 mb-2';
      header.textContent = 'Selected Text:';
      
      const content = document.createElement('div');
      content.textContent = textToSummarize;
      
      selectionElement.appendChild(header);
      selectionElement.appendChild(content);
      
      // Add to the top of the content
      if (documentContentRef.current.firstChild) {
        documentContentRef.current.insertBefore(selectionElement, documentContentRef.current.firstChild);
      } else {
        documentContentRef.current.appendChild(selectionElement);
      }
    }
    
    // Update the selected text state to use the current selection
    if (selection) {
      setSelectedText(selection);
    }
    
    const generatedSummary = generateSummary(textToSummarize);
    setSummary(generatedSummary);
  };

  const summarizeAllText = () => {
    if (!documentText) {
      alert("Please upload a document first.");
      return;
    }
    
    const generatedSummary = generateSummary(documentText);
    setSummary(generatedSummary);
  };
  
  // Simple extractive summarization - Select important sentences
  const generateSummary = (text) => {
    // Split into sentences
    const sentences = text.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");
    
    // Skip if too few sentences
    if (sentences.length <= 3) {
      return text;
    }
    
    // Score each sentence based on word frequency
    const wordFrequency = {};
    sentences.forEach(sentence => {
      const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      words.forEach(word => {
        if (word.length > 3) { // Skip short words
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        }
      });
    });
    
    // Calculate sentence scores
    const sentenceScores = sentences.map(sentence => {
      const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      let score = 0;
      words.forEach(word => {
        if (word.length > 3) {
          score += wordFrequency[word] || 0;
        }
      });
      return { sentence, score };
    });
    
    // Sort by score and take top 30%
    sentenceScores.sort((a, b) => b.score - a.score);
    const numSentencesToKeep = Math.max(3, Math.ceil(sentences.length * 0.3));
    const topSentences = sentenceScores.slice(0, numSentencesToKeep);
    
    // Sort back to original order
    const originalOrder = [];
    sentences.forEach((sentence, index) => {
      topSentences.forEach(item => {
        if (item.sentence === sentence) {
          originalOrder.push({ index, sentence });
        }
      });
    });
    
    originalOrder.sort((a, b) => a.index - b.index);
    
    // Join with newlines for better readability
    return originalOrder.map(item => item.sentence).join("\n\n");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-pink-500">Notes Summarizer</h2>
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

        <div className="upload-section text-center mb-4">
          <input 
            type="file" 
            ref={fileInputRef}
            id="fileInput" 
            className="hidden" 
            accept=".txt,.pdf,.docx" 
            onChange={handleFileUpload}
            disabled={isLoading}
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className={`${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-lg`}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Upload File (PDF, TXT, DOCX)'}
          </button>
          
          {selectedText && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Text selection detected!</span> You can summarize it directly.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Document Content</h3>
            <div 
              ref={documentContentRef}
              className="flex-1 overflow-auto p-3 bg-white border border-gray-200 rounded min-h-[300px] max-h-[500px]"
            >
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
                  <span className="ml-2 text-gray-600">Loading document...</span>
                </div>
              )}
              
              {!isLoading && !documentText && selectedText && (
                <div className="selected-text bg-yellow-50 p-3 border border-yellow-200 rounded mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">Selected Text:</div>
                  <div>{selectedText}</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Summary</h3>
            <div className="flex-1 overflow-auto p-3 bg-white border border-gray-200 rounded min-h-[300px] max-h-[500px] whitespace-pre-line">
              {summary}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button 
            onClick={summarizeSelectedText}
            className={`${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-2 rounded-lg`}
            disabled={isLoading}
          >
            Summarize Selected Text
          </button>
          <button 
            onClick={summarizeAllText}
            className={`${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'} text-white px-4 py-2 rounded-lg`}
            disabled={isLoading}
          >
            Summarize All Text
          </button>
        </div>
      </div>
    </div>
  );
} 