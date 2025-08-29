"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { orbitron, quicksand } from "@/lib/fonts";

export default function PracticeGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* Modal content */}
        <motion.div
          className="relative mx-4 w-full max-w-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="rounded-2xl bg-[#1A2A80] p-6 ring-1 ring-white/20">
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-700/20">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className={`text-xl font-bold text-white ${orbitron.className}`}>
                Panduan Sebelum Memulai
              </h3>
            </div>

            {/* Content */}
            <div className={`mt-4 space-y-4 text-white/80 ${quicksand.className}`}>
              {/* Persiapan Kamera */}
              <div>
                <h4 className="font-semibold text-white mb-2">Persiapan Kamera:</h4>
                <ul className="text-sm space-y-1 ml-4">
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">•</span>
                    <span>Pastikan kamera tidak buram dan memiliki pencahayaan yang cukup</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">•</span>
                    <span>Hindari silau cahaya langsung dan ruangan yang terlalu gelap</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">•</span>
                    <span>Mohon tunggu hingga kamera berhasil dimuat sebelum memulai latihan</span>
                  </li>
                </ul>
              </div>

              {/* Panduan Deteksi */}
              <div>
                <h4 className="font-semibold text-white mb-2">Panduan Deteksi Gerakan:</h4>
                <ul className="text-sm space-y-1 ml-4">
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">•</span>
                    <span>Perhatikan gambar contoh gerakan tangan di sebelah kanan layar</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">•</span>
                    <span>Sistem deteksi sensitif terhadap posisi tangan kanan dan kiri</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">•</span>
                    <span>Ikuti contoh gerakan dengan tepat untuk mendapatkan hasil terbaik</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Button */}
            <div className="mt-6">
              <button
                onClick={onClose}
                className={`
                  w-full rounded-xl bg-blue-600 
                  py-3 px-4 text-sm font-semibold text-white 
                  hover:bg-blue-500 transition-colors
                  ${quicksand.className}
                  cursor-pointer
                `}
              >
                Mengerti
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
