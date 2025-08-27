"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20">
                <RotateCcw className="h-6 w-6 text-yellow-400" />
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
                `}
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                className={`
                  flex-1 rounded-xl bg-yellow-500 
                  py-3 px-4 text-sm font-semibold text-black 
                  hover:bg-yellow-400 transition-colors
                  ${quicksand.className}
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

export default function PracticeModuleCard({
  id,                                // "mod-1", "mod-2", etc.
  status = "Tersedia",              // 'Selesai' | 'Berjalan' | 'Tersedia'
  title,                            // "Modul 1: A - E"
  desc,                             // deskripsi singkat
  progress = 0,                     // 0..100
  href = "#",                       // link tombol kanan-bawah
}) {
  const [showResetModal, setShowResetModal] = useState(false);
  const isCompleted = progress >= 100;
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.Tersedia;

  const handleResetClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowResetModal(true);
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
      <article
        className="
          group relative overflow-hidden rounded-[24px] p-6
          bg-[#1A2A80] text-white
          ring-1 ring-white/15 hover:ring-white/25
          transition-all duration-300
          hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)]
        "
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

        {/* Progress bar */}
        <div className="mt-6">
          <div className="h-2 w-full rounded-full bg-white/22">
            <div
              className="h-2 rounded-full bg-[#6AA6FF]"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
        </div>

        {/* Footer bar */}
        <div className="mt-4 flex items-center justify-between">
          <span className={`text-[13px] text-white/80 ${quicksand.className}`}>
            {Math.round(progress)}% selesai
          </span>

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
                "
                title="Ulangi modul"
              >
                <RotateCcw size={16} />
              </button>
            ) : (
              // Button Play/Continue
              <Link
                href={href}
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
      </article>

      {/* Modal Konfirmasi Reset */}
      <ResetConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetConfirm}
        moduleTitle={title}
      />
    </>
  );
}
