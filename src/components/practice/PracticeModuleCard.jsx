"use client";

import Link from "next/link";
import { Play, RotateCcw } from "lucide-react";
import { orbitron, quicksand } from "@/lib/fonts";
import { setModuleProgress } from "@/lib/progress";

// Helper: gaya badge status
const STATUS_STYLE = {
  Selesai:  { bg: "bg-emerald-500/18", ring: "ring-emerald-300/30", text: "text-emerald-200" },
  Berjalan: { bg: "bg-sky-500/18",     ring: "ring-sky-300/30",     text: "text-sky-200" },
  Tersedia: { bg: "bg-white/10",       ring: "ring-white/20",       text: "text-white/85" },
};

export default function PracticeModuleCard({
  id,                                // "mod-1", "mod-2", etc.
  status = "Tersedia",              // 'Selesai' | 'Berjalan' | 'Tersedia'
  title,                            // "Modul 1: A - E"
  desc,                             // deskripsi singkat
  progress = 0,                     // 0..100
  href = "#",                       // link tombol kanan-bawah
}) {
  const isCompleted = progress >= 100;
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.Tersedia;

  // label CTA
  const cta =
    progress >= 100 ? "Ulangi" : progress > 0 ? "Lanjutkan" : "Mulai";

  const handleReset = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Reset progress to 0
    if (id === "mod-6") {
      setModuleProgress(id, {
        wordIdx: 0,
        index: 0,
        completed: false,
      });
    } else {
      setModuleProgress(id, {
        index: 0,
        completed: false,
      });
    }
    
    // Refresh page to update progress
    window.location.reload();
  };

  return (
    <div
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
          {`Progress ${Math.round(progress)}%`}
        </span>

        <div className="flex items-center gap-2">
          {/* Reset button untuk modul yang sudah selesai */}
          {isCompleted && (
            <button
              onClick={handleReset}
              className="
                inline-flex h-9 w-9 items-center justify-center
                rounded-full bg-white/10 hover:bg-white/20
                ring-1 ring-white/20 transition
              "
              title="Ulangi modul"
            >
              <RotateCcw size={16} />
            </button>
          )}
          
          {/* Play/Continue button */}
          <Link
            href={href}
            className="
              inline-flex h-9 w-9 items-center justify-center
              rounded-full bg-white/10 hover:bg-white/20
              ring-1 ring-white/20 transition
            "
          >
            <Play size={16} fill="currentColor" />
          </Link>
        </div>
      </div>

      {/* inner outline halus */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-white/8" />
    </div>
  );
}
