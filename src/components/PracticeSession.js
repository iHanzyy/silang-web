// src/components/PracticeSession.js
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getModuleProgress, setModuleProgress } from "@/lib/progress";

// ===== PARAMETER DETEKSI =====
const HOLD_MS = 1200;
const CONF_TH = 0.8;
const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// ===== CDN =====
const TFJS_SRC =
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.14.0/dist/tf.min.js";
// fallback kalau environment kamu tidak otomatis expose converter
const TF_CONVERTER_SRC =
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter@4.14.0/dist/tf-converter.min.js";
const HANDS_SRC = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.min.js";
const DRAW_SRC =
  "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js";
const CAMERA_SRC =
  "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// Pastikan TFJS benar-benar siap + ada loadGraphModel
async function ensureTF() {
  await loadScriptOnce(TFJS_SRC);

  // tunggu hingga window.tf tersedia
  for (let i = 0; i < 60 && !window.tf; i++) {
    await new Promise((r) => setTimeout(r, 50));
  }

  // kalau loadGraphModel belum ada, muat converter
  if (!window.tf?.loadGraphModel) {
    await loadScriptOnce(TF_CONVERTER_SRC);
    for (let i = 0; i < 40 && !window.tf?.loadGraphModel; i++) {
      await new Promise((r) => setTimeout(r, 50));
    }
  }

  if (!window.tf?.loadGraphModel) {
    throw new Error("TFJS belum expose loadGraphModel");
  }

  await window.tf.ready();
  // pilih backend terbaik yang tersedia
  try {
    await window.tf.setBackend("webgl");
  } catch {
    try {
      await window.tf.setBackend("cpu");
    } catch {}
  }
}

