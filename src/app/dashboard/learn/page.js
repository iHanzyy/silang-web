"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { orbitron, quicksand } from "@/lib/fonts";
import { X } from "lucide-react";

// === helpers ===
const LETTERS = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

export default function LearnPage() {
  const [openLetter, setOpenLetter] = useState(null); // "A"|"B"|...|null
  const [visibleCards, setVisibleCards] = useState(new Set()); // Set huruf yang sudah muncul

  // (opsional) kunci scroll saat modal terbuka
  useEffect(() => {
    if (openLetter) {
      const prev = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = prev;
      };
    }
  }, [openLetter]);

  // Animasi cards muncul satu persatu
  useEffect(() => {
    let timeouts = [];
    
    LETTERS.forEach((letter, index) => {
      const timeout = setTimeout(() => {
        setVisibleCards(prev => new Set([...prev, letter]));
      }, index * 100); // delay 100ms antar card
      
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const handleOpen = useCallback(
    (ch) => {
      // Hanya bisa dibuka jika card sudah visible
      if (visibleCards.has(ch)) {
        setOpenLetter(ch);
      }
    },
    [visibleCards]
  );
  
  const handleClose = useCallback(() => setOpenLetter(null), []);

  return (
    <div className="px-6 md:px-20 py-6">
      {/* Breadcrumb + Title */}
      <p className={`text-white/70 ${quicksand.className}`}>
        Dashboard / <span className="text-white">Learn</span>
      </p>
      <h1
        className={`mt-2 text-3xl md:text-4xl lg:text-5xl font-bold ${orbitron.className}`}
      >
        Belajar Huruf Bahasa Isyarat
      </h1>
      <p
        className={`mt-2 text-white/85 ${quicksand.className} font-semibold`}
      >
        Pahami bentuk isyarat tangan sebelum mulai latihan
      </p>

      {/* Grid huruf dengan animasi stagger */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
        {LETTERS.map((ch) => (
          <LearnTile
            key={ch}
            letter={ch}
            onClick={() => handleOpen(ch)}
            isVisible={visibleCards.has(ch)}
          />
        ))}
      </div>

      {/* Modal viewer dengan animasi */}
      <AnimatePresence>
        {openLetter && (
          <LetterViewerModal letter={openLetter} onClose={handleClose} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===================== Tile ===================== */

function LearnTile({ letter, onClick, isVisible }) {
  if (!isVisible) {
    // Card belum visible, return placeholder kosong
    return <div className="aspect-square" />;
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`
        group relative aspect-square p-2 rounded-2xl
        ring-1 ring-white/18 bg-[#1A2A80]
        hover:ring-white/35 
        hover:shadow-[0_10px_24px_rgba(0,0,0,.25)]
        hover:scale-105
        transition-all duration-500 ease-in-out
        text-white
        holographic-effect
        cursor-pointer
      `}
      aria-label={`Lihat huruf ${letter}`}
      initial={{
        scale: 0,
        opacity: 0,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      transition={{
        duration: 0.4,
        ease: "easeIn",
      }}
    >
      {/* grid: 70% preview + 30% label */}
      <div className="grid h-full grid-rows-[7fr_3fr] gap-2">
        {/* preview area */}
        <div className="relative rounded-[20px] bg-[#F9F6EE] overflow-hidden">
          <Image
            src={`/letters/${letter}.png`}
            alt={`Isyarat huruf ${letter}`}
            fill
            className="object-contain"
            sizes="(min-width: 1024px) 140px, 33vw"
            priority={letter === "A"}
          />
        </div>

        {/* label area */}
        <div className="flex items-center justify-center">
          <span
            className={`${quicksand.className} text-[20px] font-semibold leading-none`}
          >
            {letter}
          </span>
        </div>
      </div>

      {/* inner outline halus */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-[#3A52CE]" />
    </motion.button>
  );
}

/* ===================== Modal Viewer ===================== */

function LetterViewerModal({ letter, onClose }) {
  // tutup dengan ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[70]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewer-title"
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
      {/* klik area kosong menutup */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Container utama - responsive untuk mobile */}
      <div className="relative h-full w-full p-4 md:p-6 flex items-center justify-center md:items-start md:justify-start">
        {/* Panel - ukuran disesuaikan untuk mobile */}
        <div className="w-full max-w-sm md:max-w-6xl h-auto md:h-full rounded-[24px] md:rounded-[36px] ring-1 ring-white/12 overflow-hidden bg-[#0F1B57]/95 md:mx-auto">
          {/* Top bar */}
          <div className="flex items-center justify-between h-12 md:h-14 px-4 md:px-6 bg-[#1A2A80]">
            <h2
              id="viewer-title"
              className={`text-white text-lg md:text-2xl font-bold ${orbitron.className}`}
            >
              Huruf {letter}
            </h2>

            <button
              onClick={onClose}
              className="
                inline-flex items-center gap-2 px-2 py-1 md:px-3 md:py-1.5
                rounded-xl ring-1 ring-white/25 text-white
                bg-white/10 hover:bg-white/14
                cursor-pointer
              "
            >
              <span className="hidden md:inline">Exit</span>
              <X size={16} aria-hidden />
            </button>
          </div>

          {/* Konten (panel terang untuk gambar) - ukuran mobile disesuaikan */}
          <div className="p-4 md:p-7">
            <div className="relative w-full rounded-2xl bg-[#F9F6EE] overflow-hidden h-[40vh] md:min-h-[80vh]">
              <Image
                src={`/letters/${letter}.png`}
                alt={`Isyarat huruf ${letter}`}
                fill
                className="object-contain"
                sizes="(min-width: 1024px) 900px, 90vw"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
