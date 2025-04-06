"use client";

import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceDetection = ({ onFaceStatus, isFullscreen, isPaused }) => {
  // References
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const busyRef = useRef(false);
  
  // State
  const [faceDetected, setFaceDetected] = useState(false); // Start with no face detected
  const [modelLoaded, setModelLoaded] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  // Face detection counters
  const faceCountRef = useRef(0);
  const noFaceCountRef = useRef(0);
  
  // Load models immediately on component mount
  useEffect(() => {
    async function loadModels() {
      try {
        console.log("Loading face detection models...");
        
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        
        console.log("Face detection models loaded successfully!");
        setModelLoaded(true);
      } catch (error) {
        console.error("Failed to load face detection models:", error);
      }
    }
    
    loadModels();
    
    // Always start with debug mode to troubleshoot
    setShowDebug(true);
    const debugTimer = setTimeout(() => setShowDebug(false), 10000);
    
    return () => clearTimeout(debugTimer);
  }, []);
  
  // Camera initialization
  useEffect(() => {
    async function setupCamera() {
      if (!modelLoaded) return;
      
      try {
        // Stop any existing stream first
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = videoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
        }
        
        console.log("Starting camera...");
        
        // Check if navigator and mediaDevices exist
        if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error("Camera access is not supported in this browser or context");
          console.log("Navigator mediaDevices availability:", 
            navigator ? (navigator.mediaDevices ? "Available" : "Not available") : "Navigator not available");
            
          // Set a timeout to retry camera setup in fullscreen mode
          setTimeout(() => {
            console.log("Retrying camera setup after delay...");
            setupCamera();
          }, 1000);
          
          return;
        }
        
        try {
          // Request camera permission automatically
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 320 },
              height: { ideal: 240 }
            }
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play().catch(e => console.error("Video play error:", e));
            };
            console.log("Camera started successfully");
            
            // Show debug view for better visibility initially
            setShowDebug(true);
            setTimeout(() => setShowDebug(false), 8000);
            
            // Inform parent component about camera permission
            if (typeof window !== 'undefined') {
              window.__cameraPermissionGranted = true;
            }
          }
        } catch (permissionError) {
          console.error("Camera permission denied:", permissionError);
          
          // Don't show alert as it's disruptive, just log to console
          console.warn("Face detection requires camera permissions.");
          
          if (typeof window !== 'undefined') {
            window.__cameraPermissionGranted = false;
          }
        }
      } catch (error) {
        console.error("Error starting camera:", error);
      }
    }
    
    setupCamera();
    
    return () => {
      // Clean up camera on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [modelLoaded, isFullscreen]);
  
  // Detection loop
  useEffect(() => {
    // Only start detection when model is loaded
    if (!modelLoaded) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    
    // If isPaused and it's NOT an auto-pause (from face detection),
    // then we should stop detection
    if (isPaused && !window.__faceAutoDetectionPause) {
      console.log("Timer manually paused - stopping face detection");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    
    // Only continue if either not paused or auto-paused
    if (!isPaused || window.__faceAutoDetectionPause) {
      // Reset face detection counters
      faceCountRef.current = 0;
      noFaceCountRef.current = 0;
    
      // Start detection if it's not already running
      if (!intervalRef.current) {
        console.log("Starting face detection interval...");
        
        // Start detection interval
        intervalRef.current = setInterval(detectFace, 400);
        
        // Run detection once immediately
        detectFace();
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [modelLoaded, isPaused, faceDetected, showDebug]);
  
  // When user explicitly resumes from auto-pause,
  // update our global state tracker
  useEffect(() => {
    // When isPaused changes from true to false,
    // we're likely resuming
    if (!isPaused) {
      // Reset auto-pause flag
      window.__faceAutoDetectionPause = false;
    }
  }, [isPaused]);
  
  // Add a helper to track auto-pause state
  useEffect(() => {
    // Set up a global variable to track if pause was due to face detection
    // This helps coordinate between components
    if (typeof window !== 'undefined' && window) {
      window.__faceAutoDetectionPause = window.__faceAutoDetectionPause || false;
    }
    
    return () => {
      if (typeof window !== 'undefined' && window) {
        window.__faceAutoDetectionPause = false;
      }
    };
  }, []);
  
  // Detection function
  async function detectFace() {
    if (busyRef.current || !videoRef.current || !videoRef.current.readyState || !canvasRef.current) return;
    
    // Set busy flag to prevent concurrent detections
    busyRef.current = true;
    
    try {
      // Using higher confidence threshold to be more strict
      const options = new faceapi.TinyFaceDetectorOptions({ 
        minConfidence: 0.5,  // Require higher confidence for face detection
        inputSize: 160       // Smaller input for faster processing
      });
      
      const detection = await faceapi.detectSingleFace(videoRef.current, options);
      const isFaceVisible = !!detection;
      
      // Get confidence score for logging
      const confidenceScore = detection ? detection.score : 0;
      console.log(`Face detection: ${isFaceVisible ? 'FOUND' : 'NOT FOUND'}, Confidence: ${confidenceScore.toFixed(2)}`);
      
      // Draw detection result on canvas for debugging
      if (showDebug && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        if (detection) {
          // Make canvas match video dimensions
          const displaySize = { 
            width: videoRef.current.videoWidth || 320, 
            height: videoRef.current.videoHeight || 240 
          };
          faceapi.matchDimensions(canvasRef.current, displaySize);
          
          // Draw face detection box
          const resizedDetections = faceapi.resizeResults(detection, displaySize);
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
          
          // Draw confidence score
          ctx.font = '14px Arial';
          ctx.fillStyle = 'green';
          ctx.fillText(`Confidence: ${confidenceScore.toFixed(2)}`, 10, 20);
        } else {
          // Show "No Face" message
          ctx.font = '18px Arial';
          ctx.fillStyle = 'red';
          ctx.fillText('No Face Detected', 10, 30);
        }
      }
      
      // Update face detection state - more strict thresholds
      if (isFaceVisible && confidenceScore > 0.5) {
        faceCountRef.current++;
        noFaceCountRef.current = 0;
        
        // Require at least 2 consecutive detections to confirm face is present
        if (!faceDetected && faceCountRef.current >= 2) {
          console.log("✅ FACE CONFIRMED: Updating state to FACE DETECTED");
          setFaceDetected(true);
          onFaceStatus(true);
        }
      } else {
        noFaceCountRef.current++;
        faceCountRef.current = 0;
        
        // Immediately set to no face detected to be more responsive
        if (faceDetected && noFaceCountRef.current >= 2) {
          console.log("❌ NO FACE CONFIRMED: Updating state to FACE NOT DETECTED");
          setFaceDetected(false);
          onFaceStatus(false);
        }
      }
    } catch (error) {
      console.error("Error in face detection:", error);
    } finally {
      // Clear busy flag to allow next detection
      busyRef.current = false;
    }
  }
  
  // Add click handler to toggle debug view
  const toggleDebug = () => {
    setShowDebug(prev => !prev);
  };
  
  return (
    <div className="face-detection-container">
      {/* Video element - hidden by default, shown when debugging */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width={320}
        height={240}
        onLoadedMetadata={() => console.log("Video loaded and ready")}
        style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          width: showDebug ? '240px' : '2px',
          height: showDebug ? '180px' : '2px',
          borderRadius: '8px',
          border: faceDetected ? '3px solid #4ade80' : '3px solid #ef4444',
          opacity: showDebug ? 0.9 : 0.01,
          zIndex: 999,
          transition: 'all 0.3s ease',
          transform: 'scaleX(-1)' // Mirror the video for more intuitive experience
        }}
      />
      
      {/* Canvas for drawing face detection - only visible in debug mode */}
      <canvas
        ref={canvasRef}
        width={320}
        height={240}
        style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          width: showDebug ? '240px' : '2px',
          height: showDebug ? '180px' : '2px',
          zIndex: 1000,
          opacity: showDebug ? 1 : 0,
          pointerEvents: 'none',
          transform: 'scaleX(-1)' // Mirror the canvas to match video
        }}
      />
      
      {/* Debug toggle button - always visible */}
      <div
        onClick={toggleDebug}
        style={{
          position: 'fixed',
          bottom: 10,
          right: showDebug ? '260px' : '10px',
          backgroundColor: faceDetected ? 'rgba(74, 222, 128, 0.9)' : 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          fontWeight: 'bold',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '13px',
          cursor: 'pointer',
          zIndex: 1001,
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}
      >
        {faceDetected ? 
          <>👤 Face Detected {showDebug && '(Debug Mode)'}</> : 
          <>❌ No Face Detected {showDebug && '(Debug Mode)'}</>
        }
      </div>
    </div>
  );
};

export default FaceDetection; 