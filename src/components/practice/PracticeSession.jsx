"use client";

import { useEffect, useState } from "react";
import PracticeCamera from "./PracticeCamera";
import { MODULES, getModuleById } from "@/lib/practiceData";
import {
  getModuleProgress,
  setModuleProgress,
  ensureWordsForModule,
} from "@/lib/progress";
import { div } from "@tensorflow/tfjs";

export default function PracticeSession({ moduleId = "mod-1" }) {
  const module = getModuleById(moduleId);
  const [targets, setTargets] = useState([]); // huruf atau kata
  const [currentIdx, setCurrentIdx] = useState(0);

  // load data modul + progress
  useEffect(() => {
    if (!module) return;
    if (moduleId === "mod-6") {
      // modul kata kerja
      const words = ensureWordsForModule(moduleId, () => module.range || []);
      setTargets(words);
      const prog = getModuleProgress(moduleId);
      setCurrentIdx(prog.wordIdx || 0);
    } else {
      setTargets(module.range || []);
      const prog = getModuleProgress(moduleId);
      setCurrentIdx(prog.index || 0);
    }
  }, [moduleId]);

  const handlePrediction = ({ letter, isHolding }) => {
    if (!isHolding) return;
    const target = targets[currentIdx];
    if (!target) return;

    const targetUpper = target.toUpperCase();
    const isMatch = moduleId === "mod-6"
      ? letter === targetUpper[0] // cocok huruf awal kata
      : letter === targetUpper;

    if (isMatch) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);

      if (moduleId === "mod-6") {
        setModuleProgress(moduleId, {
          wordIdx: nextIdx,
          completed: nextIdx >= targets.length,
        });
      } else {
        setModuleProgress(moduleId, {
          index: nextIdx,
          completed: nextIdx >= targets.length,
        });
      }
    }
  };

  if (!module) {
    return <div className="text-center text-white">Modul tidak ditemukan.</div>;
  }

  const target = targets[currentIdx] || null;

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start justify-center p-6">
      {/* Kiri: Kamera */}
      <div className="flex-shrink-0">
        <PracticeCamera onPrediction={handlePrediction} />
      </div>

      {/* Kanan: Target + Progress */}
      <div className="flex flex-col gap-4 items-center text-white w-full max-w-md">
        {target && (
          <div className="flex flex-col items-center gap-3">
            {/* Gambar huruf (khusus modul 1-5) */}
            {moduleId !== "mod-6" && (
              <img
                src={`/letters/${target}.png`}
                alt={target}
                className="w-32 h-32 object-contain"
              />
            )}

            {/* Huruf besar */}
            <div className="text-4xl font-bold">{target.toUpperCase()}</div>

            {/* Kata kerja (khusus modul 6) */}
            {moduleId === "mod-6" && (
              <div className="text-2xl text-yellow-200 font-semibold">
                {target.toUpperCase()}
              </div>
            )}
          </div>
        )}

        {/* Progress box */}
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {targets.map((t, idx) => {
            const done = idx < currentIdx;
            return (
              <div
                key={idx}
                className={`w-10 h-10 flex items-center justify-center rounded-md font-bold ${
                  done ? "bg-yellow-400 text-black" : "bg-white text-black"
                }`}
              >
                {moduleId === "mod-6" ? t[0].toUpperCase() : t}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
