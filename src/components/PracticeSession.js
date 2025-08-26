"use client";

import { useEffect, useRef, useState } from "react";

/* ===== Konfigurasi ===== */
const HANDS_VERSION = "0.4.1675469240"; // stabil di jsDelivr
const TFJS_VERSION  = "4.14.0";         // sama dengan contoh HTML
const MODEL_URL     = "/ai/model.json"; // pastikan public/ai/ berisi model.json + shard .bin

/* ===== Util ===== */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const waitFor = async (fn, timeout = 6000, step = 50) => {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const v = fn();
    if (v) return v;
    await sleep(step);
  }
  return null;
};
const loadScriptOnce = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-key="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.async = true;
    s.defer = true;
    s.src = src;
    s.crossOrigin = "anonymous";
    s.dataset.key = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });

async function ensureCDNs() {
  await loadScriptOnce(`https://cdn.jsdelivr.net/npm/@mediapipe/hands@${HANDS_VERSION}/hands.min.js`);
  await loadScriptOnce("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js");
  await loadScriptOnce("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
  await loadScriptOnce(`https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@${TFJS_VERSION}/dist/tf.min.js`);
  await waitFor(() => window.Hands && window.drawConnectors && window.HAND_CONNECTIONS && window.Camera && window.tf);
}

/* ==== Fitur 126D persis HTML ==== */
function normalizeLandmarks(landmarks, wrist) {
  return landmarks.map((lm) => [lm.x - wrist.x, lm.y - wrist.y, lm.z - wrist.z]);
}
function toFeatures(landmarksArray) {
  let features = [];
  if (landmarksArray.length === 1) {
    const left = Array(63).fill(0);
    features.push(...left);
    const right = normalizeLandmarks(landmarksArray[0], landmarksArray[0][0]);
    right.forEach((c) => features.push(...c));
  } else if (landmarksArray.length === 2) {
    const sorted = [...landmarksArray].sort((a, b) => a[0].x - b[0].x);
    const left  = normalizeLandmarks(sorted[0], sorted[0][0]);
    const right = normalizeLandmarks(sorted[1], sorted[1][0]);
    left.forEach((c) => features.push(...c));
    right.forEach((c) => features.push(...c));
  }
  if (features.length !== 126) features = Array(126).fill(0);
  return window.tf.tensor2d([features], [1, 126]);
}

export default function PracticeSession() {
  const videoRef = useRef(null);
  const camCanvasRef = useRef(null);
  const lmkCanvasRef = useRef(null);

  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);

  const mountedRef = useRef(false);

  const [pred, setPred] = useState("-");
  const [conf, setConf] = useState("-");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        // 1) Muat script CDN
        await ensureCDNs();
        if (cancelled) return;

        const video = videoRef.current;
        const camCan = camCanvasRef.current;
        const camCtx = camCan.getContext("2d");
        const lmkCan = lmkCanvasRef.current;
        const lmkCtx = lmkCan.getContext("2d");

        // 2) Set ukuran sama seperti HTML
        camCan.width = lmkCan.width = 640;
        camCan.height = lmkCan.height = 480;

        // 3) Muat model
        try {
          modelRef.current = await window.tf.loadGraphModel(MODEL_URL);
        } catch (e) {
          console.error("Gagal load model TFJS:", e);
          throw e;
        }
        if (cancelled) return;

        // 4) Inisialisasi Hands (semua asset via CDN → hilangkan error *.data/wasm)
        const hands = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${HANDS_VERSION}/${file}`,
        });
        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5,
        });
        handsRef.current = hands;

        // 5) Prediksi + gambar landmark di onResults (JANGAN gambar frame kamera di sini)
        const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        const CONFIDENCE_TH = 0.8;

        hands.onResults((results) => {
          if (cancelled) return;
          // Bersihkan & gambar landmark di overlay
          lmkCtx.clearRect(0, 0, lmkCan.width, lmkCan.height);
          if (results.multiHandLandmarks?.length) {
            for (const lm of results.multiHandLandmarks) {
              window.drawConnectors(lmkCtx, lm, window.HAND_CONNECTIONS, { color: "#12057d", lineWidth: 2 });
              window.drawLandmarks(lmkCtx, lm, { color: "#dc3767", radius: 2 });
            }
          }

          // Prediksi model (opsional jika ada landmark)
          if (results.multiHandLandmarks?.length && modelRef.current) {
            const input = toFeatures(results.multiHandLandmarks);
            try {
              const out = modelRef.current.predict(input);
              const arr = out.arraySync()[0];
              const maxV = Math.max(...arr);
              const letter = LABELS[arr.indexOf(maxV)] ?? "-";
              setPred(letter);
              setConf((maxV * 100).toFixed(1));
              window.tf.dispose(out);
            } catch (e) {
              setPred("-");
              setConf("-");
            } finally {
              input.dispose();
            }
          } else {
            setPred("-");
            setConf("-");
          }
        });

        // 6) Mulai kamera – gambar frame kamera **di onFrame**, agar selalu tampil walau Hands belum siap
        cameraRef.current = new window.Camera(video, {
          onFrame: async () => {
            // gambar kamera ke canvas setiap frame (mirror di style)
            try {
              camCtx.clearRect(0, 0, camCan.width, camCan.height);
              camCtx.drawImage(video, 0, 0, camCan.width, camCan.height);
            } catch { /* noop */ }

            // kirim ke Hands (jika assets belum siap, abaikan error supaya loop lanjut)
            try {
              await handsRef.current.send({ image: video });
            } catch { /* skip frame */ }
          },
          width: 640,
          height: 480,
          facingMode: "user",
        });

        // Pastikan metadata siap lalu play(); handle AbortError
        const ensureMetadata = async () => {
          if (video.readyState >= 2) return;
          await new Promise((res) => {
            const h = () => { video.onloadedmetadata = null; res(); };
            video.onloadedmetadata = h;
          });
        };

        await cameraRef.current.start();
        await ensureMetadata();
        try {
          await video.play();
        } catch (err) {
          if (err?.name === "AbortError") {
            await sleep(120);
            await video.play();
          }
        }

        if (!cancelled) setLoading(false);
      } catch (e) {
        console.error("Init error:", e);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      try { handsRef.current?.close?.(); } catch {}
      try { cameraRef.current?.stop?.(); } catch {}
      const v = videoRef.current;
      if (v?.srcObject) {
        try { v.pause(); } catch {}
        try { v.srcObject.getTracks().forEach((t) => t.stop()); } catch {}
        v.srcObject = null;
      }
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "#fff" }}>
      <h1 style={{ marginTop: 20, textAlign: "center" }}>Deteksi Bahasa Isyarat</h1>

      {/* video disembunyikan (sumber frame) */}
      <video ref={videoRef} autoPlay playsInline muted style={{ display: "none" }} />

      {/* canvas kamera – SELALU digambar dari onFrame */}
      <canvas
        ref={camCanvasRef}
        style={{
          position: "absolute",
          top: 80,
          left: "50%",
          width: 640,
          height: 480,
          borderRadius: 10,
          transform: "scale(-1, 1) translateX(50%)",
        }}
      />
      {/* overlay landmark */}
      <canvas
        ref={lmkCanvasRef}
        style={{
          position: "absolute",
          top: 80,
          left: "50%",
          width: 640,
          height: 480,
          borderRadius: 10,
          transform: "scale(-1, 1) translateX(50%)",
          pointerEvents: "none",
        }}
      />

      {/* UI status */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          fontSize: 24,
          fontWeight: "bold",
          color: "gold",
          background: "rgba(0,0,0,.5)",
          padding: "8px 16px",
          borderRadius: 10,
        }}
      >
        Predicted: {pred}
      </div>
      <div
        style={{
          position: "absolute",
          top: 145,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          fontSize: 16,
          background: "rgba(0,0,0,.5)",
          padding: "4px 8px",
          borderRadius: 5,
        }}
      >
        Confidence: {conf === "-" ? "-" : `${conf}%`}
      </div>

      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(0,0,0,.35)",
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,.08)",
              padding: "10px 16px",
              border: "1px solid rgba(255,255,255,.2)",
              borderRadius: 12,
            }}
          >
            Memuat kamera & model…
          </div>
        </div>
      )}
    </div>
  );
}
