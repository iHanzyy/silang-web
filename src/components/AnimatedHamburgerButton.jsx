"use client";

import { useEffect, useState } from "react";
import { MotionConfig, motion } from "framer-motion";

export default function AnimatedHamburgerButton({
  onToggle,
  className = "cursor-pointer",
  size = "h-10 w-10",
  initialOpen = false,
}) {
  const [open, setOpen] = useState(initialOpen);

  // Update parent setelah render
  useEffect(() => {
    onToggle?.(open);
  }, [open, onToggle]);

  return (
    <MotionConfig transition={{ duration: 0.5, ease: "easeInOut" }}>
      <motion.button
        type="button"
        aria-label="Toggle menu"
        aria-expanded={open}
        initial={false}
        animate={open ? "open" : "closed"}
        onClick={() => setOpen((o) => !o)}
        className={`relative ${size} rounded-full bg-white/0 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${className}`}
      >
        {/* Top */}
        <motion.span
          variants={VARIANTS.top}
          className="absolute h-[2px] w-6 bg-white rounded"
          style={{ top: "35%", left: "50%", x: "-50%", y: "-50%" }}
        />
        {/* Middle */}
        <motion.span
          variants={VARIANTS.middle}
          className="absolute h-[2px] w-6 bg-white rounded"
          style={{ top: "50%", left: "50%", x: "-50%", y: "-50%" }}
        />
        {/* Bottom — sekarang SAMA panjang & CENTER */}
        <motion.span
          variants={VARIANTS.bottom}
          className="absolute h-[2px] w-6 bg-white rounded"
          style={{ bottom: "35%", left: "50%", x: "-50%", y: "50%" }}
        />
      </motion.button>
    </MotionConfig>
  );
}

const VARIANTS = {
  top: {
    open:   { rotate: ["0deg", "0deg", "45deg"], top:   ["35%", "50%", "50%"] },
    closed: { rotate: ["45deg", "0deg", "0deg"], top:   ["50%", "50%", "35%"] },
  },
  middle: {
    open:   { rotate: ["0deg", "0deg", "-45deg"] },
    closed: { rotate: ["-45deg", "0deg", "0deg"] },
  },
  bottom: {
    open:   { rotate: ["0deg", "0deg", "45deg"], bottom: ["35%", "50%", "50%"], left: "50%" },
    closed: { rotate: ["45deg", "0deg", "0deg"], bottom: ["50%", "50%", "35%"], left: "50%" },
  },
};
