"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Icon } from "lucide-react";

/**
 * RoundedSlideButton (robust icon for forwardRef, smooth + scale on hover)
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

  // Animasi
  const wrapper = {
    rest:  { scale: 1, boxShadow: "0 0 0 rgba(0,0,0,0)" },
    hover: { scale: 1.03, boxShadow: "0 10px 24px rgba(0,0,0,0.18)" },
    tap:   { scale: 0.99 },
  };
  const overlay = {
    rest:  { clipPath: "circle(0% at 12% 50%)" },
    hover: {
      clipPath: "circle(145% at 12% 50%)",
      transition: { type: "spring", mass: 0.6, stiffness: 170, damping: 26 },
    },
    tap: {
      clipPath: "circle(160% at 12% 50%)",
      transition: { type: "spring", mass: 0.6, stiffness: 200, damping: 22 },
    },
  };
  const content = {
    rest:  { color: "#FFFFFF" },
    hover: { color: textPurple, transition: { duration: 0.22, ease: "easeOut" } },
    tap:   { color: textPurple },
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
          ring-2 ring-inset transition-shadow
        "
        style={{ ["--tw-ring-color"]: borderColor }}
      >
        {/* Fill */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-xl"
          style={{ backgroundColor: color }}
          variants={overlay}
        />

        {/* Konten */}
        <motion.span className="relative z-10 inline-flex items-center gap-2" variants={content}>
          {iconPlacement === "left" && renderIcon()}
          <span>{label}</span>
          {iconPlacement === "right" && renderIcon()}
        </motion.span>
      </Comp>
    </motion.div>
  );
}
