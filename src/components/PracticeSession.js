"use client";

import { useEffect, useRef, useState } from "react";

/* ====== Konstanta persis HTML ====== */
const TFJS_CDN  = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.14.0/dist/tf.min.js";
const MP_BASE   = "https://cdn.jsdelivr.net/npm/@mediapipe";
const MP_HANDS  = `${MP_BASE}/hands@0.4.1646424915`;
const MP_DRAW   = `${MP_BASE}/drawing_utils@0.3.1675466124`;
const MP_CAMERA = `${MP_BASE}/camera_utils@0.3.1675466862`;

const CANVAS_W = 640;
const CANVAS_H = 480;

const HOLD_DURATION = 2000;         // ms (2s)
const CONF_TH = 0.8;                // 0.8
const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/* ====== helpers ====== */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-key="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.defer = true;
    s.crossOrigin = "anonymous";
    s.dataset.key = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}
async function waitFor(fn, timeout = 6000, step = 50) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const v = fn();
    if (v) return v;
    await sleep(step);
  }
  return null;
}

/* ====== Komponen minimal (kamera + prediksi) ====== */
export default function PracticeSession() {
  const videoRef = useRef(null);
  const frameRef = useRef(null);     // canvas video
  const lmkRef   = useRef(null);     // canvas landmarks

  const tfRef     = useRef(null);
  const modelRef  = useRef(null);
  const handsRef  = useRef(null);
  const cameraRef = useRef(null);

  const cancelled = useRef(false);

  const [pred, setPred] = useState("-");
  const [conf, setConf] = useState("-");
  const [okHold, setOkHold] = useState(false);
  const [loading, setLoading] = useState(true);

  // persis HTML: 126 fitur, kiri nol jika hanya 1 tangan
  function normalize(landmarks, wrist) {
    return landmarks.map((lm) => [lm.x - wrist.x, lm.y - wrist.y, lm.z - wrist.z]);
  }
  function toInputTensor(landmarks) {
    let feats = [];
    if (landmarks.length === 1) {
      // kiri nol
      feats.push(...Array(63).fill(0));
      const right = normalize(landmarks[0], landmarks[0][0]);
      right.forEach((c) => feats.push(...c));
    } else if (landmarks.length === 2) {
      const sorted = [...landmarks].sort((a, b) => a[0].x - b[0].x);
      const left  = normalize(sorted[0], sorted[0][0]);
      const right = normalize(sorted[1], sorted[1][0]);
      left.forEach((c) => feats.push(...c));
      right.forEach((c) => feats.push(...c));
    }
    if (feats.length !== 126) feats = Array(126).fill(0);
    return tfRef.current.tensor2d([feats], [1, 126]);
  }

  useEffect(() => {
    let lastLetter = null;
    let holdStart = 0;

    async function boot() {
      try {
        setLoading(true);
        cancelled.current = false;

        // Arahkan resolver asset WASM/DATA ke CDN sebelum load hands.min.js
        window.Module = window.Module || {};
        window.Module.locateFile = (file) => `${MP_HANDS}/${file}`;

        // Muat semua CDN
        await Promise.all([
          loadScriptOnce(`${MP_HANDS}/hands.min.js`),
          loadScriptOnce(`${MP_DRAW}/drawing_utils.js`),
          loadScriptOnce(`${MP_CAMERA}/camera_utils.js`),
          loadScriptOnce(TFJS_CDN),
        ]);

        // Tunggu objek global siap
        const okHands = await waitFor(() => window.Hands, 4000);
        const okDraw  = await waitFor(() => window.drawConnectors && window.drawLandmarks && window.HAND_CONNECTIONS, 4000);
        const okCam   = await waitFor(() => window.Camera, 4000);
        const okTf    = await waitFor(() => window.tf?.loadGraphModel, 4000);
        if (!okHands || !okDraw || !okCam || !okTf) {
          throw new Error("CDN scripts belum siap (Hands/Draw/Camera/TF).");
        }
        tfRef.current = window.tf;

        // Load model: coba /ai/model.json → /model.json
        const modelCandidates = ["/ai/model.json", "/model.json"];
        let loaded = false, lastErr;
        for (const path of modelCandidates) {
          try {
            modelRef.current = await tfRef.current.loadGraphModel(path);
            console.log("[TFJS] model loaded:", path);
            loaded = true;
            break;
          } catch (e) {
            lastErr = e;
          }
        }
        if (!loaded) {
          console.error("[TFJS] Gagal load model dari /ai/model.json maupun /model.json", lastErr);
          throw lastErr;
        }

        if (cancelled.current) return;

        // Set ukuran canvas fix 640x480 (persis HTML)
        const frame = frameRef.current;
        const lmk = lmkRef.current;
        frame.width = CANVAS_W; frame.height = CANVAS_H;
        lmk.width   = CANVAS_W; lmk.height   = CANVAS_H;

        const ctx = frame.getContext("2d");
        const lctx = lmk.getContext("2d");

        const { drawConnectors, drawLandmarks, HAND_CONNECTIONS } = window;

        // Init Hands (semua asset via CDN)
        const hands = new window.Hands({ locateFile: (f) => `${MP_HANDS}/${f}` });
        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5,
        });
        handsRef.current = hands;

        hands.onResults((results) => {
          if (cancelled.current) return;

          const video = videoRef.current;
          // gambar frame video ke canvas 640x480
          ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
          if (video && video.videoWidth) {
            ctx.drawImage(video, 0, 0, CANVAS_W, CANVAS_H);
          }

          // overlay landmarks
          lctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
          const lmsArr = results.multiHandLandmarks || [];

          if (lmsArr.length && modelRef.current) {
            for (const lms of lmsArr) {
              drawConnectors(lctx, lms, HAND_CONNECTIONS, { color: "#12057d", lineWidth: 2 });
              drawLandmarks(lctx, lms, { color: "#dc3767", radius: 2 });
            }

            const input = toInputTensor(lmsArr);
            try {
              const out = modelRef.current.predict(input);
              const arr = out.arraySync()[0];
              const maxV = Math.max(...arr);
              const idx = arr.indexOf(maxV);
              const letter = LABELS[idx] ?? "-";

              setPred(letter);
              setConf((maxV * 100).toFixed(1));

              const now = Date.now();
              if (maxV >= CONF_TH) {
                if (lastLetter === letter) {
                  if (!holdStart) holdStart = now;
                  const ok = now - holdStart >= HOLD_DURATION;
                  setOkHold(ok);
                } else {
                  lastLetter = letter;
                  holdStart = now;
                  setOkHold(false);
                }
              } else {
                lastLetter = null;
                holdStart = 0;
                setOkHold(false);
              }

              tfRef.current.dispose(out);
            } finally {
              input.dispose();
            }
          } else {
            setPred("-");
            setConf("-");
            setOkHold(false);
            lastLetter = null;
            holdStart = 0;
          }
        });

        // Kamera pakai kelas Camera dari MediaPipe (persis HTML)
        const cam = new window.Camera(videoRef.current, {
          onFrame: async () => {
            try { await hands.send({ image: videoRef.current }); } catch {}
          },
          width: CANVAS_W,
          height: CANVAS_H,
        });
        cameraRef.current = cam;

        // start camera
        await cam.start();
        setLoading(false);
      } catch (err) {
        console.error("[Practice minimal boot error]", err);
        setLoading(false);
      }
    }

    boot();

    return () => {
      cancelled.current = true;
      try { cameraRef.current?.stop?.(); } catch {}
      try { handsRef.current?.close?.(); } catch {}
      const v = videoRef.current;
      if (v) {
        try { v.pause(); } catch {}
        try { v.srcObject = null; } catch {}
      }
    };
  }, []);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, margin: "40px auto" }}>
      {/* wrapper di-mirror biar 1:1 dengan HTML */}
      <div style={{ position: "relative", width: "100%", height: "100%", transform: "scaleX(-1)" }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ display: "none" }} />
        <canvas
          ref={frameRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CANVAS_W,
            height: CANVAS_H,
            borderRadius: 10,
          }}
        />
        <canvas
          ref={lmkRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CANVAS_W,
            height: CANVAS_H,
            borderRadius: 10,
          }}
        />
      </div>

      {/* Overlay text persis HTML (posisi kira-kira sama) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: 20,
          zIndex: 10,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "rgba(0,0,0,0.5)",
            color: "gold",
            padding: "8px 16px",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 20,
            marginBottom: 8,
          }}
        >
          Predicted: {pred}
        </div>
        <div
          style={{
            background: "rgba(0,0,0,0.5)",
            color: "white",
            padding: "4px 8px",
            borderRadius: 6,
            fontSize: 14,
          }}
        >
          Confidence: {conf}%
        </div>
        {okHold && (
          <div
            style={{
              marginTop: 10,
              color: "lightgreen",
              background: "rgba(0,0,0,0.5)",
              fontWeight: 700,
              padding: "6px 10px",
              borderRadius: 8,
            }}
          >
            ✅ Berhasil!
          </div>
        )}
      </div>

      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(0,0,0,0.25)",
            borderRadius: 10,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "white",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            Memuat kamera & model…
          </div>
        </div>
      )}
    </div>
  );
}
