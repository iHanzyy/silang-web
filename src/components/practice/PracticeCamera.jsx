"use client";

import { useEffect, useRef, useState } from "react";

const CANVAS_W = 640;
const CANVAS_H = 480;
const HOLD_DURATION = 2000;
const CONF_TH = 0.8;
const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function PracticeCamera({ onPrediction }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkCanvasRef = useRef(null);
  const modelRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  
  const lastLetterRef = useRef(null);
  const holdStartRef = useRef(0);
  
  const [loading, setLoading] = useState(true);
  const [modelLoading, setModelLoading] = useState(true);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [initError, setInitError] = useState(null);
  const [pred, setPred] = useState("-");
  const [conf, setConf] = useState("-");
  const [okHold, setOkHold] = useState(false);
  
  // Normalize landmarks - exactly as in HTML
  function normalizeLandmarks(landmarks, wrist) {
    return landmarks.map(lm => [lm.x - wrist.x, lm.y - wrist.y, lm.z - wrist.z]);
  }
  
  // Process landmarks - exactly as in HTML
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

  useEffect(() => {
    // Script loading function
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };
    
    // App initialization - closely matching the HTML implementation
    async function initApp() {
      try {
        setLoading(true);
        setInitError(null);
        
        // Step 1: Load all scripts
        console.log("Loading scripts...");
        try {
          // Load scripts in same order as the working HTML
          await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.min.js");
          await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js");
          await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
          await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.14.0/dist/tf.min.js");
          console.log("✅ All scripts loaded");
        } catch (scriptErr) {
          throw new Error(`Failed to load required libraries: ${scriptErr.message}`);
        }
        
        // Step 2: Initialize canvas elements
        const canvas = canvasRef.current;
        const landmarkCanvas = landmarkCanvasRef.current;
        const video = videoRef.current;
        
        canvas.width = landmarkCanvas.width = CANVAS_W;
        canvas.height = landmarkCanvas.height = CANVAS_H;
        
        const ctx = canvas.getContext('2d');
        const landmarkCtx = landmarkCanvas.getContext('2d');
        
        // Step 3: Load model
        setModelLoading(true);
        try {
          console.log("Loading model...");
          try {
            modelRef.current = await window.tf.loadGraphModel('/ai/model.json');
          } catch (err) {
            console.log("Trying alternate model path...");
            modelRef.current = await window.tf.loadGraphModel('/model.json');
          }
          console.log("✅ Model loaded successfully!");
        } catch (modelErr) {
          console.error("❌ Failed to load model:", modelErr);
          // Non-fatal error, continue without model
        } finally {
          setModelLoading(false);
        }
        
        // Step 4: Initialize MediaPipe Hands - exactly as in HTML
        console.log("Initializing hand detection...");
        const hands = new window.Hands({ 
          locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` 
        });
        
        hands.setOptions({ 
          maxNumHands: 2, 
          modelComplexity: 1, 
          minDetectionConfidence: 0.7, 
          minTrackingConfidence: 0.5 
        });
        
        hands.onResults((results) => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          landmarkCtx.clearRect(0, 0, landmarkCanvas.width, landmarkCanvas.height);
          
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            for (const landmarks of results.multiHandLandmarks) {
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
        });
        
        handsRef.current = hands;
        
        // Step 5: Initialize camera - exactly as in HTML
        console.log("Starting camera...");
        setCameraLoading(true);
        try {
          const camera = new window.Camera(video, {
            onFrame: async () => {
              try {
                await hands.send({ image: video });
              } catch (e) {
                console.warn("Frame processing error:", e);
              }
            },
            width: CANVAS_W,
            height: CANVAS_H
          });
          
          cameraRef.current = camera;
          await camera.start();
          console.log("✅ Camera started successfully!");
        } catch (cameraErr) {
          console.error("❌ Camera error:", cameraErr);
          throw new Error(`Failed to access camera: ${cameraErr.message}`);
        } finally {
          setCameraLoading(false);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Initialization error:", err);
        setInitError(err.message || "Terjadi kesalahan saat memuat aplikasi");
        setLoading(false);
      }
    }

    // Start the app
    initApp();

    // Cleanup function
    return () => {
      if (cameraRef.current) {
        try {
          cameraRef.current.stop();
        } catch (e) {
          console.warn("Error stopping camera:", e);
        }
      }
      
      if (handsRef.current) {
        try {
          handsRef.current.close();
        } catch (e) {
          console.warn("Error closing hands:", e);
        }
      }
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="relative" style={{ width: CANVAS_W, height: CANVAS_H }}>
      {/* This container mimics the HTML example */}
      <div className="relative w-full h-full">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className="hidden" 
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CANVAS_W,
            height: CANVAS_H,
            borderRadius: 10,
            transform: "scale(-1, 1)"
          }}
        />
        <canvas
          ref={landmarkCanvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CANVAS_W,
            height: CANVAS_H,
            borderRadius: 10,
            transform: "scale(-1, 1)"
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
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
            >
              Coba Lagi
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
