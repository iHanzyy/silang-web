"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const CANVAS_W = 640;
const CANVAS_H = 480;
const HOLD_DURATION = 2000;
const CONF_TH = 0.8;
const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Global flag to track if the component is mounted
// This helps prevent memory leaks and resource conflicts
let isMounted = false;

// CRITICAL: Set up MediaPipe config before anything else
if (typeof window !== "undefined") {
  // Clear any existing Module first to avoid conflicts
  window.Module = {
    // This specific locateFile config is crucial
    locateFile: function(path, prefix) {
      if (path.endsWith('.data') || path.endsWith('.wasm')) {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${path}`;
      }
      return `${prefix}${path}`;
    },
    // Extra flag to prevent concurrent initialization
    _isInitializing: false
  };
}

export default function PracticeCamera({ onPrediction }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkCanvasRef = useRef(null);
  const modelRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const instanceIdRef = useRef(`practice-camera-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
  
  const router = useRouter();
  
  const lastLetterRef = useRef(null);
  const holdStartRef = useRef(0);
  
  const [loading, setLoading] = useState(true);
  const [modelLoading, setModelLoading] = useState(true);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [initError, setInitError] = useState(null);
  const [initAttempt, setInitAttempt] = useState(0);
  const [pred, setPred] = useState("-");
  const [conf, setConf] = useState("-");
  const [okHold, setOkHold] = useState(false);
  
  // Function to normalize landmarks from hand detection
  function normalizeLandmarks(landmarks, wrist) {
    return landmarks.map(lm => [lm.x - wrist.x, lm.y - wrist.y, lm.z - wrist.z]);
  }
  
  // Process landmarks from MediaPipe Hands
  function processLandmarks(multiHandLandmarks) {
    let features = [];
    
    if (!multiHandLandmarks || !multiHandLandmarks.length || !modelRef.current) {
      setPred("-");
      setConf("-");
      setOkHold(false);
      lastLetterRef.current = null;
      holdStartRef.current = 0;
      
      if (onPrediction) {
        onPrediction({ letter: "-", confidence: "-", isHolding: false });
      }
      return;
    }
    
    if (multiHandLandmarks.length === 1) {
      const leftHand = Array(63).fill(0);
      features.push(...leftHand);
      const rightHand = normalizeLandmarks(multiHandLandmarks[0], multiHandLandmarks[0][0]);
      rightHand.forEach(coord => features.push(...coord));
    } else if (multiHandLandmarks.length === 2) {
      const sortedHands = [...multiHandLandmarks].sort((a, b) => a[0].x - b[0].x);
      const leftHand = normalizeLandmarks(sortedHands[0], sortedHands[0][0]);
      const rightHand = normalizeLandmarks(sortedHands[1], sortedHands[1][0]);
      leftHand.forEach(coord => features.push(...coord));
      rightHand.forEach(coord => features.push(...coord));
    }
    
    if (features.length !== 126) features = Array(126).fill(0);
    
    // Create tensor and predict
    try {
      const inputTensor = window.tf.tensor2d([features], [1, 126]);
      const output = modelRef.current.predict(inputTensor);
      const predictions = output.arraySync()[0];
      const maxPrediction = Math.max(...predictions);
      const predictedClass = predictions.indexOf(maxPrediction);
      const confidence = (maxPrediction * 100).toFixed(1);
      
      if (maxPrediction > CONF_TH) {
        const letter = LABELS[predictedClass];
        setPred(letter);
        setConf(confidence);
        
        const now = Date.now();
        let isHolding = false;
        
        if (lastLetterRef.current === letter) {
          if (!holdStartRef.current) holdStartRef.current = now;
          isHolding = now - holdStartRef.current >= HOLD_DURATION;
          setOkHold(isHolding);
        } else {
          lastLetterRef.current = letter;
          holdStartRef.current = now;
          setOkHold(false);
        }
        
        if (onPrediction) {
          onPrediction({ letter, confidence, isHolding });
        }
      } else {
        setPred("-");
        setConf("-");
        setOkHold(false);
        lastLetterRef.current = null;
        holdStartRef.current = 0;
        
        if (onPrediction) {
          onPrediction({ letter: "-", confidence: "-", isHolding: false });
        }
      }
      
      // Clean up tensors
      inputTensor.dispose();
      window.tf.dispose(output);
    } catch (err) {
      console.error("Prediction error:", err);
    }
  }

  // Aggressive cleanup of all resources
  const cleanupResources = async () => {
    console.log(`[${instanceIdRef.current}] Cleaning up resources...`);
    
    // Try to stop camera processing first
    if (cameraRef.current) {
      try {
        await cameraRef.current.stop();
        console.log(`[${instanceIdRef.current}] Camera stopped`);
      } catch (e) {
        console.warn(`[${instanceIdRef.current}] Error stopping camera:`, e);
      }
      cameraRef.current = null;
    }
    
    // Then close hands
    if (handsRef.current) {
      try {
        await handsRef.current.close();
        console.log(`[${instanceIdRef.current}] Hands closed`);
      } catch (e) {
        console.warn(`[${instanceIdRef.current}] Error closing hands:`, e);
      }
      handsRef.current = null;
    }
    
    // Stop any ongoing media tracks
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => {
          track.stop();
          console.log(`[${instanceIdRef.current}] Track stopped:`, track.kind);
        });
      } catch (e) {
        console.warn(`[${instanceIdRef.current}] Error stopping tracks:`, e);
      }
      
      try {
        videoRef.current.srcObject = null;
        videoRef.current.load();
      } catch (e) {
        console.warn(`[${instanceIdRef.current}] Error clearing video:`, e);
      }
    }
    
    // Clear canvases
    try {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      }
      
      if (landmarkCanvasRef.current) {
        const ctx = landmarkCanvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      }
    } catch (e) {
      console.warn(`[${instanceIdRef.current}] Error clearing canvases:`, e);
    }
    
    // Reset state
    setPred("-");
    setConf("-");
    setOkHold(false);
    lastLetterRef.current = null;
    holdStartRef.current = 0;
    
    // Extra cleanup for good measure
    if (window.Module && window.Module._isInitializing) {
      window.Module._isInitializing = false;
    }
  };

  // Script loading with version check
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        console.log(`[${instanceIdRef.current}] Script already exists: ${src}`);
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.crossOrigin = "anonymous";
      
      script.onload = () => {
        console.log(`[${instanceIdRef.current}] Script loaded: ${src}`);
        resolve();
      };
      
      script.onerror = (e) => {
        console.error(`[${instanceIdRef.current}] Script failed to load: ${src}`, e);
        reject(new Error(`Failed to load script: ${src}`));
      };
      
      document.head.appendChild(script);
    });
  };

  // Main initialization function
  useEffect(() => {
    // Set global mounted flag
    if (isMounted) {
      console.log(`[${instanceIdRef.current}] Component already mounted elsewhere, waiting...`);
      // Another instance is active, give it time to clean up
      const timer = setTimeout(() => {
        setInitAttempt(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    isMounted = true;
    console.log(`[${instanceIdRef.current}] Starting component mount, attempt ${initAttempt}`);
    
    async function initApp() {
      try {
        // First, ensure previous resources are cleaned up
        await cleanupResources();
        
        // Prevent concurrent initializations
        window.Module = window.Module || {};
        window.Module._isInitializing = true;
        
        setLoading(true);
        setInitError(null);
        setModelLoading(true);
        setCameraLoading(true);
        
        // Load scripts in EXACT same order as working HTML
        console.log(`[${instanceIdRef.current}] Loading scripts...`);
        try {
          // This order matches your working HTML
          await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.min.js");
          await new Promise(r => setTimeout(r, 500)); // Extra delay
          
          await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js");
          await new Promise(r => setTimeout(r, 300));
          
          await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
          await new Promise(r => setTimeout(r, 300));
          
          await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.14.0/dist/tf.min.js");
          await new Promise(r => setTimeout(r, 500)); // Extra delay
          
          console.log(`[${instanceIdRef.current}] All scripts loaded`);
        } catch (scriptErr) {
          throw new Error(`Failed to load required libraries: ${scriptErr.message}`);
        }
        
        // Verify scripts
        if (!window.Hands) throw new Error("MediaPipe Hands not loaded");
        if (!window.drawConnectors) throw new Error("MediaPipe drawing utils not loaded");
        if (!window.Camera) throw new Error("MediaPipe camera utils not loaded");
        if (!window.tf) throw new Error("TensorFlow.js not loaded");
        
        // Initialize canvas elements
        const canvas = canvasRef.current;
        const landmarkCanvas = landmarkCanvasRef.current;
        const video = videoRef.current;
        
        if (!canvas || !landmarkCanvas || !video) {
          throw new Error("Required DOM elements not found");
        }
        
        canvas.width = landmarkCanvas.width = CANVAS_W;
        canvas.height = landmarkCanvas.height = CANVAS_H;
        
        const ctx = canvas.getContext('2d');
        const landmarkCtx = landmarkCanvas.getContext('2d');
        
        // Load model
        setModelLoading(true);
        try {
          console.log(`[${instanceIdRef.current}] Loading AI model...`);
          try {
            modelRef.current = await window.tf.loadGraphModel('/ai/model.json');
          } catch (err) {
            console.log(`[${instanceIdRef.current}] Trying alternate path...`);
            try {
              modelRef.current = await window.tf.loadGraphModel('/model.json');
            } catch (err2) {
              console.warn(`[${instanceIdRef.current}] Model loading issue:`, err2);
              // Continue without model
            }
          }
        } catch (modelErr) {
          console.warn(`[${instanceIdRef.current}] Model loading issues:`, modelErr);
        } finally {
          setModelLoading(false);
        }
        
        // Initialize MediaPipe Hands
        console.log(`[${instanceIdRef.current}] Initializing hand detection...`);
        try {
          // Important: This will match your working HTML exactly
          const hands = new window.Hands({ 
            locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` 
          });
          
          // FIX: Don't use selfieMode here, we'll handle mirroring in the canvas
          hands.setOptions({ 
            maxNumHands: 2, 
            modelComplexity: 1, 
            minDetectionConfidence: 0.7, 
            minTrackingConfidence: 0.5 
          });
          
          hands.onResults((results) => {
            // Skip if component is unmounting
            if (!isMounted || !ctx || !landmarkCtx) return;
            
            // Clear both canvases
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            
            // FIX: Manually mirror the image by flipping the context
            ctx.scale(-1, 1);
            ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();
            
            landmarkCtx.clearRect(0, 0, landmarkCanvas.width, landmarkCanvas.height);
            landmarkCtx.save();
            landmarkCtx.scale(-1, 1);
            landmarkCtx.translate(-landmarkCanvas.width, 0);
            
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
              for (const landmarks of results.multiHandLandmarks) {
                if (!window.drawConnectors || !window.HAND_CONNECTIONS) {
                  console.warn(`[${instanceIdRef.current}] Drawing utilities not available`);
                  continue;
                }
                
                // Draw with exact same colors as your HTML
                window.drawConnectors(landmarkCtx, landmarks, window.HAND_CONNECTIONS, { 
                  color: '#12057d', 
                  lineWidth: 2 
                });
                window.drawLandmarks(landmarkCtx, landmarks, { 
                  color: '#dc3767', 
                  radius: 2 
                });
              }
              
              processLandmarks(results.multiHandLandmarks);
            } else {
              setPred("-");
              setConf("-");
              setOkHold(false);
              lastLetterRef.current = null;
              holdStartRef.current = 0;
              
              if (onPrediction) {
                onPrediction({ letter: "-", confidence: "-", isHolding: false });
              }
            }
            
            landmarkCtx.restore();
          });
          
          handsRef.current = hands;
          console.log(`[${instanceIdRef.current}] Hand detection initialized`);
        } catch (handsErr) {
          console.error(`[${instanceIdRef.current}] Hand detection initialization failed:`, handsErr);
          throw new Error(`Failed to initialize hand detection: ${handsErr.message}`);
        }
        
        // Initialize camera
        console.log(`[${instanceIdRef.current}] Starting camera...`);
        setCameraLoading(true);
        try {
          const camera = new window.Camera(video, {
            onFrame: async () => {
              try {
                if (handsRef.current) {
                  await handsRef.current.send({ image: video });
                }
              } catch (e) {
                // Don't log every frame error to avoid console spam
                if (e.message !== "Not enough memory") {
                  console.warn(`[${instanceIdRef.current}] Frame error:`, e.message);
                }
              }
            },
            width: CANVAS_W,
            height: CANVAS_H
          });
          
          cameraRef.current = camera;
          await camera.start();
          console.log(`[${instanceIdRef.current}] Camera started`);
        } catch (cameraErr) {
          console.error(`[${instanceIdRef.current}] Camera error:`, cameraErr);
          throw new Error(`Failed to access camera: ${cameraErr.message}`);
        } finally {
          setCameraLoading(false);
        }
        
        // Done!
        window.Module._isInitializing = false;
        setLoading(false);
      } catch (err) {
        console.error(`[${instanceIdRef.current}] Initialization error:`, err);
        setInitError(err.message || "Terjadi kesalahan saat memuat aplikasi");
        setLoading(false);
        window.Module._isInitializing = false;
      }
    }

    // Start initialization
    initApp();

    // Cleanup on unmount
    return () => {
      console.log(`[${instanceIdRef.current}] Component unmounting`);
      isMounted = false;
      cleanupResources();
    };
  }, [initAttempt]);

  const handleRetry = () => {
    // Force re-initialization
    setInitAttempt(prev => prev + 1);
  };

  return (
    <div className="relative" style={{ width: CANVAS_W, height: CANVAS_H }}>
      {/* Main container */}
      <div className="relative w-full h-full">
        {/* Keep video hidden but available */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className="hidden" 
        />
        
        {/* Canvas for video display (mirroring handled in JS now) */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CANVAS_W,
            height: CANVAS_H,
            borderRadius: 10
          }}
        />
        
        {/* Canvas for landmarks (mirroring handled in JS now) */}
        <canvas
          ref={landmarkCanvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CANVAS_W,
            height: CANVAS_H,
            borderRadius: 10
          }}
        />
      </div>

      {/* Loading Screen */}
      {loading && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-lg"
        >
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500 mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">Loading...</h2>
          <div className="space-y-2 text-center">
            {modelLoading && <p className="text-yellow-300">• Loading AI model...</p>}
            {cameraLoading && <p className="text-yellow-300">• Starting camera...</p>}
            <p className="text-zinc-400 text-sm mt-2">
              Please wait while we initialize the system
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {initError && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg p-4"
        >
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded max-w-md text-center">
            <p className="font-bold text-lg mb-2">Error</p>
            <p className="mb-4">{initError}</p>
            <button 
              onClick={handleRetry}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Coba Lagi
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      )}

      {/* Prediction Display */}
      {!loading && !initError && (
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
          <div className="bg-black bg-opacity-50 text-yellow-400 font-bold text-xl py-2 px-4 rounded-lg mb-2">
            Predicted: {pred}
          </div>
          <div className="bg-black bg-opacity-50 text-white py-1 px-3 rounded-md text-sm">
            Confidence: {conf}{conf !== "-" ? "%" : ""}
          </div>
          {okHold && (
            <div className="mt-2 bg-black bg-opacity-50 text-green-300 font-bold py-2 px-4 rounded-lg">
              ✅ Berhasil!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
