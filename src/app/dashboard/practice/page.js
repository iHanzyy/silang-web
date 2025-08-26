// src/app/dashboard/practice/page.js
"use client";

import PracticeModuleCard from "@/components/practice/PracticeModuleCard";
import { orbitron, quicksand } from "@/lib/fonts";
import { useEffect, useState } from "react";
import {
  readProgress,
  getPercentFor,
  MODULE_ITEMS,
  resetProgress,
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

  useEffect(() => {
    const p = readProgress();
    const map = Object.fromEntries(
      CARDS.map((c) => [c.id, getPercentFor(c.id, p)])
    );
    setProgressMap(map);
  }, []);

  return (
    <div className="px-6 md:px-10 py-6">
      <div className="flex items-center justify-between">
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

        {/* Opsional: tombol reset progres untuk pengujian */}
        <button
          onClick={() => {
            resetProgress();
            // refresh state ke 0%
            const map = Object.fromEntries(CARDS.map((c) => [c.id, 0]));
            setProgressMap(map);
          }}
          className="hidden md:inline-flex rounded-xl border border-white/30 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          title="Reset semua progres"
        >
          Reset Progress
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {CARDS.map((m) => (
          <PracticeModuleCard
            key={m.id}
            status={m.status}
            title={m.title}
            desc={m.desc}
            progress={progressMap[m.id] ?? 0}
            href={m.href}
          />
        ))}
      </div>
    </div>
  );
}
