"use client";

import { orbitron, quicksand } from "@/lib/fonts";

export default function PracticePage() {
  return (
    <div className="px-6 md:px-10 py-6">
      {/* Breadcrumb + Title */}
      <p className={`text-white/70 ${quicksand.className}`}>
        Dashboard / <span className="text-white">Practice</span>
      </p>
      <h1 className={`mt-2 text-3xl md:text-4xl lg:text-5xl font-bold ${orbitron.className}`}>
        Belajar Rangkai Kata
      </h1>
      <p className={`mt-2 text-white/85 ${quicksand.className} font-semibold`}>
        Pilih modul dan mulai tantangan!
      </p>

      {/* Cards grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <ModuleCard status="Selesai"   title="Modul 1: A - E" desc="Pengenalan bentuk tangan huruf A sampai E" progress={100} action="Review" />
        <ModuleCard status="Berjalan"  title="Modul 2: F - J" desc="Pengenalan bentuk tangan huruf F sampai J" progress={65} action="Lanjutkan" />
        <ModuleCard status="Tersedia"  title="Modul 3: K - O" desc="Pengenalan bentuk tangan huruf K sampai O" progress={0}   action="Mulai" />
        <ModuleCard status="Tersedia"  title="Modul 4: P - T" desc="Pengenalan bentuk tangan huruf P sampai T" progress={0}   action="Mulai" />
        <ModuleCard status="Tersedia"  title="Modul 1: U - Z" desc="Pengenalan bentuk tangan huruf U sampai Z" progress={0}   action="Mulai" />
        <ModuleCard status="Tersedia"  title="Modul 1: Kata Kerja" desc="Pengenalan bentuk tangan kata kerja" progress={0}   action="Mulai" />
      </div>
    </div>
  );
}

function ModuleCard({ status, title, desc, progress, action }) {
  return (
    <div
      className="
        relative rounded-3xl p-6 text-white
        ring-1 ring-white/15 bg-white/7
        shadow-[0_18px_40px_rgba(0,0,0,.25)]
      "
    >
      {/* status pill */}
      <div className="absolute -top-3 left-6">
        <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs">
          {status}
        </span>
      </div>

      <h3 className="text-xl font-semibold">{title}</h3>
      <p className={`mt-2 text-white/85 ${quicksand.className}`}>{desc}</p>

      {/* progress bar */}
      <div className="mt-5 h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#7A85C1]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-sm text-white/85">
        <span>Progress {progress}%</span>
        <button className="rounded-lg px-3 py-1.5 bg-white/12 hover:bg-white/18 ring-1 ring-white/20 transition">
          {action}
        </button>
      </div>
    </div>
  );
}
