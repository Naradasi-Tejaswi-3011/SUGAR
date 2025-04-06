"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Document, Page, pdfjs } from "react-pdf";
import { BsArrowRight, BsArrowLeft } from "react-icons/bs";
import localFont from 'next/font/local';
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import FaceDetection from "@/components/FaceDetection";
import SugaiAI from "../../components/SugaiAI";
import NoteSummarizer from "../../components/NoteSummarizer";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function StudyRoomPage() {
  const [pdfFile, setPdfFile] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(25);
  const [sessionDurationSeconds, setSessionDurationSeconds] = useState(0);
  const [breakInterval, setBreakInterval] = useState(25);
  const [breakIntervalSeconds, setBreakIntervalSeconds] = useState(0);
  const [breakDuration, setBreakDuration] = useState(5);
  const [breakDurationSeconds, setBreakDurationSeconds] = useState(0);
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [showBreakNotification, setShowBreakNotification] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [savedSession, setSavedSession] = useState(null);
  const [waitingForPdfAfterRestore, setWaitingForPdfAfterRestore] = useState(false);
  
  // PDF viewer states
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1.5);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  
  // Note-taking states
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showSummarizer, setShowSummarizer] = useState(false);
  
  // Study music states
  const [playingMusic, setPlayingMusic] = useState(false);
  const [selectedMusicType, setSelectedMusicType] = useState("lofi");
  const audioRef = useRef(null);
  
  // Focus mode states
  const [focusMode, setFocusMode] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  
  // Tab switch counter
  const [tabSwitches, setTabSwitches] = useState(0);
  
  // References
  const pdfDocRef = useRef(null);
  
  // Progress tracking
  const [studyGoal, setStudyGoal] = useState(10); // pages goal
  const [pagesRead, setPagesRead] = useState(0);
  
  // Music options
  const musicOptions = {
    lofi: "https://stream.zeno.fm/0r0xa792kwzuv",
    classical: "https://stream.zeno.fm/d553pahd84zuv",
    nature: "https://stream.zeno.fm/n53wu8h2tc9uv",
    whitenoise: "https://stream.zeno.fm/huwsfsp8yfhvv"
  };
  
  // Add a new state for face detection after the other state declarations
  const [facePresent, setFacePresent] = useState(false);
  const [faceDetectionEnabled, setFaceDetectionEnabled] = useState(true);
  const [autoFacePause, setAutoFacePause] = useState(false);
  const [showFaceAlert, setShowFaceAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("Timer paused - no face detected");
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const faceTimeoutRef = useRef(null);
  
  // Sound references for notifications
  const pauseSoundRef = useRef(null);
  const resumeSoundRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Add reference for tracking face status changes
  const prevFaceStatusRef = useRef(false);
  
  // Initialize sound elements and set default session values
  useEffect(() => {
    // Set default session values
    setSessionDuration(25); // Default to 25 minutes
    
    if (typeof window !== 'undefined') {
      // Sound initialization
      pauseSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      resumeSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/1518/1518-preview.mp3');
      
      // Set volume
      if (pauseSoundRef.current) pauseSoundRef.current.volume = 0.3;
      if (resumeSoundRef.current) resumeSoundRef.current.volume = 0.3;
    }
    
    return () => {
      // Cleanup sound references
      pauseSoundRef.current = null;
      resumeSoundRef.current = null;
    };
  }, []);
  
  // Check for saved session on mount
  useEffect(() => {
    const savedSessionData = localStorage.getItem('pausedStudySession');
    if (savedSessionData) {
      try {
        const parsedSession = JSON.parse(savedSessionData);
        setSavedSession(parsedSession);
        setShowRecoveryDialog(true);
      } catch (error) {
        console.error('Failed to parse saved session:', error);
        localStorage.removeItem('pausedStudySession');
      }
    }
  }, []);

  // Function to restore saved session
  const restoreSavedSession = () => {
    if (!savedSession) return;
    
    // Set all the saved values
    setTimeLeft(savedSession.timeLeft);
    setSessionDuration(savedSession.sessionDuration);
    setBreakInterval(savedSession.breakInterval);
    setBreakDuration(savedSession.breakDuration);
    setIsBreak(savedSession.isBreak);
    setPagesRead(savedSession.pagesRead);
    setStudyGoal(savedSession.studyGoal);
    if (savedSession.notes) setNotes(savedSession.notes);
    
    // Clear the saved session
    localStorage.removeItem('pausedStudySession');
    setShowRecoveryDialog(false);
    
    // Set flag indicating we're waiting for PDF upload after restore
    setWaitingForPdfAfterRestore(true);
    
    // Prompt for PDF file again since we can't save it to localStorage
    alert("Please re-upload your PDF file to continue your study session");
    
    // Reset pause state
    setIsPaused(false);
  };

  // Function to start new session
  const startNewSession = () => {
    localStorage.removeItem('pausedStudySession');
    setSavedSession(null);
    setShowRecoveryDialog(false);
  };

  const handleFiles = (files) => {
    const file = files[0];
    if (file?.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }

    console.log("Loading PDF file...");
    const fileReader = new FileReader();
    fileReader.onload = function() {
      // First set the PDF file to trigger rendering
      setPdfFile(fileReader.result);
      
      // Calculate total session duration including seconds
      const totalSessionMinutes = sessionDuration + (sessionDurationSeconds / 60);
      // Update the session duration before starting timer
      setSessionDuration(totalSessionMinutes);
      
      console.log("PDF loaded successfully, starting timer...");
      
      // If this is a PDF upload after session restoration, we don't want to reset the timer
      if (!waitingForPdfAfterRestore) {
        startTimer();
      } else {
        // This is after a session restore, so we just need to clear the flag
        setWaitingForPdfAfterRestore(false);
      }
      
      // Use a direct user-triggered approach for fullscreen
      // This is necessary because browsers require direct user interaction for fullscreen
      document.body.addEventListener('click', function tryFullscreen() {
        // Only try once and then remove the listener
        document.body.removeEventListener('click', tryFullscreen);
        
        console.log("User clicked - attempting fullscreen from user gesture");
        
        try {
          const docElement = document.documentElement;
          if (docElement.requestFullscreen) {
            docElement.requestFullscreen()
              .then(() => {
                console.log("Fullscreen activated successfully after PDF upload");
                setIsFullscreen(true);
              })
              .catch(err => {
                console.error("Fullscreen error:", err);
                setIsFullscreen(false);
              });
          } else if (docElement.mozRequestFullScreen) {
            docElement.mozRequestFullScreen();
            setIsFullscreen(true);
          } else if (docElement.webkitRequestFullscreen) {
            docElement.webkitRequestFullscreen();
            setIsFullscreen(true);
          } else if (docElement.msRequestFullscreen) {
            docElement.msRequestFullscreen();
            setIsFullscreen(true);
          }
        } catch (err) {
          console.error("Error requesting fullscreen:", err);
        }
      }, { once: true });
      
      // Show a small message to prompt the user to click anywhere
      // This is needed because browsers require direct user interaction for fullscreen
      const messageDiv = document.createElement('div');
      messageDiv.innerText = 'Click anywhere on the screen to enter fullscreen mode';
      messageDiv.style.position = 'fixed';
      messageDiv.style.top = '50%';
      messageDiv.style.left = '50%';
      messageDiv.style.transform = 'translate(-50%, -50%)';
      messageDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      messageDiv.style.color = 'white';
      messageDiv.style.padding = '20px';
      messageDiv.style.borderRadius = '8px';
      messageDiv.style.zIndex = '9999';
      messageDiv.style.transition = 'opacity 0.5s';
      document.body.appendChild(messageDiv);
      
      // Remove the message after a few seconds
      setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(messageDiv);
        }, 500);
      }, 3000);
    };
    fileReader.readAsArrayBuffer(file);
  };

  const startTimer = () => {
    console.log("Starting new timer...");
    
    // Clear any existing timer first
    if (timer) {
      clearInterval(timer);
    }
    
    // Initialize elapsed time to 0 when starting a new timer
    setElapsedTime(0);
    
    // Calculate and set the total session time 
    const totalSessionSeconds = sessionDuration * 60;
    setTimeLeft(totalSessionSeconds);
    
    // Create new timer interval
    const newInterval = setInterval(() => {
      setElapsedTime(prevTime => {
        const newTime = prevTime + 1;
        const totalSessionSeconds = sessionDuration * 60;
        
        // Update timeLeft as well
        setTimeLeft(Math.max(0, totalSessionSeconds - newTime));
        
        // Check if session is complete
        if (newTime >= totalSessionSeconds) {
          console.log("Session complete");
          clearInterval(newInterval);
          setTimer(null);
          // Here you could trigger a break or end session notification
          return totalSessionSeconds; // Cap at session duration
        }
        
        // Check if we need to take a break
        if (!isBreak && breakInterval > 0 && newTime % (breakInterval * 60) === 0) {
          console.log("Break interval reached");
          clearInterval(newInterval);
          setTimer(null);
          setIsBreak(true);
          setShowBreakNotification(true);
          
          // Set timeLeft to break duration
          const breakTimeSeconds = (breakDuration * 60) + parseInt(breakDurationSeconds || 0);
          setTimeLeft(breakTimeSeconds);
          
          playSound('/notification.mp3');
        }
        
        // Return updated time
        return newTime;
      });
    }, 1000);
    
    setTimer(newInterval);
    
    return newInterval;
  };

  // Format time in MM:SS format with colon
  const formatTimeDisplay = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Format time with hours if needed
  const formatTimeHMS = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    } else {
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add("border-pink-400");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("border-pink-400");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("border-pink-400");
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle fullscreen change event with improved camera activation
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement || 
                                   !!document.mozFullScreenElement ||
                                   !!document.webkitFullscreenElement || 
                                   !!document.msFullscreenElement;
      
      console.log("Fullscreen changed:", isCurrentlyFullscreen);
      setIsFullscreen(isCurrentlyFullscreen);
      
      // If entering fullscreen, ensure camera is activated for face detection
      if (isCurrentlyFullscreen && faceDetectionEnabled) {
        console.log("Entered fullscreen - activating face detection");
        // Force refresh of face detection state to ensure it initializes
        setFaceDetectionEnabled(false);
        setTimeout(() => setFaceDetectionEnabled(true), 100);
      }
      
      // If exiting fullscreen and studying, show confirmation dialog
      if (!isCurrentlyFullscreen && pdfFile && !showExitConfirmation && !isPaused) {
        // Pause the timer
        console.log("Exited fullscreen - pausing timer");
        setIsPaused(true);
        setShowPauseDialog(true);
        
        // Just to be extra sure the interval is paused
        if (timer) {
          clearInterval(timer);
        }
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [pdfFile, showExitConfirmation, isPaused, timer, faceDetectionEnabled]);

  // Add a better effect to handle isPaused changes
  useEffect(() => {
    // If paused, stop timer but don't clear it
    if (isPaused) {
      console.log("Timer paused - clearing interval");
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
    } 
    // If unpaused and no timer, restart timer
    else if (!timer && elapsedTime > 0) {
      console.log("Timer unpaused - restarting");
      startTimer();
    }
  }, [isPaused, timer, elapsedTime]);

  // Update the ESC key handler to prevent exiting when auto-paused
  const handleEscapeKey = useCallback((e) => {
    if (e.key === 'Escape') {
      // If we're using face detection and it auto-paused the timer,
      // prevent the default ESC behavior to avoid exiting fullscreen
      if (faceDetectionEnabled && window.__faceAutoDetectionPause && showFaceAlert) {
        e.preventDefault();
        console.log("Preventing exit fullscreen during face detection pause");
        return;
      }
      
      // Default behavior for ESC key
      if (isFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (document.webkitFullscreenElement) {
          document.webkitExitFullscreen();
        } else if (document.mozFullScreenElement) {
          document.mozCancelFullScreen();
        } else if (document.msFullscreenElement) {
          document.msExitFullscreen();
        }
      }
    }
  }, [faceDetectionEnabled, showFaceAlert, isFullscreen]);

  // Exit fullscreen when component unmounts
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, []);

  // Clean up timer
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  // Load PDF.js library dynamically - separated from rendering
  useEffect(() => {
    if (pdfFile) {
      // Create script elements for both PDF.js and the worker
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.async = true;
      
      // Clear any existing PDF reference to prevent render cascade
      pdfDocRef.current = null;
      
      script.onload = () => {
        // Get the global pdfjsLib object set by the library
        const pdfjsLib = window.pdfjsLib;
        
        // Configure the worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        
        // Parse the PDF
        const loadingTask = pdfjsLib.getDocument(pdfFile);
        loadingTask.promise.then(pdf => {
          pdfDocRef.current = pdf;
          setNumPages(pdf._pdfInfo.numPages);
          // Don't render here - let the separate useEffect handle it
        }).catch(error => {
          console.error("Error loading PDF: ", error);
          alert("Error loading PDF. Please try uploading the file again.");
        });
      };
      
      script.onerror = () => {
        console.error("Failed to load PDF.js library");
        alert("Failed to load PDF viewer. Please refresh the page and try again.");
      };
      
      document.body.appendChild(script);
      
      // Load additional styles for text layer
      const style = document.createElement('style');
      style.textContent = `
        .textLayer {
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          opacity: 0.2;
          line-height: 1.0;
          pointer-events: auto;
          mix-blend-mode: normal;
          z-index: 1;
        }
        
        .textLayer > div {
          color: transparent;
          cursor: text;
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
        }
        
        /* Custom selection color */
        ::selection {
          background: rgba(255, 105, 180, 0.3) !important;
        }

        canvas {
          display: block !important;
          z-index: 0;
        }
      `;
      document.head.appendChild(style);
      
      // Cleanup function to remove the script when component unmounts
      return () => {
        try {
          // Cancel any ongoing render task
          if (currentRenderTask.current) {
            currentRenderTask.current.cancel();
            currentRenderTask.current = null;
          }
          
          document.body.removeChild(script);
          document.head.removeChild(style);
        } catch (e) {
          // Element might already have been removed, ignore errors
        }
      };
    }
  }, [pdfFile]);

  // Add a reference to track the current render task
  const currentRenderTask = useRef(null);

  // Handle PDF rendering separately
  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(pdfDocRef.current, currentPage);
    }
  }, [currentPage, zoomLevel, rotation]);

  const renderPage = async (pdf, pageNumber) => {
    if (!pdf) return;
    
    // Cancel any ongoing render task
    if (currentRenderTask.current) {
      try {
        await currentRenderTask.current.cancel();
      } catch (error) {
        console.error("Error cancelling render task:", error);
      }
    }
    
    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ 
        scale: zoomLevel,
        rotation: rotation 
      });
      
      // Canvas rendering
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const context = canvas.getContext('2d');
      
      // Add padding at the top to ensure the top part is visible
      const topPadding = 40;
      canvas.height = viewport.height + topPadding;
      canvas.width = viewport.width;
      
      // Clear the canvas before rendering
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        transform: [1, 0, 0, 1, 0, topPadding] // Add top padding
      };
      
      // Store the render task in the ref
      currentRenderTask.current = page.render(renderContext);
      
      // Wait for rendering to finish
      await currentRenderTask.current.promise;
      
      // Clear the task ref after completion
      currentRenderTask.current = null;
      
      // Text layer rendering
      if (textLayerRef.current) {
        // Clear previous text layer content
        textLayerRef.current.innerHTML = '';
        
        // Set text layer dimensions to match canvas exactly
        textLayerRef.current.style.width = `${viewport.width}px`;
        textLayerRef.current.style.height = `${viewport.height + topPadding}px`;
        
        try {
          // Get text content
          const textContent = await page.getTextContent();
          
          // Simple text layer - create a single selectable div with all text
          const textDiv = document.createElement('div');
          textDiv.style.position = 'absolute';
          textDiv.style.left = '0';
          textDiv.style.top = '0'; // Start from the very top
          textDiv.style.width = '100%';
          textDiv.style.height = '100%';
          textDiv.style.color = 'transparent';
          textDiv.style.userSelect = 'text';
          textDiv.style.cursor = 'text';
          textDiv.style.pointerEvents = 'all';
          textDiv.style.overflowY = 'visible'; // Allow overflow for proper text selection
          
          // Get all text
          let fullText = '';
          textContent.items.forEach(item => {
            fullText += item.str + ' ';
          });
          
          // Set the text content
          textDiv.textContent = fullText;
          
          // Add to the text layer
          textLayerRef.current.appendChild(textDiv);
        } catch (error) {
          console.error('Error rendering text layer:', error);
        }
      }
      
      // Update progress tracker
      if (pageNumber > pagesRead) {
        setPagesRead(pageNumber);
      }
    } catch (error) {
      console.error("Error rendering page:", error);
    }
  };

  // Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && pdfFile) {
        setTabSwitches(prev => prev + 1);
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pdfFile]);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
    }
  };
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };
  
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };
  
  const toggleFocusMode = () => {
    setFocusMode(prev => !prev);
    setShowToolbar(!focusMode);
  };
  
  const toggleMusic = () => {
    if (playingMusic && audioRef.current) {
      try {
        // Add a timeout to avoid instant consecutive play/pause calls
        setTimeout(() => {
          audioRef.current.pause();
        }, 100);
      } catch (err) {
        console.error("Error pausing audio:", err);
      }
    } else {
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio(musicOptions[selectedMusicType]);
          audioRef.current.loop = true;
        }
        
        // Add a timeout to avoid instant consecutive play/pause calls
        setTimeout(() => {
          const playPromise = audioRef.current.play();
          
          // Handle the play promise properly
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // Audio playback started successfully
              })
              .catch(err => {
                console.error("Error playing audio:", err);
              });
          }
        }, 100);
      } catch (err) {
        console.error("Error playing audio:", err);
      }
    }
    setPlayingMusic(prev => !prev);
  };
  
  const changeMusic = (type) => {
    setSelectedMusicType(type);
    if (playingMusic && audioRef.current) {
      try {
        // First pause current audio
        const pausePromise = audioRef.current.pause();
        
        // Update the src and play after a small delay
        setTimeout(() => {
          audioRef.current.src = musicOptions[type];
          
          // Play with proper promise handling
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // Audio playback started successfully
              })
              .catch(err => {
                console.error("Error playing new audio:", err);
                // Reset playing state if playback fails
                setPlayingMusic(false);
              });
          }
        }, 200);
      } catch (err) {
        console.error("Error changing music:", err);
      }
    }
  };
  
  const addNote = () => {
    if (currentNote.trim()) {
      const newNote = {
        id: Date.now(),
        text: currentNote,
        page: currentPage,
        timestamp: new Date().toLocaleString()
      };
      setNotes(prev => [...prev, newNote]);
      setCurrentNote("");
    }
  };
  
  const deleteNote = (id) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };
  
  const toggleNotes = () => {
    setShowNotes(prev => !prev);
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!pdfFile || isPaused) return; // Don't handle shortcuts if paused
      if (e.key === 'Escape') return; // Skip Escape key as it's handled separately
      
      switch (e.key) {
        case "ArrowRight":
          goToNextPage();
          break;
        case "ArrowLeft":
          goToPreviousPage();
          break;
        case "+":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "r":
          handleRotate();
          break;
        case "f":
          toggleFocusMode();
          break;
        case "m":
          toggleMusic();
          break;
        case "n":
          toggleNotes();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pdfFile, currentPage, numPages, playingMusic, focusMode, isPaused]);

  // Updated function for continuing study after session exit
  const handleContinueStudying = () => {
    console.log("Continuing study session...");
    
    // Retrieve saved session from localStorage
    const savedSessionData = localStorage.getItem('sugar-saved-session');
    
    if (savedSessionData) {
      try {
        const savedSession = JSON.parse(savedSessionData);
        console.log("Restored session data:", savedSession);
        
        // Restore session values
        if (savedSession.sessionDuration) setSessionDuration(savedSession.sessionDuration);
        if (savedSession.elapsedTime) setElapsedTime(savedSession.elapsedTime);
        if (savedSession.timeLeft) setTimeLeft(savedSession.timeLeft);
        if (savedSession.breakInterval) setBreakInterval(savedSession.breakInterval);
        if (savedSession.breakDuration) setBreakDuration(savedSession.breakDuration);
        
        // Clear saved session data after restoring
        localStorage.removeItem('sugar-saved-session');
      } catch (error) {
        console.error("Error restoring saved session:", error);
      }
    }
    
    // Close dialogs
    setShowExitConfirmation(false);
    setShowPauseDialog(false);
    
    // Make sure we're in fullscreen mode
    const isCurrentlyFullscreen = !!document.fullscreenElement || 
                                 !!document.mozFullScreenElement ||
                                 !!document.webkitFullscreenElement || 
                                 !!document.msFullscreenElement;
                                 
    if (!isCurrentlyFullscreen) {
      console.log("Requesting fullscreen on continue studying");
      setTimeout(() => {
        try {
          const docElement = document.documentElement;
          if (docElement.requestFullscreen) {
            docElement.requestFullscreen()
              .then(() => {
                console.log("Fullscreen activated successfully");
                setIsFullscreen(true);
              })
              .catch(err => {
                console.error("Fullscreen permission denied:", err);
                alert("Could not enter fullscreen mode. Please use the study features without fullscreen.");
                setIsFullscreen(false);
              });
          } else if (docElement.mozRequestFullScreen) {
            docElement.mozRequestFullScreen()
              .catch(err => {
                console.error("Fullscreen error:", err);
                setIsFullscreen(false);
              });
          } else if (docElement.webkitRequestFullscreen) {
            docElement.webkitRequestFullscreen()
              .catch(err => {
                console.error("Fullscreen error:", err);
                setIsFullscreen(false);
              });
          } else if (docElement.msRequestFullscreen) {
            docElement.msRequestFullscreen()
              .catch(err => {
                console.error("Fullscreen error:", err);
                setIsFullscreen(false);
              });
          } else {
            console.log("No fullscreen API available");
            alert("Your browser doesn't support fullscreen mode. You can still use all features.");
            setIsFullscreen(false);
          }
        } catch (err) {
          console.error("Error requesting fullscreen:", err);
          alert("Could not enter fullscreen mode. You can still use the study features without fullscreen.");
          setIsFullscreen(false);
        }
      }, 100);
    }
    
    // Resume timer with delay to ensure UI is updated
    setTimeout(() => {
      // If paused, unpause and restart timer if needed
      if (isPaused) {
        setIsPaused(false);
      }
      
      // Start a new timer if none exists
      if (!timer) {
        console.log("Creating new timer interval that continues from elapsed time:", elapsedTime);
        
        // Create a new interval that continues from current elapsed time
        const newInterval = setInterval(() => {
          setElapsedTime(prevTime => {
            const newTime = prevTime + 1;
            const totalSessionSeconds = sessionDuration * 60;
            
            // Update timeLeft as well
            setTimeLeft(Math.max(0, totalSessionSeconds - newTime));
            
            // Check if session is complete
            if (newTime >= totalSessionSeconds) {
              console.log("Session complete");
              clearInterval(newInterval);
              setTimer(null);
              return totalSessionSeconds; // Cap at session duration
            }
            
            // Check if we need to take a break
            if (!isBreak && breakInterval > 0 && newTime % (breakInterval * 60) === 0) {
              console.log("Break interval reached");
              clearInterval(newInterval);
              setTimer(null);
              setIsBreak(true);
              setShowBreakNotification(true);
              
              // Set timeLeft to break duration
              const breakTimeSeconds = (breakDuration * 60) + parseInt(breakDurationSeconds || 0);
              setTimeLeft(breakTimeSeconds);
              
              playSound('/notification.mp3');
            }
            
            // Return updated time
            return newTime;
          });
        }, 1000);
        
        setTimer(newInterval);
      }
      
      // Reactivate face detection if enabled
      if (faceDetectionEnabled) {
        setFaceDetectionEnabled(false);
        setTimeout(() => setFaceDetectionEnabled(true), 200);
      }
    }, 300);
  };

  // New function to handle exit anyway
  const handleExitAnyway = () => {
    // Save current progress before exiting
    const currentSession = {
      sessionDuration,
      elapsedTime,
      breakInterval,
      breakDuration,
      isPaused,
      timeLeft,
      pdfFile: pdfFile ? true : false // just save flag, not the actual file
    };
    
    console.log("Saving session state before exit:", elapsedTime, timeLeft);
    
    // Store current session in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sugar-saved-session', JSON.stringify(currentSession));
    }
    
    // Close modal
    setShowExitConfirmation(false);
    
    // Exit fullscreen before navigating
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.log("Error exiting fullscreen:", err);
      }).finally(() => {
        // Navigate back to homepage
        window.location.href = '/';
      });
    } else {
      // Navigate back to homepage if not in fullscreen
      window.location.href = '/';
    }
  };

  // New function to completely exit study session
  const handleExitStudy = () => {
    setShowExitConfirmation(true);
    setIsPaused(true);
  };

  // New function to start a new study session
  const handleNewStudySession = () => {
    if (timer) {
      clearInterval(timer);
    }
    setPdfFile(null);
    setIsPaused(false);
    setShowPauseDialog(false);
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  // Face detection handler function
  const handleFaceStatus = useCallback((isPresent) => {
    // Only log if there's a change in state or we're auto-pausing
    if (isPresent !== prevFaceStatusRef.current || window.__faceAutoDetectionPause) {
      console.log(`Face detection: Face ${isPresent ? 'DETECTED' : 'ABSENT'}`);
    }
    
    // Update previous face status
    prevFaceStatusRef.current = isPresent;
    
    // Always refresh the UI state even if there's no actual state change
    // This ensures the UI is consistent with the detection state
    setFacePresent(isPresent);
    
    // If the timer is already paused and it wasn't due to face detection, don't interfere
    if (isPaused && !window.__faceAutoDetectionPause) {
      console.log("Timer already manually paused - not changing state");
      return;
    }
    
    // Clear any pending timeouts
    if (faceTimeoutRef.current) {
      clearTimeout(faceTimeoutRef.current);
      faceTimeoutRef.current = null;
    }
    
    // Handle face absence
    if (!isPresent && !isPaused && isFullscreen) {
      console.log("Face absent - starting 3-second countdown to pause timer");
      
      // Start a countdown to pause after 3 seconds
      faceTimeoutRef.current = setTimeout(() => {
        console.log("Face still absent after 3 seconds - pausing timer");
        
        // Flag that pause is due to face detection
        if (typeof window !== 'undefined') {
          window.__faceAutoDetectionPause = true;
        }
        
        // Pause timer and show notification
        setIsPaused(true);
        setShowFaceAlert(true);
        setAlertMessage("Timer paused - no face detected");

        // Play notification sound if enabled
        if (soundEnabled) {
          pauseSoundRef.current?.play().catch(err => console.log("Error playing sound:", err));
        }
        
        faceTimeoutRef.current = null;
      }, 3000);
    }
    
    // Handle face reappearance after pause
    if (isPresent && isPaused && window.__faceAutoDetectionPause && isFullscreen) {
      console.log("Face detected again after auto-pause - showing resume option");
      
      setShowFaceAlert(true);
      setAlertMessage("Face detected - resume timer?");
      
      // Play notification sound if enabled
      if (soundEnabled) {
        resumeSoundRef.current?.play().catch(err => console.log("Error playing sound:", err));
      }
    }
  }, [isPaused, isFullscreen, soundEnabled, setAlertMessage, setShowFaceAlert, setIsPaused]);

  // Fix the handleResumeTimer function to continue timer properly without resetting
  const handleResumeTimer = () => {
    console.log("▶️ User clicked Resume Timer - continuing timer");
    
    // Hide alert first
    setShowFaceAlert(false);
    
    // Turn off auto-pause flag
    if (typeof window !== 'undefined') {
      window.__faceAutoDetectionPause = false;
    }
    
    // Only restart timer if it was stopped completely
    setTimeout(() => {
      if (!timer) {
        console.log("Creating new timer interval");
        
        // Create a new interval that continues from current elapsed time
        const newInterval = setInterval(() => {
          setElapsedTime(prevTime => {
            const newTime = prevTime + 1;
            const totalSessionSeconds = sessionDuration * 60;
            
            // Check if session is complete
            if (newTime >= totalSessionSeconds) {
              console.log("Session complete");
              clearInterval(newInterval);
              setTimer(null);
              return totalSessionSeconds; // Cap at session duration
            }
            
            // Handle break logic (unchanged)
            if (!isBreak && breakInterval > 0 && newTime % (breakInterval * 60) === 0) {
              clearInterval(newInterval);
              setTimer(null);
              setIsBreak(true);
              setShowBreakNotification(true);
              playSound('/notification.mp3');
            }
            
            return newTime;
          });
        }, 1000);
        
        setTimer(newInterval);
      }
      
      // Resume timer without resetting elapsed time
      setIsPaused(false);
    }, 300);
  };

  // Clean up face timer when component unmounts
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
      if (faceTimeoutRef.current) {
        clearTimeout(faceTimeoutRef.current);
        faceTimeoutRef.current = null;
      }
    };
  }, [timer]);

  // Add back the ESC key event listener
  useEffect(() => {
    // Add escape key handler
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [pdfFile, isPaused, timer, isFullscreen, faceDetectionEnabled]);

  // Add a backup check to ensure face detection status is consistent
  useEffect(() => {
    // If face is present but we're still auto-paused, this means the detection worked
    // but the resume button may not have appeared. Add a backup check.
    if (facePresent && window.__faceAutoDetectionPause && isPaused && !showFaceAlert) {
      console.log("Detected face presence during auto-pause but alert not showing - fixing");
      setShowFaceAlert(true);
    }
    
    // If face is not present but we're showing the resume button, fix that
    if (!facePresent && showFaceAlert && window.__faceAutoDetectionPause) {
      console.log("Face not present but resume button showing - updating UI");
      // Set appropriate message
      setAlertMessage("Timer paused - no face detected");
    }
  }, [facePresent, isPaused, showFaceAlert, setAlertMessage]);

  // Modal alert component for face detection
  const AlertComponent = ({ show, message, onClose }) => {
    if (!show) return null;
    
    const handleResume = () => {
      // Reset auto-pause flag
      if (typeof window !== 'undefined') {
        window.__faceAutoDetectionPause = false;
      }
      
      // Resume timer
      handleResumeTimer();
      
      // Close alert
      onClose();
    };
    
    return (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity duration-300">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Study Timer</h3>
          <p className="mb-6 text-gray-600">{message}</p>
          <div className="flex justify-end space-x-3">
            {window.__faceAutoDetectionPause && (
              <button 
                onClick={handleResume} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Resume Timer
              </button>
            )}
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Calculate remaining time from session duration and elapsed time
  const getRemainingTime = () => {
    const totalSessionSeconds = sessionDuration * 60;
    const remainingSeconds = Math.max(0, totalSessionSeconds - elapsedTime);
    return remainingSeconds;
  };

  // Add a troubleshooting function for fullscreen and camera issues
  const troubleshootFullscreenAndCamera = () => {
    console.log("Troubleshooting fullscreen and camera...");
    
    // Check fullscreen state
    const isDocumentFullscreen = !!document.fullscreenElement || 
                               !!document.mozFullScreenElement ||
                               !!document.webkitFullscreenElement || 
                               !!document.msFullscreenElement;
                               
    console.log("Current fullscreen state:", isDocumentFullscreen);
    
    // Try to fix any mismatch
    if (isDocumentFullscreen !== isFullscreen) {
      console.log("Fixing fullscreen state mismatch");
      setIsFullscreen(isDocumentFullscreen);
    }
    
    // Re-enable face detection if it should be on
    if (isDocumentFullscreen && faceDetectionEnabled) {
      console.log("Reactivating face detection");
      // Add a slight delay before reactivating to ensure browser APIs are ready
      // This helps with the navigator.mediaDevices access
      setTimeout(() => {
        // First disable then enable to properly re-initialize
        setFaceDetectionEnabled(false);
        
        // Add extra delay before enabling
        setTimeout(() => {
          setFaceDetectionEnabled(true);
          console.log("Face detection reactivated after fullscreen change");
          
          // Ensure browser has proper access to camera APIs in fullscreen
          if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
            console.log("MediaDevices API is available after fullscreen");
          } else {
            console.warn("MediaDevices API is still not available after fullscreen");
          }
        }, 500);
      }, 200);
    }
  };

  // Add a button to manually enter fullscreen
  const enterFullscreenManually = () => {
    console.log("Attempting to enter fullscreen mode manually");
    
    try {
      const docElement = document.documentElement;
      if (docElement.requestFullscreen) {
        docElement.requestFullscreen()
          .then(() => {
            console.log("Fullscreen activated successfully");
            setIsFullscreen(true);
          })
          .catch(err => {
            console.error("Fullscreen permission denied:", err);
            alert("Could not enter fullscreen mode. Please use the study features without fullscreen.");
            setIsFullscreen(false);
          });
      } else if (docElement.mozRequestFullScreen) {
        docElement.mozRequestFullScreen()
          .catch(err => {
            console.error("Fullscreen error:", err);
            setIsFullscreen(false);
          });
      } else if (docElement.webkitRequestFullscreen) {
        docElement.webkitRequestFullscreen()
          .catch(err => {
            console.error("Fullscreen error:", err);
            setIsFullscreen(false);
          });
      } else if (docElement.msRequestFullscreen) {
        docElement.msRequestFullscreen()
          .catch(err => {
            console.error("Fullscreen error:", err);
            setIsFullscreen(false);
          });
      } else {
        console.log("No fullscreen API available");
        alert("Your browser doesn't support fullscreen mode. You can still use all features.");
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Error requesting fullscreen:", err);
      alert("Could not enter fullscreen mode. You can still use the study features without fullscreen.");
      setIsFullscreen(false);
    }
  };

  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      console.log("Requesting camera permission...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Stop the stream immediately since we just need permission
      stream.getTracks().forEach(track => track.stop());
      
      console.log("Camera permission granted");
      setCameraPermissionGranted(true);
      return true;
    } catch (error) {
      console.error("Camera permission denied:", error);
      alert("Camera access was denied. Face detection requires camera permissions.");
      return false;
    }
  };

  // New function to handle resuming from break
  const resumeFromBreak = () => {
    console.log("Resuming from break...");
    
    // Clear break flag first
    setIsBreak(false);
    setShowBreakNotification(false);
    
    // Make sure we're in fullscreen mode
    const isCurrentlyFullscreen = !!document.fullscreenElement || 
                               !!document.mozFullScreenElement ||
                               !!document.webkitFullscreenElement || 
                               !!document.msFullscreenElement;
                               
    if (!isCurrentlyFullscreen) {
      console.log("Requesting fullscreen on break resume");
      setTimeout(() => {
        try {
          const docElement = document.documentElement;
          if (docElement.requestFullscreen) {
            docElement.requestFullscreen()
              .then(() => {
                console.log("Successfully entered fullscreen on resume");
                setIsFullscreen(true);
              })
              .catch(err => {
                console.error("Error entering fullscreen:", err);
                alert("Couldn't enter fullscreen mode. You can continue studying in windowed mode.");
              });
          } else if (docElement.mozRequestFullScreen) {
            docElement.mozRequestFullScreen();
            setIsFullscreen(true);
          } else if (docElement.webkitRequestFullscreen) {
            docElement.webkitRequestFullscreen();
            setIsFullscreen(true);
          } else if (docElement.msRequestFullscreen) {
            docElement.msRequestFullscreen();
            setIsFullscreen(true);
          }
        } catch (err) {
          console.error("Error requesting fullscreen:", err);
        }
      }, 100);
    }
    
    // Resume timer with delay to ensure UI is updated
    setTimeout(() => {
      if (isPaused) {
        setIsPaused(false);
      }
      
      // Start a new timer if none exists
      if (!timer) {
        startTimer();
      }
      
      // Reactivate face detection if enabled
      if (faceDetectionEnabled) {
        // Quick toggle to refresh the face detection
        setFaceDetectionEnabled(false);
        setTimeout(() => setFaceDetectionEnabled(true), 200);
      }
    }, 300);
  };

  // Add a specific effect for handling fullscreen changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Listen for fullscreen changes and troubleshoot camera
      const handleFullscreenChange = () => {
        const isDocFullscreen = !!document.fullscreenElement || 
                           !!document.mozFullScreenElement ||
                           !!document.webkitFullscreenElement || 
                           !!document.msFullscreenElement;
                           
        console.log("Fullscreen change detected:", isDocFullscreen);
        
        // Update our state immediately
        setIsFullscreen(isDocFullscreen);
        
        // Give time for browser APIs to update in the new context
        // then run the troubleshooting
        setTimeout(() => {
          // Run troubleshooting after a brief delay to allow browser to stabilize
          troubleshootFullscreenAndCamera();
        }, 300);
      };
      
      // Add event listeners for all browser variants
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);
      
      return () => {
        // Remove listeners on cleanup
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      };
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-[#f0e6ef] text-gray-800 items-center p-4">
      <header className="w-full max-w-7xl flex justify-between items-center mb-8">
        {/* Removed the back arrow completely */}
        
        <h1 className="text-3xl font-bold">Virtual Study Room</h1>
        
        <div className="flex items-center space-x-2">
          {pdfFile && (
            <button 
              onClick={handleExitStudy} 
              className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition-colors"
              title="Exit Study Session"
            >
              Exit
            </button>
          )}
        </div>
      </header>

      {/* Fullscreen troubleshooting button */}
      {pdfFile && (
        <div className="fixed bottom-4 right-4 z-50">
          <button 
            onClick={troubleshootFullscreenAndCamera}
            className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full opacity-70 hover:opacity-100"
            title="Fix Camera Issues"
          >
            📷 Fix
          </button>
        </div>
      )}

      {/* Face Detection Component - works in both regular and fullscreen modes as long as camera permissions are given */}
      {pdfFile && faceDetectionEnabled && (
        <div className="fixed top-0 right-0 z-[1000]">
          <FaceDetection 
            onFaceStatus={handleFaceStatus}
            isFullscreen={true} // Always enable as long as PDF is loaded
            isPaused={isPaused}
          />
        </div>
      )}

      {/* Face detection status indicator */}
      {pdfFile && faceDetectionEnabled && (
        <div className="fixed top-4 right-4 bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded-full z-50">
          <div className="flex items-center">
            <span 
              className={`inline-block h-2 w-2 rounded-full mr-2 ${facePresent ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
            ></span>
            <span>{facePresent ? 'Face Detected' : 'No Face'}</span>
          </div>
        </div>
      )}

      {!pdfFile ? (
        <div className="w-full max-w-3xl">
          <div 
            className="drop-area border-2 border-dashed border-pink-300 rounded-xl w-full p-10 text-center mb-8 transition-colors hover:border-pink-400 bg-white bg-opacity-60"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400 mb-4">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <line x1="10" y1="9" x2="8" y2="9"></line>
              </svg>
              <h2 className="text-2xl font-semibold mb-2">Drag & Drop Your Study Material Here</h2>
              <p className="mb-4 text-gray-600">(Screen will go fullscreen & timer will start)</p>
              <p className="mb-6 text-sm text-gray-500">Face detection will automatically pause your timer when you're away</p>
              <input 
                type="file" 
                accept="application/pdf" 
                className="hidden" 
                id="fileInput"
                onChange={(e) => handleFiles(e.target.files)} 
              />
              <label 
                htmlFor="fileInput" 
                className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg text-lg"
              >
                Select PDF File
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-md">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Study Session Duration
              </label>
              <div className="flex items-center">
                <div className="flex-1 mr-2">
                  <label className="text-xs text-gray-500 mb-1 block">Minutes</label>
                  <input 
                    type="number" 
                    min="0"
                    max="720"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-300"
                    value={sessionDuration}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Math.max(0, Math.min(720, parseInt(e.target.value) || 0));
                      setSessionDuration(value);
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Seconds</label>
                  <input 
                    type="number" 
                    min="0"
                    max="59"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-300"
                    value={sessionDurationSeconds}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                      setSessionDurationSeconds(value);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-md">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Break Interval
              </label>
              <div className="flex items-center">
                <div className="flex-1 mr-2">
                  <label className="text-xs text-gray-500 mb-1 block">Minutes</label>
                  <input 
                    type="number" 
                    min="0"
                    max="720"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-300"
                    value={breakInterval}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Math.max(0, Math.min(720, parseInt(e.target.value) || 0));
                      setBreakInterval(value);
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Seconds</label>
                  <input 
                    type="number" 
                    min="0"
                    max="59"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-300"
                    value={breakIntervalSeconds}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                      setBreakIntervalSeconds(value);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-md">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Break Duration
              </label>
              <div className="flex items-center">
                <div className="flex-1 mr-2">
                  <label className="text-xs text-gray-500 mb-1 block">Minutes</label>
                  <input 
                    type="number" 
                    min="0"
                    max="720"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-300"
                    value={breakDuration}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Math.max(0, Math.min(720, parseInt(e.target.value) || 0));
                      setBreakDuration(value);
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Seconds</label>
                  <input 
                    type="number" 
                    min="0"
                    max="59"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-300"
                    value={breakDurationSeconds}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                      setBreakDurationSeconds(value);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Face detection settings */}
          <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-md mb-8">
            <h3 className="text-lg font-semibold mb-2">Face Detection Settings</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="faceDetection"
                checked={faceDetectionEnabled}
                onChange={(e) => setFaceDetectionEnabled(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
              />
              <label htmlFor="faceDetection" className="text-sm">
                Enable face detection (pauses timer when you're away)
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This feature uses your camera to detect if you're present and automatically pauses your timer when you step away during study.
            </p>
          </div>

          <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Study Room Features</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">🔍</span>
                <span>Upload and read PDF study materials with built-in viewer</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">⏱️</span>
                <span>Customizable study timers with automatic break reminders</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">🧘‍♀️</span>
                <span>Guided breathing exercises during breaks to help you relax</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">🔒</span>
                <span>Fullscreen mode to minimize distractions</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">📝</span>
                <span>Take and save notes while you study</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">🎵</span>
                <span>Background music options to improve focus</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">👤</span>
                <span>Face detection to pause timer when you step away</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">🔍</span>
                <span>Zoom and rotate controls for better reading experience</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">⌨️</span>
                <span>Keyboard shortcuts for faster navigation</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          {/* Centered timer display */}
          <div className="w-full text-center mb-6">
            <div className="inline-flex items-center">
              <h2 className="text-3xl font-bold mr-3">Study Time</h2>
              <span className="text-3xl font-bold text-pink-500">
                {formatTimeDisplay(getRemainingTime())}
              </span>
            </div>
          </div>
          
          <div className={`w-full flex ${showNotes ? 'flex-row' : 'flex-col'} items-center relative`}>
            <div className={`${showNotes ? 'w-3/4 pr-4' : 'w-full'} flex flex-col items-center`}>
              <div className={`flex justify-between items-center w-full max-w-4xl mb-4 ${!showToolbar ? 'opacity-0 hover:opacity-100 transition-opacity duration-300' : ''}`}>
                <div className="flex-1"></div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={toggleFocusMode} 
                    className="bg-purple-100 text-purple-700 p-2 rounded-lg hover:bg-purple-200 transition-colors"
                    title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                  >
                    {focusMode ? "🔍" : "👁️"}
                  </button>
                  
                  <button 
                    onClick={() => setShowSummarizer(true)} 
                    className="bg-yellow-100 text-yellow-700 p-2 rounded-lg hover:bg-yellow-200 transition-colors"
                    title="Open Notes Summarizer"
                  >
                    📋
                  </button>
                  
                  <button 
                    onClick={() => setShowAI(true)} 
                    className="bg-blue-100 text-blue-700 p-2 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Ask SUGAI AI"
                  >
                    🤖
                  </button>
                  
                  <button 
                    onClick={toggleNotes} 
                    className={`p-2 rounded-lg transition-colors ${showNotes ? 'bg-green-200 text-green-700' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                    title="Toggle Notes Panel"
                  >
                    📝
                  </button>
                  
                  <button 
                    onClick={toggleMusic} 
                    className={`p-2 rounded-lg transition-colors ${playingMusic ? 'bg-blue-200 text-blue-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                    title={playingMusic ? "Pause Music" : "Play Music"}
                  >
                    {playingMusic ? "🔇" : "🎵"}
                  </button>
                </div>
              </div>
              
              {/* Music selector */}
              {playingMusic && showToolbar && (
                <div className="flex justify-center w-full max-w-4xl mb-4">
                  <div className="bg-blue-50 p-2 rounded-lg flex space-x-2">
                    {Object.entries(musicOptions).map(([type, url]) => (
                      <button 
                        key={type}
                        onClick={() => changeMusic(type)}
                        className={`px-3 py-1 rounded ${selectedMusicType === type ? 'bg-blue-500 text-white' : 'bg-blue-100 hover:bg-blue-200'}`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className={`w-full max-w-4xl bg-white p-4 rounded-lg shadow-lg relative ${focusMode ? 'shadow-2xl ring-4 ring-purple-200' : ''}`}>
                <div className={`flex justify-between items-center mb-2 ${!showToolbar ? 'opacity-0 hover:opacity-100 transition-opacity duration-300' : ''}`}>
                  <div className="flex space-x-2">
                    <button 
                      onClick={goToPreviousPage} 
                      disabled={currentPage <= 1}
                      className="bg-pink-100 text-pink-700 p-2 rounded-lg disabled:opacity-50 hover:bg-pink-200 transition-colors"
                    >
                      ❮ Previous
                    </button>
                    <div className="bg-gray-100 px-3 py-2 rounded-lg">
                      Page {currentPage} of {numPages || '--'} {pagesRead > 0 && `(${Math.round((pagesRead / studyGoal) * 100)}% of goal)`}
                    </div>
                    <button 
                      onClick={goToNextPage} 
                      disabled={currentPage >= numPages}
                      className="bg-pink-100 text-pink-700 p-2 rounded-lg disabled:opacity-50 hover:bg-pink-200 transition-colors"
                    >
                      Next ❯
                    </button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleZoomOut}
                      className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                      title="Zoom Out"
                    >
                      🔍-
                    </button>
                    <div className="bg-gray-100 px-3 py-2 rounded-lg">
                      {Math.round(zoomLevel * 100)}%
                    </div>
                    <button 
                      onClick={handleZoomIn}
                      className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                      title="Zoom In"
                    >
                      🔍+
                    </button>
                    <button 
                      onClick={handleRotate}
                      className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                      title="Rotate"
                    >
                      🔄
                    </button>
                  </div>
                </div>
                
                <div className={`flex justify-center overflow-auto max-h-[calc(100vh-300px)] ${rotation === 90 || rotation === 270 ? 'items-start' : 'items-center'}`}>
                  <div className="relative">
                    <canvas ref={canvasRef} className="max-w-full"></canvas>
                    <div ref={textLayerRef} className="textLayer"></div>
                    
                    {/* Text selection hint - make it less intrusive */}
                    <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs opacity-30 hover:opacity-80 transition-opacity">
                      💡 Select text to summarize
                    </div>
                  </div>
                </div>
                
                {tabSwitches > 0 && (
                  <div className="absolute top-2 right-2 bg-red-100 text-red-800 px-3 py-1 rounded-lg text-sm">
                    Tab switches: {tabSwitches} 🤔
                  </div>
                )}
              </div>
            </div>
            
            {/* Notes Panel */}
            {showNotes && (
              <div className="w-1/4 bg-white rounded-lg shadow-lg p-4 ml-4 h-[calc(100vh-220px)] flex flex-col">
                <h3 className="text-xl font-semibold mb-2">Notes</h3>
                <div className="flex-1 overflow-auto mb-4">
                  {notes.length > 0 ? (
                    <div className="space-y-3">
                      {notes.map(note => (
                        <div key={note.id} className="bg-yellow-50 p-3 rounded shadow">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Page {note.page}</span>
                            <span>{note.timestamp}</span>
                          </div>
                          <p className="text-sm mb-2">{note.text}</p>
                          <button 
                            onClick={() => deleteNote(note.id)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No notes yet. Add notes about what you're studying!</p>
                  )}
                </div>
                <div className="mt-auto">
                  <textarea
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-300 focus:outline-none min-h-[100px] text-sm"
                    placeholder="Take notes here..."
                  ></textarea>
                  <button
                    onClick={addNote}
                    disabled={!currentNote.trim()}
                    className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg w-full disabled:opacity-50 transition-colors"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Face detection alert dialog */}
          {showFaceAlert && (
            <AlertComponent 
              show={showFaceAlert}
              message={alertMessage}
              onClose={() => setShowFaceAlert(false)}
            />
          )}
        </>
      )}
      
      {/* Exit Confirmation Dialog */}
      {showExitConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
            <h2 className="text-3xl font-bold text-red-600 mb-6">Study Session in Progress</h2>
            <p className="text-xl text-gray-700 mb-8">Your study session is not finished yet.</p>
            
            <div className="bg-gray-100 p-6 rounded-lg mb-6">
              <p className="text-xl font-semibold">Time remaining: <span className="text-red-500 font-bold">{formatTimeHMS(timeLeft)}</span></p>
            </div>
            
            <div className="flex justify-center gap-4">
              <button 
                onClick={handleExitAnyway}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-full text-lg transition-colors"
              >
                Exit Anyway
              </button>
              <button 
                onClick={handleContinueStudying}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full text-lg transition-colors"
              >
                Continue Studying
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Study Session Paused Dialog */}
      {showPauseDialog && !showExitConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-90">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Study Session Paused</h2>
            
            <p className="text-xl text-gray-700 mb-10">
              You have <span className="text-pink-500 font-bold">{formatTimeDisplay(timeLeft)}</span> remaining in your study session.
            </p>
            
            <div className="flex justify-center space-x-4">
              <button 
                onClick={handleContinueStudying}
                className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-4 px-6 rounded-full text-lg transition-colors w-1/2"
              >
                Continue Studying
              </button>
              <button 
                onClick={handleExitAnyway}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-full text-lg transition-colors w-1/2"
              >
                Exit Anyway
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Break Time Notification */}
      {showBreakNotification && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
            <h2 className="text-3xl font-bold text-blue-500 mb-2">Break Time!</h2>
            <p className="text-gray-700 text-lg mb-6">
              Time to take a short break and refresh your mind.
            </p>
            
            <div className="bg-gray-100 p-6 rounded-lg mb-6">
              <p className="text-xl font-semibold">Break time remaining: <span className="text-blue-500 font-bold">{formatTimeDisplay(timeLeft)}</span></p>
              
              {/* Progress bar for break timer */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000"
                  style={{ width: `${(timeLeft / ((breakDuration * 60) + parseInt(breakDurationSeconds || 0))) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <button 
              onClick={resumeFromBreak}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Continue
            </button>
            
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-2">During your break:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Look away from your screen</li>
                <li>• Stretch your body</li>
                <li>• Drink some water</li>
                <li>• Rest your eyes</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab switching warning */}
      {tabSwitches > 0 && !isBreak && (
        <div className={`fixed bottom-4 right-4 bg-red-100 text-red-800 p-3 rounded-lg shadow-lg max-w-xs transition-opacity ${showToolbar ? 'opacity-100' : 'opacity-0'}`}>
          <p className="font-semibold">Distraction Alert!</p>
          <p className="text-sm">You've switched tabs {tabSwitches} times during this study session.</p>
          <p className="text-xs mt-1">Try to stay focused on your studies.</p>
        </div>
      )}

      {/* Progress indicator */}
      {pdfFile && (
        <div className={`fixed bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg transition-opacity ${showToolbar ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center mb-1">
            <span className="text-sm font-medium mr-2">Study Goal:</span>
            <input
              type="number"
              min="1"
              max={numPages || 100}
              value={studyGoal}
              onChange={(e) => setStudyGoal(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <span className="text-sm ml-1">pages</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (pagesRead / studyGoal) * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {pagesRead} of {studyGoal} pages ({Math.round((pagesRead / studyGoal) * 100)}%)
          </p>
        </div>
      )}

      {/* Keyboard shortcuts help */}
      {pdfFile && (
        <button 
          className={`fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full transition-opacity ${showToolbar ? 'opacity-100' : 'opacity-0'} ${showNotes ? 'right-[calc(25%+1rem)]' : ''} ${tabSwitches > 0 ? 'bottom-24' : ''}`}
          onClick={() => alert("Keyboard Shortcuts:\n\n→ Next Page\n← Previous Page\n+ Zoom In\n- Zoom Out\nr Rotate\nf Toggle Focus Mode\nm Toggle Music\nn Toggle Notes Panel")}
          title="Keyboard Shortcuts"
        >
          ⌨️
        </button>
      )}

      {/* Recovery Dialog */}
      {showRecoveryDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Restore Study Session</h2>
            
            <p className="text-xl text-gray-700 mb-8">
              Would you like to restore your previous study session?
            </p>
            
            <div className="flex justify-center gap-4">
              <button 
                onClick={restoreSavedSession}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full text-lg transition-colors"
              >
                Restore
              </button>
              <button 
                onClick={startNewSession}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-full text-lg transition-colors"
              >
                Start New Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUGAI AI chatbot */}
      {showAI && <SugaiAI onClose={() => setShowAI(false)} />}

      {/* Notes Summarizer */}
      {showSummarizer && <NoteSummarizer onClose={() => setShowSummarizer(false)} />}

      {faceDetectionEnabled && !pdfFile && (
        <div className="mt-4 text-center">
          <p className="text-gray-600 mb-2">
            Face detection will start automatically when you upload a PDF.
          </p>
        </div>
      )}

      {/* Face Detection component - render when PDF is loaded and face detection is enabled */}
      {pdfFile && faceDetectionEnabled && (
        <FaceDetection
          onFaceStatus={handleFaceStatus}
          isPaused={isPaused}
          isFullscreen={isFullscreen}
        />
      )}

      <style jsx>{`
        .breathing-circle {
          transition: transform 4s ease-in-out, background-color 4s ease-in-out;
        }
        
        @keyframes breathe {
          0%, 100% { transform: scale(1); background-color: rgb(96, 165, 250); }
          50% { transform: scale(1.5); background-color: rgb(74, 222, 128); }
        }
        
        .drop-area {
          transition: border-color 0.2s ease;
          border-width: 2px;
          border-style: dashed;
        }
      `}</style>
    </main>
  );
}