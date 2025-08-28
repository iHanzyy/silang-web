"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Icon } from "lucide-react";

/**
 * RoundedSlideButton with Blob Animation (gooey effect)
 */
export default function RoundedSlideButton({
  label = "Sign Up Free",
  href,
  onClick,
  icon,                    // undefined → fallback ArrowRight, null/false → tanpa ikon
  iconSize = 18,
  iconPlacement = "left",
  color = "#FFFFFF",       // fill saat hover
  textPurple = "#3B38A0",  // warna teks/ikon saat hover
  borderColor = "#B2B0E8",
  className = "",
}) {
  const Comp = href ? Link : "button";

  // Fallback: kalau icon === undefined → pakai ArrowRight (default)
  const finalIcon = icon === undefined ? ArrowRight : icon;

  // Animasi wrapper (scale effect)
  const wrapper = {
    rest:  { scale: 1 },
    hover: { scale: 1.03 },
    tap:   { scale: 0.99 },
  };

  // Animasi konten (color change)
  const content = {
    rest:  { color: "#FFFFFF" },
    hover: { 
      color: textPurple, 
      transition: { duration: 0.5 } 
    },
    tap:   { color: textPurple },
  };

  // Animasi blob individual
  const blobVariants = {
    rest: {
      transform: "translate3d(0, 150%, 0) scale(1.4)",
      transition: { duration: 0.45 }
    },
    hover: {
      transform: "translateZ(0) scale(1.4)",
      transition: { duration: 0.45 }
    }
  };

  // --- Render ikon secara aman (support forwardRef object) ---
  const renderIcon = () => {
    if (!finalIcon) return null; // null/false → tanpa ikon

    // (1) Jika user mengirim elemen langsung: <ArrowRight />
    if (React.isValidElement(finalIcon)) {
      return React.cloneElement(finalIcon, {
        size: finalIcon.props.size ?? iconSize,
        color: "currentColor",
        className: ["shrink-0", finalIcon.props.className].filter(Boolean).join(" "),
        "aria-hidden": true,
      });
    }

    // (2) Jika komponen fungsi normal
    if (typeof finalIcon === "function") {
      const IconComp = finalIcon;
      return <IconComp size={iconSize} color="currentColor" className="shrink-0" aria-hidden />;
    }

    // (3) Jika forwardRef object (punya $$typeof & render)
    if (typeof finalIcon === "object" && (finalIcon.$$typeof || finalIcon.render)) {
      const IconComp = finalIcon; // React menerima object component type dari forwardRef
      return <IconComp size={iconSize} color="currentColor" className="shrink-0" aria-hidden />;
    }

    // Bentuk lain (string/objek modul) → abaikan agar tidak crash
    return null;
  };

  return (
    <>
      {/* SVG Gooey Filter */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <motion.div
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileFocus="hover"
        whileTap="tap"
        variants={wrapper}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={`inline-block ${className}`}
      >
        <Comp
          {...(href ? { href } : { onClick })}
          {...(!href ? { type: "button" } : {})}
          className="
            group relative overflow-hidden
            inline-flex items-center justify-center
            rounded-xl px-5 py-2.5
            font-semibold tracking-wide
            focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
            transition-colors duration-500
          "
          style={{ 
            border: `2px solid ${borderColor}`,
            backgroundColor: 'transparent'
          }}
        >
          {/* Blob Container */}
          <div 
            className="absolute inset-0 rounded-xl overflow-hidden"
            style={{ filter: 'url(#goo)' }}
          >
            {/* 4 Blobs */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute top-0 h-full rounded-full"
                style={{
                  width: '25%', // 100% / 4
                  left: `${i * 30}%`, // (i * 120% / 4)
                  backgroundColor: color,
                }}
                variants={blobVariants}
                transition={{
                  duration: 0.45,
                  delay: i * 0.08, // staggered delay
                }}
              />
            ))}
          </div>

          {/* Konten */}
          <motion.span 
            className="relative z-10 inline-flex items-center gap-2" 
            variants={content}
          >
            {iconPlacement === "left" && renderIcon()}
            <span>{label}</span>
            {iconPlacement === "right" && renderIcon()}
          </motion.span>
        </Comp>
      </motion.div>
    </>
  );
}
