// src/app/dashboard/practice/page.js
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PracticeModuleCard from "@/components/practice/PracticeModuleCard";
import { orbitron, quicksand } from "@/lib/fonts";
import {
  readProgress,
  getPercentFor,
  MODULE_ITEMS,
} from "@/lib/practiceProgress";

const CARDS = [
  { id: "mod-1", status: "Tersedia", title: "Modul 1: A - E", desc: "Pengenalan bentuk tangan huruf A sampai E", href: "/dashboard/practice/mod-1" },
  { id: "mod-2", status: "Tersedia", title: "Modul 2: F - J", desc: "Pengenalan bentuk tangan huruf F sampai J", href: "/dashboard/practice/mod-2" },
  { id: "mod-3", status: "Tersedia", title: "Modul 3: K - O", desc: "Pengenalan bentuk tangan huruf K sampai O", href: "/dashboard/practice/mod-3" },
  { id: "mod-4", status: "Tersedia", title: "Modul 4: P - T", desc: "Pengenalan bentuk tangan huruf P sampai T", href: "/dashboard/practice/mod-4" },
  { id: "mod-5", status: "Tersedia", title: "Modul 5: U - Z", desc: "Pengenalan bentuk tangan huruf U sampai Z", href: "/dashboard/practice/mod-5" },
  { id: "mod-6", status: "Tersedia", title: "Modul 6: Kata Kerja", desc: "Pengenalan bentuk tangan kata kerja", href: "/dashboard/practice/mod-6" },
];

export default function PracticePage() {
  const [progressMap, setProgressMap] = useState({});
  const [visibleCards, setVisibleCards] = useState(new Set());
  const [isMounted, setIsMounted] = useState(false);

  // Pastikan komponen sudah mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const p = readProgress();
    const map = Object.fromEntries(
      CARDS.map((c) => [c.id, getPercentFor(c.id, p)])
    );
    setProgressMap(map);
  }, []);

  // Animasi cards muncul satu persati
  useEffect(() => {
    if (!isMounted) return;
    
    let timeouts = [];
    
    CARDS.forEach((card, index) => {
      const timeout = setTimeout(() => {
        setVisibleCards(prev => new Set([...prev, card.id]));
      }, index * 150);
      
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isMounted]);

  // Definisi animasi yang konsisten
  const headerAnimation = {
    initial: { x: 0, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
  };

  return (
    <div className="px-6 md:px-20 py-6">
      {/* Breadcrumb + Title dengan animasi yang konsisten */}
      <motion.div
        initial={headerAnimation.initial}
        animate={headerAnimation.animate}
        transition={headerAnimation.transition}
        className="flex items-center justify-between"
      >
        <div>
          <p className={`text-white/70 ${quicksand.className}`}>
            Dashboard / <span className="text-white">Practice</span>
          </p>
          <h1 className={`mt-2 text-3xl md:text-4xl lg:text-5xl font-bold ${orbitron.className}`}>
            Belajar Rangkai Kata
          </h1>
          <p className={`mt-2 text-white/85 ${quicksand.className} font-semibold`}>
            Pilih modul dan mulai tantangan!
          </p>
        </div>
      </motion.div>

      {/* Grid module cards dengan animasi stagger */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {CARDS.map((m) => (
          <AnimatedPracticeCard
            key={m.id}
            card={m}
            progress={progressMap[m.id] ?? 0}
            isVisible={visibleCards.has(m.id)}
            isMounted={isMounted}
          />
        ))}
      </div>
    </div>
  );
}

// Wrapper component untuk animasi individual card
function AnimatedPracticeCard({ card, progress, isVisible, isMounted }) {
  if (!isVisible || !isMounted) {
    // Card belum visible atau belum mounted, return placeholder kosong
    return <div className="aspect-[4/3]" />;
  }

  return (
    <motion.div
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
        ease: "easeOut",
      }}
    >
      <PracticeModuleCard
        id={card.id}
        status={card.status}
        title={card.title}
        desc={card.desc}
        progress={progress}
        href={card.href}
      />
    </motion.div>
  );
}
