"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, RotateCcw, Smartphone } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { orbitron, quicksand } from "@/lib/fonts";
import { setModuleProgress } from "@/lib/progress";

// Helper: gaya badge status
const STATUS_STYLE = {
  Selesai:  { bg: "bg-emerald-500/18", ring: "ring-emerald-300/30", text: "text-emerald-200" },
  Berjalan: { bg: "bg-sky-500/18",     ring: "ring-sky-300/30",     text: "text-sky-200" },
  Tersedia: { bg: "bg-white/10",       ring: "ring-white/20",       text: "text-white/85" },
};

// Modal Konfirmasi Reset
function ResetConfirmationModal({ isOpen, onClose, onConfirm, moduleTitle }) {
  if (!isOpen) return null;

  return (
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
          onClick={onClose}
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
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-700/20">
                <RotateCcw className="h-6 w-6 text-red-600" />
              </div>
              <h3 className={`text-xl font-bold text-white ${orbitron.className}`}>
                Ulangi Modul?
              </h3>
              <p className={`mt-2 text-sm text-white/70 ${quicksand.className}`}>
                Progress <strong>{moduleTitle}</strong> akan direset ke 0%. 
                Anda perlu mengulang dari awal.
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className={`
                  flex-1 rounded-xl border border-white/30 bg-white/10 
                  py-3 px-4 text-sm font-semibold text-white 
                  hover:bg-white/20 transition-colors
                  ${quicksand.className}
                  cursor-pointer
                `}
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                className={`
                  flex-1 rounded-xl bg-red-600 
                  py-3 px-4 text-sm font-semibold text-white 
                  hover:bg-red-500 transition-colors
                  ${quicksand.className}
                  cursor-pointer
                `}
              >
                Ya, Ulangi
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Modal Belum Tersedia di Mobile
function MobileNotAvailableModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
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
          onClick={onClose}
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
                <Smartphone className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className={`text-xl font-bold text-white ${orbitron.className}`}>
                Belum Tersedia di Mobile
              </h3>
              <p className={`mt-2 text-sm text-white/70 ${quicksand.className}`}>
                Mohon maaf Latihan modul belum tersedia di mobile, silahkan menggunakan PC/Laptop agar dapat berlatih dengan modul!
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

export default function PracticeModuleCard({
  id,                                // "mod-1", "mod-2", etc.
  status = "Tersedia",              // 'Selesai' | 'Berjalan' | 'Tersedia'
  title,                            // "Modul 1: A - E"
  desc,                             // deskripsi singkat
  progress = 0,                     // 0..100
  href = "#",                       // link tombol kanan-bawah
}) {
  const [showResetModal, setShowResetModal] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Motion values untuk animasi progress
  const progressMotionValue = useMotionValue(0);
  const animatedProgress = useTransform(progressMotionValue, (value) => Math.round(value));
  
  const isCompleted = progress >= 100;
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.Tersedia;

  // Detect mobile on component mount
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    setIsMounted(true);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Animate progress when component mounts or progress changes
  useEffect(() => {
    if (!isMounted) return;
    
    const controls = animate(progressMotionValue, progress, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier untuk smooth spring effect
      delay: 0.2, // Small delay untuk stagger effect dengan card animation
    });

    return () => controls.stop();
  }, [progress, progressMotionValue, isMounted]);

  // Progress bar variants dengan glow effect
  const progressBarVariants = {
    initial: { 
      width: "0%",
      boxShadow: "0 0 0px rgba(106, 166, 255, 0)"
    },
    animate: (progress) => ({
      width: `${Math.max(0, Math.min(100, progress))}%`,
      boxShadow: progress > 0 ? "0 0 8px rgba(106, 166, 255, 0.6)" : "0 0 0px rgba(106, 166, 255, 0)",
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.2,
      }
    })
  };

  // Text percentage variants
  const textVariants = {
    initial: { 
      opacity: 0, 
      y: 10,
      scale: 0.9
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.4, // Delay setelah progress bar mulai mengisi
      }
    }
  };

  // Hover variants untuk progress bar
  const progressHoverVariants = {
    rest: { 
      boxShadow: progress > 0 ? "0 0 8px rgba(106, 166, 255, 0.6)" : "0 0 0px rgba(106, 166, 255, 0)"
    },
    hover: {
      boxShadow: progress > 0 ? "0 0 12px rgba(106, 166, 255, 0.8)" : "0 0 0px rgba(106, 166, 255, 0)",
      transition: { duration: 0.3 }
    }
  };

  const handleResetClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowResetModal(true);
  };

  const handlePlayClick = (e) => {
    if (isMobile) {
      e.preventDefault();
      e.stopPropagation();
      setShowMobileModal(true);
    }
    // Jika bukan mobile, Link akan berfungsi normal
  };

  const handleResetConfirm = () => {
    // Reset progress to 0
    try {
      if (id === "mod-6") {
        setModuleProgress(id, {
          wordIdx: 0,
          letterIdx: 0, // tambahkan letterIdx untuk mod-6
          index: 0,
          completed: false,
        });
      } else {
        setModuleProgress(id, {
          index: 0,
          completed: false,
        });
      }
      
      console.log(`✅ Progress reset for module ${id}`);
      
      // Close modal
      setShowResetModal(false);
      
      // Refresh page to update progress
      window.location.reload();
    } catch (error) {
      console.error(`❌ Error resetting progress for module ${id}:`, error);
      setShowResetModal(false);
    }
  };

  return (
    <>
      <motion.article
        className="
          group relative overflow-hidden rounded-[24px] p-6
          bg-[#1A2A80] text-white
          ring-1 ring-white/15 hover:ring-white/25
          transition-all duration-300
          hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)]
        "
        initial="rest"
        whileHover="hover"
        variants={{
          rest: {},
          hover: {}
        }}
      >
        {/* badge status */}
        <div
          className={`
            inline-flex items-center rounded-full px-3 py-1 text-[12px]
            ${style.bg} ${style.ring} ${style.text} ring-1
          `}
        >
          {status}
        </div>

        {/* Judul */}
        <h3 className={`mt-4 text-[22px] leading-tight font-bold ${orbitron.className}`}>
          {title}
        </h3>

        {/* Deskripsi */}
        <p className={`mt-3 text-[14px] text-white/80 ${quicksand.className}`}>
          {desc}
        </p>

        {/* Progress bar dengan animasi */}
        <div className="mt-6">
          <div className="h-2 w-full rounded-full bg-white/22 overflow-hidden">
            <motion.div
              className="h-2 rounded-full bg-[#6AA6FF] relative"
              custom={progress}
              variants={progressBarVariants}
              initial="initial"
              animate={isMounted ? "animate" : "initial"}
              whileHover="hover"
              style={{
                originX: 0, // Ensure animation starts from left
              }}
            >
              {/* Shimmer effect overlay */}
              {progress > 0 && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 1.5,
                    ease: "easeInOut",
                    delay: 1, // Start after progress bar animation
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                />
              )}
            </motion.div>
          </div>
        </div>

        {/* Footer bar dengan animated text */}
        <div className="mt-4 flex items-center justify-between">
          <motion.span 
            className={`text-[13px] text-white/80 ${quicksand.className}`}
            variants={textVariants}
            initial="initial"
            animate={isMounted ? "animate" : "initial"}
          >
            <motion.span>
              {isMounted ? animatedProgress : Math.round(progress)}
            </motion.span>% selesai
          </motion.span>

          <div className="flex items-center justify-end">
            {/* Conditional button: Play atau Ulangi */}
            {isCompleted ? (
              // Button Ulangi (mengganti Play button)
              <button
                onClick={handleResetClick}
                className="
                  inline-flex h-9 w-9 items-center justify-center
                  rounded-full bg-white/10 hover:bg-white/20
                  ring-1 ring-white/20 transition-colors
                  cursor-pointer
                "
                title="Ulangi modul"
              >
                <RotateCcw size={16} />
              </button>
            ) : (
              // Button Play/Continue
              <Link
                href={href}
                onClick={handlePlayClick}
                className="
                  inline-flex h-9 w-9 items-center justify-center
                  rounded-full bg-white/10 hover:bg-white/20
                  ring-1 ring-white/20 transition-colors
                "
                title={progress > 0 ? "Lanjutkan modul" : "Mulai modul"}
              >
                <Play size={16} fill="currentColor" />
              </Link>
            )}
          </div>
        </div>

        {/* inner outline halus */}
        <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-white/8" />
      </motion.article>

      {/* Modal Konfirmasi Reset */}
      <ResetConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetConfirm}
        moduleTitle={title}
      />

      {/* Modal Belum Tersedia di Mobile */}
      <MobileNotAvailableModal
        isOpen={showMobileModal}
        onClose={() => setShowMobileModal(false)}
      />
    </>
  );
}
