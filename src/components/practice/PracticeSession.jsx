"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, X } from "lucide-react";
import PracticeCamera from "./PracticeCamera";
import ModuleCompletionModal from "./ModuleCompletionModal";
import { MODULES, getModuleById } from "@/lib/practiceData";
import {
  getModuleProgress,
  setModuleProgress,
  ensureWordsForModule,
} from "@/lib/progress";
import { pickRandomVerbs } from "@/lib/practiceData";
import { orbitron, quicksand } from "@/lib/fonts";

export default function PracticeSession({ moduleId = "mod-1" }) {
  const router = useRouter();
  const module = getModuleById(moduleId);
  const [targets, setTargets] = useState([]); // huruf atau kata
  const [currentIdx, setCurrentIdx] = useState(0); // index kata saat ini
  const [letterIdx, setLetterIdx] = useState(0); // index huruf dalam kata (khusus mod-6)
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
      setLetterIdx(prog.letterIdx || 0);
    } else {
      setTargets(module.range || []);
      const prog = getModuleProgress(moduleId);
      setCurrentIdx(prog.index || 0);
      setLetterIdx(0); // tidak digunakan untuk mod 1-5
    }
    
    // Reset all animation flags when module changes
    isAnimatingRef.current = false;
    processedSuccessRef.current = false;
  }, [moduleId, module]);

  // Reset processed flag when currentIdx or letterIdx changes
  useEffect(() => {
    processedSuccessRef.current = false;
  }, [currentIdx, letterIdx]);

  const handlePrediction = ({ letter, isHolding, holdPercent }) => {
    // Update the last received prediction
    lastPredictionRef.current = { letter, time: Date.now() };
    
    // Update state with the current prediction
    setPrediction({ letter, isHolding });
    setHoldProgress(holdPercent || 0);
    
    const target = targets[currentIdx];
    if (!target) return;

    let targetLetter;
    let isMatch;

    if (moduleId === "mod-6") {
      // Untuk mod-6: ambil huruf berdasarkan letterIdx
      targetLetter = target[letterIdx]?.toUpperCase();
      isMatch = letter === targetLetter;
    } else {
      // Untuk mod 1-5: target adalah huruf langsung
      targetLetter = target.toUpperCase();
      isMatch = letter === targetLetter;
    }

    // SIMPLE SUCCESS LOGIC - ketika sistem mendeteksi "Berhasil!" di kamera
    if (isMatch && isHolding && !processedSuccessRef.current && !isAnimatingRef.current) {
      // Mark as processed immediately to prevent double-processing
      processedSuccessRef.current = true;
      isAnimatingRef.current = true;
      
      // Show success animation
      setShowSuccess(true);
      
      let nextWordIdx = currentIdx;
      let nextLetterIdx = letterIdx;
      let isModuleComplete = false;

      if (moduleId === "mod-6") {
        // Untuk mod-6: lanjut ke huruf berikutnya dalam kata
        nextLetterIdx = letterIdx + 1;
        
        // Jika sudah selesai kata ini, lanjut ke kata berikutnya
        if (nextLetterIdx >= target.length) {
          nextWordIdx = currentIdx + 1;
          nextLetterIdx = 0;
          isModuleComplete = nextWordIdx >= targets.length;
        }
      } else {
        // Untuk mod 1-5: lanjut ke huruf berikutnya
        nextWordIdx = currentIdx + 1;
        isModuleComplete = nextWordIdx >= targets.length;
      }
      
      // Update progress in localStorage immediately
      if (moduleId === "mod-6") {
        setModuleProgress(moduleId, {
          wordIdx: nextWordIdx,
          letterIdx: nextLetterIdx,
          index: nextWordIdx, // untuk kartu progress
          completed: isModuleComplete,
        });
      } else {
        setModuleProgress(moduleId, {
          index: nextWordIdx,
          completed: isModuleComplete,
        });
      }

      // Update UI state segera - trigger animasi dengan state change
      setCurrentIdx(nextWordIdx);
      setLetterIdx(nextLetterIdx);
      
      // Show completion modal immediately if module is complete
      if (isModuleComplete) {
        setShowCompletionModal(true);
      }
      
      // Wait for animation, then cleanup (tanpa menunggu untuk completion modal)
      setTimeout(() => {
        setShowSuccess(false);
        isAnimatingRef.current = false;
      }, 1500);
    }
  };

  if (!module) {
    return <div className="text-center text-white">Modul tidak ditemukan.</div>;
  }

  const target = targets[currentIdx] || null;
  
  // Current target letter
  let currentTargetLetter = "";
  if (target) {
    if (moduleId === "mod-6") {
      currentTargetLetter = target[letterIdx]?.toUpperCase() || "";
    } else {
      currentTargetLetter = target.toUpperCase();
    }
  }
  
  // Fix the isCorrectLetter calculation
  const isCorrectLetter = prediction.letter === currentTargetLetter;

  // Generate word display untuk mod-6
  const getWordDisplay = () => {
    if (moduleId !== "mod-6" || !target) return null;
    
    return target.split('').map((letter, idx) => {
      const completed = idx < letterIdx;
      
      return (
        <span
          key={idx}
          className={`text-3xl md:text-4xl lg:text-5xl font-bold ${completed ? "text-yellow-400" : "text-white"} ${quicksand.className}`}
        >
          {letter.toUpperCase()}
        </span>
      );
    });
  };

  // Animation variants untuk flip transition
  const flipVariants = {
    initial: {
      rotateY: -90,
      opacity: 0,
    },
    animate: {
      rotateY: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    exit: {
      rotateY: 90,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  // Module titles
  const MODULE_TITLES = {
    "mod-1": "Modul 1: A - E",
    "mod-2": "Modul 2: F - J", 
    "mod-3": "Modul 3: K - O",
    "mod-4": "Modul 4: P - T",
    "mod-5": "Modul 5: U - Z",
    "mod-6": "Modul 6: Kata Kerja",
  };

  const handleExit = () => {
    router.push('/dashboard/practice');
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-[#1D2968] to-[#3A52CE] flex flex-col">
      {/* Navbar */}
      <nav className="bg-[#1A2A80] px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Exit Button */}
          <button
            onClick={handleExit}
            className="
              inline-flex items-center gap-2 px-3 md:px-4 py-2
              rounded-xl ring-1 ring-white/25 text-white
              bg-white/10 hover:bg-white/20
              transition-colors duration-200
              cursor-pointer text-sm md:text-base
            "
          >
            <LogOut size={16} className="md:w-[18px] md:h-[18px]" />
            Exit
          </button>

          {/* Title */}
          <h1 className={`text-white text-lg md:text-xl lg:text-2xl font-bold ${orbitron.className}`}>
            Tantangan Rangkai Kata
          </h1>

          {/* Placeholder untuk balance layout */}
          <div className="w-16 md:w-20"></div>
        </div>
      </nav>

      {/* Header - Module Title - Font Dikecilkan */}
      <div className="px-4 md:px-6 py-3 md:py-4 lg:py-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className={`text-white text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold ${orbitron.className}`}>
            {MODULE_TITLES[moduleId] || "Modul"}
          </h2>
        </div>
      </div>

      {/* Main Content - Mengisi sisa ruang */}
      <div className="flex-1 px-4 md:px-6 flex flex-col items-center justify-center">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col justify-center">
          {/* Container dengan rounded top custom */}
          <div 
            className="p-4 md:p-6 lg:p-8"
            style={{
              borderTopLeftRadius: '60px',
              borderTopRightRadius: '60px'
            }}
          >
            {/* Kamera dan Image Panel */}
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-32 xl:gap-52 items-center justify-center">
              {/* Kiri: Kamera */}
              <div className="flex-shrink-0 relative">
                <div className="scale-75 md:scale-90 lg:scale-100">
                  <PracticeCamera onPrediction={handlePrediction} />
                </div>
                
                {/* Hold progress indicator */}
                {prediction.isHolding && isCorrectLetter && holdProgress > 0 && (
                  <div className="absolute bottom-2 md:bottom-4 left-0 right-0 mx-auto w-3/4 bg-black bg-opacity-50 rounded-full h-3 md:h-4 overflow-hidden">
                    <div 
                      className="bg-green-400 h-full transition-all duration-100 ease-linear"
                      style={{ width: `${holdProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Kanan: Image Panel + Letter */}
              <div className="flex flex-col items-center gap-4 md:gap-6">
                {/* Progress indicator untuk mod-6 */}
                {moduleId === "mod-6" && (
                  <div className={`text-base font-semibold text-yellow-400 ${quicksand.className}`}>
                    Kata diselesaikan: {currentIdx}/{targets.length}
                  </div>
                )}

                {/* Panel Putih dengan Gambar Huruf - Dengan Animasi */}
                <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 w-60 h-60 md:w-72 md:h-72 lg:w-80 lg:h-80 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {target && (
                      <motion.img
                        key={`img-${currentTargetLetter}-${currentIdx}-${letterIdx}`}
                        src={`/letters/${currentTargetLetter}.png`}
                        alt={currentTargetLetter}
                        className="w-full h-full object-contain"
                        variants={flipVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        style={{ perspective: "1000px" }}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Huruf yang sedang dipraktikkan - Dengan Animasi */}
                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`text-${currentTargetLetter}-${currentIdx}-${letterIdx}`}
                      className={`text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold ${orbitron.className} ${
                        isCorrectLetter && prediction.isHolding ? "text-yellow-400" : "text-white"
                      }`}
                      variants={flipVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      style={{ perspective: "1000px" }}
                    >
                      {currentTargetLetter}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Word Display untuk Mod-6 - Dipindah ke tengah-tengah bagian bawah */}
            {moduleId === "mod-6" && target && (
              <div className="mt-8 lg:mt-10">
                <div className="text-center">
                  <div className="inline-flex gap-1 md:gap-2 flex-wrap justify-center">
                    {getWordDisplay()}
                  </div>
                </div>
              </div>
            )}
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
    </div>
  );
}
