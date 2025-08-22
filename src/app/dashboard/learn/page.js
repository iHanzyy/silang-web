 "use client";

import { orbitron, quicksand } from "@/lib/fonts";
import { Search } from "lucide-react";

const letters = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

export default function LearnPage() {
  return (
    <div className="px-6 md:px-10 py-6">
      {/* Breadcrumb + Title */}
      <p className={`text-white/70 ${quicksand.className}`}>
        Dashboard / <span className="text-white">Learn</span>
      </p>
      <h1 className={`mt-2 text-3xl md:text-4xl lg:text-5xl font-bold ${orbitron.className}`}>
        Belajar Huruf Bahasa Isyarat
      </h1>
      <p className={`mt-2 text-white/85 ${quicksand.className} font-semibold`}>
        Pahami bentuk isyarat tangan sebelum mulai latihan
      </p>

      {/* Search */}
      <div className="mt-6 relative">
        <input
          type="text"
          placeholder="Cari Huruf (A, B, C)"
          className="w-full rounded-xl bg-white/10 text-white placeholder-white/60
                     ring-1 ring-white/15 focus:ring-2 focus:ring-white/30
                     px-4 py-2.5 outline-none"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2" size={18} />
      </div>

      {/* Grid huruf */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {letters.map((ch) => (
          <LetterTile key={ch} ch={ch} />
        ))}
      </div>
    </div>
  );
}

function LetterTile({ ch }) {
  return (
    <button
      className="
        group relative rounded-2xl p-4
        ring-1 ring-white/15 bg-white/6
        hover:bg-white/10 transition
        aspect-square flex flex-col items-center justify-center
        shadow-[0_8px_24px_rgba(0,0,0,.25)]
      "
    >
      {/* inner rounded box (sudut besar) */}
      <div className="absolute inset-3 rounded-[22px] bg-black/25" />
      {/* outer-border halus */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
      {/* label */}
      <span className="relative z-10 mt-2 text-white font-bold">{ch}</span>
    </button>
  );
}
