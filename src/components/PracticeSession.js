// src/components/PracticeSession.js
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getModuleProgress, setModuleProgress } from "@/lib/progress";

const HOLD_MS = 1200;
const CONF_TH = 0.8;
const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// ---------- script loader helpers ----------
function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

function waitForGlobal(key, timeout = 5000) {
  const start = performance.now();
  return new Promise((resolve, reject) => {
    (function tick() {
      if (globalThis[key]) return resolve(globalThis[key]);
      if (performance.now() - start > timeout)
        return reject(new Error(`Global "${key}" not found`));
      requestAnimationFrame(tick);
    })();
  });
}

/** Singleton loader untuk MediaPipe UMD dari /public */
async function ensureMediaPipe(base = "/mediapipe") {
  if (!globalThis.__mpReady) {
    globalThis.__mpReady = (async () => {
      await loadScriptOnce(`${base}/drawing_utils/drawing_utils.js`);
      await loadScriptOnce(`${base}/camera_utils/camera_utils.js`);
      await loadScriptOnce(`${base}/hands/hands.js`);
      // tunggu global-nya benar2 ada (hindari race onload)
      await waitForGlobal("drawConnectors");
      await waitForGlobal("drawLandmarks");
      await waitForGlobal("Camera");
      await waitForGlobal("Hands");
      // sanity log
      const diag = {
        Hands: !!globalThis.Hands,
        Camera: !!globalThis.Camera,
        drawConnectors: !!globalThis.drawConnectors,
        drawLandmarks: !!globalThis.drawLandmarks,
      };
      console.log("[MP ready]", diag);
      if (!diag.Hands) throw new Error("Hands global missing after load.");
      return diag;
    })();
  }
  return globalThis.__mpReady;
}

