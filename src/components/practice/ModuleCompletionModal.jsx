"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { orbitron, quicksand } from "@/lib/fonts";

const MODULE_TITLES = {
  "mod-1": "Modul 1: A - E",
  "mod-2": "Modul 2: F - J", 
  "mod-3": "Modul 3: K - O",
  "mod-4": "Modul 4: P - T",
  "mod-5": "Modul 5: U - Z",
  "mod-6": "Modul 6: Kata Kerja",
};

export default function ModuleCompletionModal({ moduleId, onClose }) {
  const router = useRouter();

  const moduleTitle = MODULE_TITLES[moduleId] || "Modul";
  const isLastModule = moduleId === "mod-6";
  
  const handleNext = () => {
    if (isLastModule) return;
    
    // Navigate to next module
    const moduleNumber = parseInt(moduleId.split('-')[1]);
    const nextModuleId = `mod-${moduleNumber + 1}`;
    router.push(`/dashboard/practice/${nextModuleId}`);
  };

  const handleExit = () => {
    router.push('/dashboard/practice');
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      initial={{
        scale: 0.8,
        opacity: 0,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      exit={{
        scale: 0.8,
        opacity: 0,
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
    >
      {/* Backdrop - NO onClick handler, cannot close by clicking outside */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal content */}
      <div className="relative mx-4 w-full max-w-2xl">
        <div 
          className="rounded-[32px] overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #2E4BC5 0%, #1A237E 100%)"
          }}
        >
          {/* Header */}
          <div className="px-8 py-6 bg-[#1A2A80]">
            <h2 className={`text-white text-2xl md:text-3xl font-bold text-center ${orbitron.className}`}>
              {moduleTitle}
            </h2>
          </div>

          {/* Content */}
          <div className="px-8 py-12 text-center">
            <h3 className={`text-white text-xl md:text-2xl font-semibold leading-relaxed ${quicksand.className}`}>
              Selamat, kamu telah menyelesaikan<br />
              {moduleTitle.toLowerCase()} dengan baik
            </h3>
          </div>

          {/* Footer buttons */}
          <div className="px-8 pb-8 flex items-center justify-between gap-4">
            <button
              onClick={handleExit}
              className={`
                px-8 py-3 rounded-2xl border-2 border-white/30
                bg-white/10 hover:bg-white/20
                text-white font-semibold text-lg
                transition-all duration-200
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
                  px-8 py-3 rounded-2xl border-2 border-white/30
                  bg-white/10 hover:bg-white/20
                  text-white font-semibold text-lg
                  transition-all duration-200
                  ${quicksand.className}
                  cursor-pointer
                `}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
