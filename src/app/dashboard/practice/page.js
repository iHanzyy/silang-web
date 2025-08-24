"use client";

import PracticeModuleCard from "@/components/dashboard/PracticeModuleCard";
import { orbitron, quicksand } from "@/lib/fonts";

const MODULES = [
  {
    status: "Selesai",
    title: "Modul 1: A - E",
    desc: "Pengenalan bentuk tangan huruf A sampai E",
    progress: 100,
    href: "#",
  },
  {
    status: "Berjalan",
    title: "Modul 2: F - J",
    desc: "Pengenalan bentuk tangan huruf F sampai J",
    progress: 65,
    href: "#",
  },
  {
    status: "Tersedia",
    title: "Modul 3: K - O",
    desc: "Pengenalan bentuk tangan huruf K sampai O",
    progress: 0,
    href: "#",
  },
  {
    status: "Tersedia",
    title: "Modul 4: P - T",
    desc: "Pengenalan bentuk tangan huruf P sampai T",
    progress: 0,
    href: "#",
  },
  {
    status: "Tersedia",
    title: "Modul 5: U - Z",
    desc: "Pengenalan bentuk tangan huruf U sampai Z",
    progress: 0,
    href: "#",
  },
  {
    status: "Tersedia",
    title: "Modul 6: Kata Kerja",
    desc: "Pengenalan bentuk tangan kata kerja",
    progress: 0,
    href: "#",
  },
];

export default function PracticePage() {
  return (
    <div className="px-6 md:px-10 py-6">
      {/* Header */}
      <p className={`text-white/70 ${quicksand.className}`}>
        Dashboard / <span className="text-white">Practice</span>
      </p>
      <h1 className={`mt-2 text-3xl md:text-4xl lg:text-5xl font-bold ${orbitron.className}`}>
        Belajar Rangkai Kata
      </h1>
      <p className={`mt-2 text-white/85 ${quicksand.className} font-semibold`}>
        Pilih modul dan mulai tantangan!
      </p>

      {/* Grid cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {MODULES.map((m) => (
          <PracticeModuleCard key={m.title} {...m} />
        ))}
      </div>
    </div>
  );
}