export default function PracticeSession({ moduleId, title, letters, words }) {
  const router = useRouter();
  const isWordsMode = Array.isArray(words);

  // progress
  const [idx, setIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [letterIdx, setLetterIdx] = useState(0);
  const [done, setDone] = useState(false);

  // ui
  const [pred, setPred] = useState("-");
  const [conf, setConf] = useState("-");
  const [loading, setLoading] = useState(true);

  // refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null); // video canvas
  const guideRef = useRef(null);  // landmark canvas
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);

  // restore progress
  useEffect(() => {
    const p = getModuleProgress(moduleId);
    if (isWordsMode) {
      setWordIdx(p.wordIdx || 0);
      setLetterIdx(p.letterIdx || 0);
      setDone(!!p.completed);
    } else {
      setIdx(p.index || 0);
      setDone(!!p.completed);
    }
  }, [moduleId, isWordsMode]);

  // target
  const targetLetter = useMemo(() => {
    if (isWordsMode) {
      const w = words?.[wordIdx] || "";
      return (w[letterIdx] || "A").toUpperCase();
    }
    return (letters?.[idx] || "A").toUpperCase();
  }, [isWordsMode, words, wordIdx, letterIdx, letters, idx]);

  const targetImg = useMemo(
    () => `/practice/letters/${targetLetter}.png`,
    [targetLetter]
  );

  // boot
  useEffect(() => {
    let stopped = false;

    async function boot() {
      try {
        setLoading(true);

        await ensureTF();                       // ⬅️ perbaikan utama
        await loadScriptOnce(HANDS_SRC);
        await loadScriptOnce(DRAW_SRC);
        await loadScriptOnce(CAMERA_SRC);

        const tf = window.tf;
        // pastikan model kamu berada di /public/ai/model.json (+ shard .bin)
        modelRef.current = await tf.loadGraphModel("/ai/model.json");

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const gCanvas = guideRef.current;
        const gctx = gCanvas.getContext("2d");

        // samakan ukuran canvas dg video dan hormati DPR (supaya akurat)
        const setCanvasSizeToVideo = () => {
          const vw = video.videoWidth || 640;
          const vh = video.videoHeight || 480;
          const dpr = window.devicePixelRatio || 1;

          canvas.width = Math.round(vw * dpr);
          canvas.height = Math.round(vh * dpr);
          gCanvas.width = canvas.width;
          gCanvas.height = canvas.height;

          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          gctx.lineWidth = 2 * dpr;

          canvas.style.width = `${vw}px`;
          canvas.style.height = `${vh}px`;
          gCanvas.style.width = `${vw}px`;
          gCanvas.style.height = `${vh}px`;
        };

        const Hands = window.Hands;
        const hands = new Hands({
          locateFile: (f) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
        });
        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5,
          // mirror via CSS wrapper (bukan selfieMode), biar overlay pas
        });

        let lastLetter = null;
        let holdStart = 0;
        let stepping = false; // cooldown supaya tidak next dua kali

        hands.onResults(async (results) => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

          gctx.clearRect(0, 0, gCanvas.width, gCanvas.height);

          if (
            !results.multiHandLandmarks ||
            results.multiHandLandmarks.length === 0 ||
            !modelRef.current
          ) {
            setPred("-");
            setConf("-");
            lastLetter = null;
            holdStart = 0;
            return;
          }

          if (window.drawConnectors && window.drawLandmarks) {
            for (const lms of results.multiHandLandmarks) {
              window.drawConnectors(gctx, lms, window.HAND_CONNECTIONS, {
                color: "#12057d",
                lineWidth: gctx.lineWidth,
              });
              window.drawLandmarks(gctx, lms, {
                color: "#dc3767",
                radius: 2 * (window.devicePixelRatio || 1),
              });
            }
          }

          const feats = toFeatures(results.multiHandLandmarks);
          const input = tf.tensor2d([feats], [1, 126]);
          try {
            const out = modelRef.current.predict(input);
            const arr = out.arraySync()[0];
            const maxV = Math.max(...arr);
            const cls = arr.indexOf(maxV);
            const letter = LABELS[cls];

            setPred(letter);
            setConf((maxV * 100).toFixed(1));

            const now = Date.now();
            if (maxV >= CONF_TH) {
              if (lastLetter === letter) {
                if (!holdStart) holdStart = now;
                if (
                  !stepping &&
                  now - holdStart >= HOLD_MS &&
                  letter === targetLetter
                ) {
                  stepping = true;
                  nextStep();
                  setTimeout(() => (stepping = false), 250);
                  lastLetter = null;
                  holdStart = 0;
                }
              } else {
                lastLetter = letter;
                holdStart = now;
              }
            } else {
              lastLetter = null;
              holdStart = 0;
            }
            tf.dispose(out);
          } finally {
            input.dispose();
          }
        });

        const Camera = window.Camera;
        cameraRef.current = new Camera(video, {
          onFrame: async () => {
            await hands.send({ image: video });
          },
        });

        handsRef.current = hands;

        await cameraRef.current.start();
        if (video.readyState >= 2) setCanvasSizeToVideo();
        else video.onloadedmetadata = setCanvasSizeToVideo;

        const onResize = () => setCanvasSizeToVideo();
        window.addEventListener("resize", onResize);

        if (!stopped) setLoading(false);

        return () => window.removeEventListener("resize", onResize);
      } catch (err) {
        console.error("Practice boot error:", err);
        if (!stopped) setLoading(false);
      }
    }

    boot();

    return () => {
      stopped = true;
      try {
        cameraRef.current?.stop();
        handsRef.current?.close();
        const stream = videoRef.current?.srcObject;
        stream?.getTracks?.forEach((t) => t.stop());
      } catch {}
    };
  }, []);

  function nextStep() {
    if (isWordsMode) {
      const word = words?.[wordIdx] || "";
      const nextLetter = letterIdx + 1;
      if (nextLetter < word.length) {
        setLetterIdx(nextLetter);
        setModuleProgress(moduleId, {
          letterIdx: nextLetter,
          wordIdx,
          completed: false,
        });
      } else {
        const nextWord = wordIdx + 1;
        if (nextWord < (words?.length || 0)) {
          setWordIdx(nextWord);
          setLetterIdx(0);
          setModuleProgress(moduleId, {
            wordIdx: nextWord,
            letterIdx: 0,
            completed: false,
          });
        } else {
          setDone(true);
          setModuleProgress(moduleId, { completed: true });
        }
      }
    } else {
      const next = idx + 1;
      if (next < (letters?.length || 0)) {
        setIdx(next);
        setModuleProgress(moduleId, { index: next, completed: false });
      } else {
        setDone(true);
        setModuleProgress(moduleId, {
          index: (letters?.length || 1) - 1,
          completed: true,
        });
      }
    }
  }

  const targetWord = isWordsMode ? words?.[wordIdx] || "" : null;

  return (
    <div className="relative mx-auto max-w-7xl px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard/practice")}
          className="rounded-xl border border-white/30 px-3 py-2 text-white/90 hover:bg-white/10"
        >
          Exit
        </button>
        <div className="text-sm text-white/80">Tantangan Rangkai Kata</div>
        <div />
      </div>

      <h2 className="mt-4 mb-6 text-center text-4xl font-bold text-white">
        {title}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Kiri: webcam (kedua canvas DIMIRROR via CSS) */}
        <div className="lg:col-span-7">
          <div className="relative rounded-[24px] overflow-hidden bg-white/10 ring-1 ring-white/20">
            <div className="relative [transform:scaleX(-1)] select-none">
              <video ref={videoRef} autoPlay playsInline muted className="hidden" />
              <canvas ref={canvasRef} className="block w-full h-auto" />
              <canvas ref={guideRef} className="pointer-events-none absolute inset-0" />
            </div>
          </div>
        </div>

        {/* Kanan: target */}
        <div className="lg:col-span-5">
          <div className="rounded-[24px] bg-white/8 ring-1 ring-white/20 p-6 flex items-center justify-center">
            <div className="relative w-[360px] max-w-full aspect-[16/10] rounded-[22px] bg-[#151F52] grid place-items-center overflow-hidden">
              <Image
                src={`/practice/letters/${targetLetter}.png`}
                alt={`Target ${targetLetter}`}
                fill
                className="object-contain p-6"
                priority
              />
            </div>
          </div>

          <div className="mt-4 text-white/80 text-sm">
            Predicted: <span className="font-semibold text-white">{pred}</span>
            &nbsp;|&nbsp; Confidence:{" "}
            <span className="font-semibold text-white">{conf}%</span>
          </div>
        </div>
      </div>

      {/* Display bawah */}
      <div className="mt-10 text-center">
        {isWordsMode ? (
          <div className="flex items-center justify-center gap-2 text-4xl font-bold text-white">
            {(words?.[wordIdx] || "").split("").map((ch, i) => (
              <span
                key={`${ch}-${i}`}
                className={
                  i < letterIdx
                    ? "text-white/35"
                    : i === letterIdx
                    ? "text-white"
                    : "text-white/70"
                }
              >
                {ch}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-5xl font-bold text-white/95">
            {(targetLetter || "A").toLowerCase()}
          </div>
        )}
      </div>

      {/* Popup selesai */}
      {done && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
          <div className="mx-4 max-w-2xl w-full rounded-[28px] overflow-hidden text-white shadow-2xl">
            <div className="bg-[#1A2A80] px-6 py-4 text-lg font-semibold">
              {title}
            </div>
            <div className="bg-[#0E1A4A] px-6 py-10 text-center text-2xl leading-relaxed">
              Selamat, kamu telah menyelesaikan modul ini dengan baik
            </div>
            <div className="bg-[#0E1A4A] px-6 pb-6 flex items-center justify-between">
              <button
                onClick={() => router.push("/dashboard/practice")}
                className="rounded-xl border border-white/30 px-4 py-2 hover:bg-white/10"
              >
                Exit
              </button>
              <button
                onClick={() => {
                  setDone(false);
                  if (isWordsMode) {
                    setWordIdx(0);
                    setLetterIdx(0);
                    setModuleProgress(moduleId, {
                      wordIdx: 0,
                      letterIdx: 0,
                      completed: false,
                    });
                  } else {
                    setIdx(0);
                    setModuleProgress(moduleId, { index: 0, completed: false });
                  }
                }}
                className="rounded-xl border border-white/30 px-4 py-2 hover:bg-white/10"
              >
                Ulangi
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/30">
          <div className="rounded-xl bg-white/10 px-4 py-2 ring-1 ring-white/20 text-white">
            Memuat kamera & model…
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Helpers =====
function normalizeHand(landmarks, wrist) {
  return landmarks.map((lm) => [
    lm.x - wrist.x,
    lm.y - wrist.y,
    lm.z - wrist.z,
  ]);
}
function toFeatures(all) {
  let feats = [];
  if (all.length === 1) {
    const right = normalizeHand(all[0], all[0][0]);
    feats.push(...Array(63).fill(0));
    right.forEach((c) => feats.push(...c));
  } else if (all.length >= 2) {
    const sorted = [...all].sort((a, b) => a[0].x - b[0].x);
    const left = normalizeHand(sorted[0], sorted[0][0]);
    const right = normalizeHand(sorted[1], sorted[1][0]);
    left.forEach((c) => feats.push(...c));
    right.forEach((c) => feats.push(...c));
  }
  if (feats.length !== 126) feats = Array(126).fill(0);
  return feats;
}
