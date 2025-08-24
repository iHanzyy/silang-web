"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import PracticeSession from "@/components/PracticeSession";
import { getModuleById, pickRandomVerbs } from "@/lib/practiceData";
import { ensureWordsForModule } from "@/lib/progress";

export default function PracticeModulePage() {
  const { moduleId } = useParams();
  const mod = getModuleById(moduleId);
  const [words, setWords] = useState(null);

  if (!mod) return notFound();

  const isVerbs = mod.id === "mod-6";

  // Untuk modul 6 (kata kerja), persist daftar kata acak supaya konsisten saat reload.
  useEffect(() => {
    if (isVerbs) {
      const w = ensureWordsForModule(mod.id, () => pickRandomVerbs(6));
      setWords(w);
    }
  }, [isVerbs, mod.id]);

  return (
    <PracticeSession
      moduleId={mod.id}
      title={mod.title}
      letters={isVerbs ? null : mod.range}
      words={isVerbs ? words : null}
    />
  );
}
