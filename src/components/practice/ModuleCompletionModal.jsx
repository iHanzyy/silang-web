"use client";

import { useState } from "react"; // Add this import
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";
import { orbitron, quicksand } from "@/lib/fonts";
import { readProgress } from "@/lib/practiceProgress";

const MODULE_TITLES = {
  "mod-1": "Modul 1: A - E",
  "mod-2": "Modul 2: F - J", 
  "mod-3": "Modul 3: K - O",
  "mod-4": "Modul 4: P - T",
  "mod-5": "Modul 5: U - Z",
  "mod-6": "Modul 6: Kata Kerja",
};

// Custom Modal untuk Next Module Already Completed
function NextModuleCompletedModal({ isOpen, onClose, nextModuleTitle }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* Modal content */}
        <motion.div
          className="relative mx-4 w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="rounded-2xl bg-[#1A2A80] p-6 ring-1 ring-white/20">
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-700/20">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className={`text-xl font-bold text-white ${orbitron.className}`}>
                Modul Sudah Selesai
              </h3>
              <p className={`mt-2 text-sm text-white/70 ${quicksand.className}`}>
                Modul selanjutnya (<strong>{nextModuleTitle}</strong>) sudah diselesaikan, silakan pilih modul lain
              </p>
            </div>

            {/* Button */}
            <div className="mt-6">
              <button
                onClick={onClose}
                className={`
                  w-full rounded-xl bg-blue-600 
                  py-3 px-4 text-sm font-semibold text-white 
                  hover:bg-blue-500 transition-colors
                  ${quicksand.className}
                  cursor-pointer
                `}
              >
                OK
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ModuleCompletionModal({ moduleId, onClose }) {
  const router = useRouter();

  const moduleTitle = MODULE_TITLES[moduleId] || "Modul";
  const isLastModule = moduleId === "mod-6";
  
  // State untuk modal next module completed
  const [showNextCompletedModal, setShowNextCompletedModal] = useState(false);
  
  // Function untuk check apakah next module sudah completed
  const isNextModuleCompleted = () => {
    if (isLastModule) return false;
    
    const moduleNumber = parseInt(moduleId.split('-')[1]);
    const nextModuleId = `mod-${moduleNumber + 1}`;
    
    const progress = readProgress();
    const nextModuleProgress = progress.modules?.[nextModuleId];
    
    return nextModuleProgress?.completed === true;
  };
  
  const handleNext = () => {
    if (isLastModule) return;
    
    // Check apakah next module sudah completed
    if (isNextModuleCompleted()) {
      const moduleNumber = parseInt(moduleId.split('-')[1]);
      const nextModuleId = `mod-${moduleNumber + 1}`;
      const nextModuleTitle = MODULE_TITLES[nextModuleId] || "Modul";
      
      // Show custom modal instead of navigating
      setShowNextCompletedModal(true);
      return;
    }
    
    // Navigate to next module jika belum completed
    const moduleNumber = parseInt(moduleId.split('-')[1]);
    const nextModuleId = `mod-${moduleNumber + 1}`;
    router.push(`/dashboard/practice/${nextModuleId}`);
  };

  const handleExit = () => {
    router.push('/dashboard/practice');
  };

  const handleNextCompletedModalClose = () => {
    setShowNextCompletedModal(false);
    // Redirect ke halaman practice setelah close modal
    router.push('/dashboard/practice');
  };

  // Get next module title for the modal
  const getNextModuleTitle = () => {
    if (isLastModule) return "";
    const moduleNumber = parseInt(moduleId.split('-')[1]);
    const nextModuleId = `mod-${moduleNumber + 1}`;
    return MODULE_TITLES[nextModuleId] || "Modul";
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal content */}
          <motion.div
            className="relative mx-4 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rounded-2xl bg-[#1A2A80] p-6 ring-1 ring-white/20">
              {/* Header */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-700/20">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className={`text-xl font-bold text-white ${orbitron.className}`}>
                  Modul Selesai!
                </h3>
                <p className={`mt-2 text-sm text-white/70 ${quicksand.className}`}>
                  Selamat, kamu telah menyelesaikan <strong>{moduleTitle}</strong> dengan baik!
                </p>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleExit}
                  className={`
                    flex-1 rounded-xl border border-white/30 bg-white/10 
                    py-3 px-4 text-sm font-semibold text-white 
                    hover:bg-white/20 transition-colors
                    ${quicksand.className}
                    cursor-pointer
                  `}
                >
                  Exit
                </button>
                {!isLastModule && (
                  <button
                    onClick={handleNext}
                    className={`
                      flex-1 rounded-xl bg-green-600 
                      py-3 px-4 text-sm font-semibold text-white 
                      hover:bg-green-500 transition-colors
                      ${quicksand.className}
                      cursor-pointer
                    `}
                  >
                    Next
                  </button>
                )}
                {isLastModule && (
                  <button
                    onClick={handleExit}
                    className={`
                      flex-1 rounded-xl bg-green-600 
                      py-3 px-4 text-sm font-semibold text-white 
                      hover:bg-green-500 transition-colors
                      ${quicksand.className}
                      cursor-pointer
                    `}
                  >
                    Selesai
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Next Module Completed Modal */}
      <NextModuleCompletedModal
        isOpen={showNextCompletedModal}
        onClose={handleNextCompletedModalClose}
        nextModuleTitle={getNextModuleTitle()}
      />
    </>
  );
}
