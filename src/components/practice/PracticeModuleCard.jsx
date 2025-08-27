"use client";

import Link from "next/link";
import { orbitron, quicksand } from "@/lib/fonts";

// Helper: gaya badge status
const STATUS_STYLE = {
  Selesai:  { bg: "bg-emerald-500/18", ring: "ring-emerald-300/30", text: "text-emerald-200" },
  Berjalan: { bg: "bg-sky-500/18",     ring: "ring-sky-300/30",     text: "text-sky-200" },
  Tersedia: { bg: "bg-white/10",       ring: "ring-white/20",       text: "text-white/85" },
};

export default function PracticeModuleCard({
  status = "Tersedia",              // 'Selesai' | 'Berjalan' | 'Tersedia'
  title,                            // "Modul 1: A - E"
  desc,                             // deskripsi singkat
  progress = 0,                     // 0..100
  href = "#",                       // link tombol kanan-bawah
}) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.Tersedia;

  // label CTA
  const cta =
    progress >= 100 ? "Ulangi" : progress > 0 ? "Lanjutkan" : "Mulai";

  return (
    <div
      className="
        relative rounded-[28px] p-6
        text-white
        bg-gradient-to-br from-[#243A9A]/45 to-[#1C2C84]/45
        ring-1 ring-white/12
        shadow-[0_16px_36px_rgba(0,0,0,0.35)]
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

        <Link
          href={href}
          className={`
            inline-flex items-center justify-center rounded-xl
            px-3 py-1.5 text-[12.5px] font-semibold
            bg-white/10 hover:bg-white/16
            ring-1 ring-white/22
            ${quicksand.className}
          `}
        >
          {cta}
        </Link>
      </div>

      {/* inner outline halus */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-white/8" />
    </div>
  );
}