// ---------- component ----------
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
  const [fatal, setFatal] = useState("");

  // refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const guideRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);
  const rafIdRef = useRef(0);

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

  const targetWord = useMemo(
    () => (isWordsMode ? words?.[wordIdx] || "" : null),
    [isWordsMode, words, wordIdx]
  );

  useEffect(() => {
    let stopped = false;
    let usedManual = false;

    async function boot() {
      try {
        setFatal("");
        setLoading(true);

        // 1) TFJS (ESM) — stable
        const tf = await import("@tensorflow/tfjs");
        await tf.ready();
        try {
          await tf.setBackend("webgl");
        } catch {
          await tf.setBackend("cpu");
        }

        // 2) MediaPipe UMD dari /public + waitForGlobal
        await ensureMediaPipe("/mediapipe");

        // 3) permissions & getUserMedia polyfill
        await ensureMediaAccess();

        // 4) model TFJS
        modelRef.current = await tf.loadGraphModel("/ai/model.json");

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const gCanvas = guideRef.current;
        const gctx = gCanvas.getContext("2d");

        // DPR-aware canvas sizing
        const setSize = () => {
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

        // 5) Hands instance dengan locateFile ke /public
        const hands = new globalThis.Hands({
          locateFile: (f) => `/mediapipe/hands/${f}`,
        });
        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5,
        });
        handsRef.current = hands;

        let lastLetter = null;
        let holdStart = 0;
        let stepping = false;

        hands.onResults(async (results) => {
          // resync ukuran jika perlu
          const needW = Math.round(
            (video.videoWidth || 640) * (window.devicePixelRatio || 1)
          );
          if (canvas.width !== needW) setSize();

          // draw video
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

          // draw landmarks (DPR-aware)
          gctx.clearRect(0, 0, gCanvas.width, gCanvas.height);
          if (
            results.multiHandLandmarks &&
            results.multiHandLandmarks.length > 0 &&
            modelRef.current
          ) {
            for (const lms of results.multiHandLandmarks) {
              globalThis.drawConnectors(gctx, lms, globalThis.HAND_CONNECTIONS, {
                color: "#12057d",
                lineWidth: gctx.lineWidth,
              });
              globalThis.drawLandmarks(gctx, lms, {
                color: "#dc3767",
                radius: 2 * (window.devicePixelRatio || 1),
              });
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
                  if (!stepping && now - holdStart >= HOLD_MS && letter === targetLetter) {
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
          } else {
            setPred("-");
            setConf("-");
            lastLetter = null;
            holdStart = 0;
          }
        });

        // 6) Start camera (try Camera API, fallback manual loop)
        try {
          const cam = new globalThis.Camera(video, {
            onFrame: async () => {
              await hands.send({ image: video });
            },
          });
          cameraRef.current = cam;
          await cam.start();
        } catch {
          usedManual = true;
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false,
          });
          video.srcObject = stream;
          await video.play();
          const loop = async () => {
            await hands.send({ image: video });
            rafIdRef.current = requestAnimationFrame(loop);
          };
          loop();
          cameraRef.current = {
            stop() {
              cancelAnimationFrame(rafIdRef.current);
              stream.getTracks().forEach((t) => t.stop());
            },
          };
        }

        const syncSize = () => setSize();
        if (video.readyState >= 2) setSize();
        video.addEventListener("loadedmetadata", syncSize);
        video.addEventListener("canplay", syncSize);
        window.addEventListener("resize", syncSize);

        if (!stopped) setLoading(false);

        return () => {
          video.removeEventListener("loadedmetadata", syncSize);
          video.removeEventListener("canplay", syncSize);
          window.removeEventListener("resize", syncSize);
          if (usedManual) cameraRef.current?.stop?.();
        };
      } catch (err) {
        console.error(err);
        setFatal(err?.message || "Gagal memuat MediaPipe/TFJS.");
        setLoading(false);
      }
    }

    boot();

    return () => {
      stopped = true;
      try {
        cameraRef.current?.stop?.();
        handsRef.current?.close?.();
        const stream = videoRef.current?.srcObject;
        stream?.getTracks?.().forEach((t) => t.stop());
      } catch {}
    };
  }, []); // eslint-disable-line

  function nextStep() {
    if (isWordsMode) {
      const word = words?.[wordIdx] || "";
      const nextLetter = letterIdx + 1;
      if (nextLetter < word.length) {
        setLetterIdx(nextLetter);
        setModuleProgress(moduleId, { letterIdx: nextLetter, wordIdx, completed: false });
      } else {
        const nextWord = wordIdx + 1;
        if (nextWord < (words?.length || 0)) {
          setWordIdx(nextWord);
          setLetterIdx(0);
          setModuleProgress(moduleId, { wordIdx: nextWord, letterIdx: 0, completed: false });
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

      <h2 className="mt-4 mb-6 text-center text-4xl font-bold text-white">{title}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Webcam (mirror via CSS wrapper) */}
        <div className="lg:col-span-7">
          <div className="relative rounded-[24px] overflow-hidden bg-white/10 ring-1 ring-white/20">
            <div className="relative [transform:scaleX(-1)] select-none">
              <video ref={videoRef} autoPlay playsInline muted className="hidden" />
              <canvas ref={canvasRef} className="block w-full h-auto" />
              <canvas ref={guideRef} className="pointer-events-none absolute inset-0" />
            </div>
          </div>
        </div>

        {/* Target */}
        <div className="lg:col-span-5">
          <div className="rounded-[24px] bg-white/8 ring-1 ring-white/20 p-6 flex items-center justify-center">
            <div className="relative w-[360px] max-w-full aspect-[16/10] rounded-[22px] bg-[#151F52] grid place-items-center overflow-hidden">
              <Image
                src={`/practice/letters/${targetLetter}.png`}
                alt={`Target ${targetLetter}`}
                fill
                sizes="(max-width: 640px) 100vw, 360px"
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

      {/* Bawah */}
      <div className="mt-10 text-center">
        {isWordsMode ? (
          <div className="flex items-center justify-center gap-2 text-4xl font-bold text-white">
            {targetWord?.split("").map((ch, i) => (
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

      {(loading || fatal) && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/30 px-4">
          <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/20 text-white text-center max-w-lg">
            {fatal ? (
              <>
                <div className="font-semibold mb-1">Gagal memuat</div>
                <div className="text-white/90">{fatal}</div>
              </>
            ) : (
              "Memuat kamera & model…"
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- media access polyfill ----------
async function ensureMediaAccess() {
  if (!navigator.mediaDevices) navigator.mediaDevices = {};
  if (!navigator.mediaDevices.getUserMedia) {
    const legacy =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    if (legacy) {
      navigator.mediaDevices.getUserMedia = (c) =>
        new Promise((res, rej) => legacy.call(navigator, c, res, rej));
    }
  }
  if (!navigator.mediaDevices.getUserMedia) {
    const isLocalhost =
      ["localhost", "127.0.0.1"].includes(location.hostname) ||
      location.hostname.endsWith(".localhost");
    const isSecure = window.isSecureContext || location.protocol === "https:";
    const msg =
      isLocalhost || isSecure
        ? "Browser ini tidak mendukung kamera."
        : "Kamera membutuhkan HTTPS atau localhost.";
    const err = new Error(msg);
    err.code = "INSECURE_CONTEXT";
    throw err;
  }
}

// ---------- features ----------
function normalizeHand(landmarks, wrist) {
  return landmarks.map((lm) => [lm.x - wrist.x, lm.y - wrist.y, lm.z - wrist.z]);
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
  