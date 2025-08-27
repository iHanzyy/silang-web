"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import PracticeCamera from "./PracticeCamera";
import ModuleCompletionModal from "./ModuleCompletionModal";
import { MODULES, getModuleById } from "@/lib/practiceData";
import {
  getModuleProgress,
  setModuleProgress,
  ensureWordsForModule,
} from "@/lib/progress";
import { pickRandomVerbs } from "@/lib/practiceData";

export default function PracticeSession({ moduleId = "mod-1" }) {
  const module = getModuleById(moduleId);
  const [targets, setTargets] = useState([]); // huruf atau kata
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [prediction, setPrediction] = useState({ letter: "-", isHolding: false });
  
  // Add a ref to track if the animation is in progress
  const isAnimatingRef = useRef(false);
  // Track the last received prediction for debugging
  const lastPredictionRef = useRef({ letter: null, time: 0 });
  // Track if we've already processed this success to prevent double-processing
  const processedSuccessRef = useRef(false);

  // load data modul + progress
  useEffect(() => {
    if (!module) return;
    if (moduleId === "mod-6") {
      // modul kata kerja
      const words = ensureWordsForModule(moduleId, () => pickRandomVerbs(6));
      setTargets(words);
      const prog = getModuleProgress(moduleId);
      setCurrentIdx(prog.wordIdx || 0);
    } else {
      setTargets(module.range || []);
      const prog = getModuleProgress(moduleId);
      setCurrentIdx(prog.index || 0);
    }
    
    // Debug existing progress
    console.log(`Loaded module ${moduleId}, current progress:`, getModuleProgress(moduleId));
    
    // Reset all animation flags when module changes
    isAnimatingRef.current = false;
    processedSuccessRef.current = false;
  }, [moduleId, module]);

  // Reset processed flag when currentIdx changes
  useEffect(() => {
    processedSuccessRef.current = false;
  }, [currentIdx]);

  const handlePrediction = ({ letter, isHolding, holdPercent }) => {
    // Update the last received prediction
    lastPredictionRef.current = { letter, time: Date.now() };
    
    // Update state with the current prediction
    setPrediction({ letter, isHolding });
    setHoldProgress(holdPercent || 0);
    
    const target = targets[currentIdx];
    if (!target) return;

    const targetUpper = target.toUpperCase();
    
    // Fix the matching logic based on module type
    const isMatch = moduleId === "mod-6"
      ? letter === targetUpper[0] // match first letter of word for module 6
      : letter === targetUpper;   // exact letter match for other modules

    // Enhanced debug logging
    console.log(`🔍 DEBUG: letter="${letter}", target="${targetUpper}", isMatch=${isMatch}, isHolding=${isHolding}, holdPercent=${holdPercent}, processed=${processedSuccessRef.current}, animating=${isAnimatingRef.current}`);

    // SIMPLE SUCCESS LOGIC - ketika sistem mendeteksi "Berhasil!" di kamera
    if (isMatch && isHolding && !processedSuccessRef.current && !isAnimatingRef.current) {
      console.log("🚀 SUCCESS DETECTED! Moving to next letter...");
      
      // Mark as processed immediately to prevent double-processing
      processedSuccessRef.current = true;
      isAnimatingRef.current = true;
      
      // Show success animation
      setShowSuccess(true);
      
      // Progress to next letter
      const nextIdx = currentIdx + 1;
      const isModuleComplete = nextIdx >= targets.length;
      
      console.log(`📈 Moving from index ${currentIdx} to ${nextIdx}`);
      console.log(`📊 BEFORE UPDATE - Current progress:`, getModuleProgress(moduleId));
      
      // Update progress in localStorage immediately
      if (moduleId === "mod-6") {
        setModuleProgress(moduleId, {
          wordIdx: nextIdx,
          index: nextIdx,              // penting untuk kartu progress
          completed: isModuleComplete,
        });
        console.log(`📊 Updated wordIdx/index to ${nextIdx} for module ${moduleId}`);
      } else {
        setModuleProgress(moduleId, {
          index: nextIdx,
          completed: isModuleComplete,
        });
        console.log(`📊 Updated index to ${nextIdx} for module ${moduleId}`);
      }

      // Update UI state segera (clamp optional)
      setCurrentIdx(nextIdx);
      
      // Wait for animation, then cleanup
      setTimeout(() => {
        setShowSuccess(false);
        isAnimatingRef.current = false;
        console.log(`✅ Animation complete. Current index is now ${nextIdx}`);
        
        // Force re-read from localStorage to verify
        const finalProgress = getModuleProgress(moduleId);
        console.log(`📊 Final verification - Progress:`, finalProgress);
        
        // Show completion modal if module is complete
        if (isModuleComplete) {
          console.log("🎉 MODULE COMPLETED! Showing completion modal...");
          setShowCompletionModal(true);
        }
      }, 1500);
    }
  };

  // Debug hook to check for stuck progress
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const lastPrediction = lastPredictionRef.current;
      
      // If we haven't received a prediction in 5 seconds, log a warning
      if (lastPrediction.letter && now - lastPrediction.time > 5000) {
        console.warn("⚠️ No predictions received in the last 5 seconds. Last prediction:", lastPrediction);
      }
      
      // Log current state every 10 seconds for debugging
      console.log(`🔄 Current state: target="${targets[currentIdx]}", prediction="${prediction.letter}", isHolding=${prediction.isHolding}, holdProgress=${holdProgress}%`);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [targets, currentIdx, prediction, holdProgress]);

  if (!module) {
    return <div className="text-center text-white">Modul tidak ditemukan.</div>;
  }

  const target = targets[currentIdx] || null;
  
  // Fix the isCorrectLetter calculation
  const isCorrectLetter = moduleId === "mod-6"
    ? prediction.letter === target?.charAt(0).toUpperCase()
    : prediction.letter === target?.toUpperCase();

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 items-start justify-center p-6">
        {/* Kiri: Kamera */}
        <div className="flex-shrink-0 relative">
          <PracticeCamera onPrediction={handlePrediction} />
          
          {/* Hold progress indicator */}
          {prediction.isHolding && isCorrectLetter && holdProgress > 0 && (
            <div className="absolute bottom-4 left-0 right-0 mx-auto w-3/4 bg-black bg-opacity-50 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-green-400 h-full transition-all duration-100 ease-linear"
                style={{ width: `${holdProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Kanan: Target + Progress */}
        <div className="flex flex-col gap-4 items-center text-white w-full max-w-md">
          {/* Debug info */}
          <div className="bg-black bg-opacity-50 p-2 rounded text-xs">
            <div>Target: {target}</div>
            <div>Predicted: {prediction.letter}</div>
            <div>Is Correct: {isCorrectLetter ? "✅" : "❌"}</div>
            <div>Is Holding: {prediction.isHolding ? "✅" : "❌"}</div>
            <div>Hold Progress: {holdProgress}%</div>
            <div>Current Index: {currentIdx}</div>
            <div>Animation: {isAnimatingRef.current ? "Running" : "Idle"}</div>
            <div>Processed: {processedSuccessRef.current ? "Yes" : "No"}</div>
          </div>

          {target && (
            <div className="flex flex-col items-center gap-3 relative">
              {/* Gambar huruf (khusus modul 1-5) */}
              {moduleId !== "mod-6" && (
                <img
                  src={`/letters/${target}.png`}
                  alt={target}
                  className="w-32 h-32 object-contain"
                  key={`img-${target}`}
                  onLoad={() => console.log(`🖼️ Image loaded for letter: ${target}`)}
                  onError={() => console.error(`❌ Image failed to load for letter: ${target}`)}
                />
              )}

              {/* Huruf besar */}
              <div className={`text-4xl font-bold ${isCorrectLetter && prediction.isHolding ? "text-yellow-400" : ""}`}>
                {target.toUpperCase()}
              </div>

              {/* Kata kerja (khusus modul 6) */}
              {moduleId === "mod-6" && (
                <div className="text-2xl text-yellow-200 font-semibold">
                  {target.toUpperCase()}
                </div>
              )}
            </div>
          )}

          {/* Progress box */}
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {targets.map((t, idx) => {
              const done = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <div
                  key={idx}
                  className={`w-10 h-10 flex items-center justify-center rounded-md font-bold ${
                    done ? "bg-yellow-400 text-black" : 
                    isCurrent ? "bg-white text-black ring-2 ring-yellow-300" : 
                    "bg-white text-black"
                  }`}
                >
                  {moduleId === "mod-6" ? t[0].toUpperCase() : t}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && (
          <ModuleCompletionModal
            moduleId={moduleId}
            onClose={() => setShowCompletionModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
