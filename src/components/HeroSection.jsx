"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { orbitron, quicksand, baloo } from "@/lib/fonts";
import RoundedSlideButton from "@/components/RoundedSlideButton";
import { Info } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-14 pb-24 lg:mt-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left text with motion animation */}
        <motion.div
          initial={{
            x: -100,
            opacity: 0,
          }}
          animate={{
            x: 0,
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: 0.1,
          }}
        >
          <p
            className={`text-[15px] uppercase tracking-[0.2em] text-slate-300/80 ${orbitron.className} font-bold`}
          >
            Sign Language, a Universal Connection
          </p>

          <h1
            className={`mt-4 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-slate-50 ${baloo.className}`}
          >
            Through hands we
            <br />
            share <span className="text-[#7A85C1]">emotions</span>,
            <br />
            break <span className="text-[#7A85C1]">barriers</span>,
            <br />
            and build
            <br />
            <span className="text-[#7A85C1]">understanding</span>.
          </h1>

          <div
            className={`mt-10 flex flex-wrap items-center gap-4 ${quicksand.className}`}
          >
            <RoundedSlideButton
              href="/dashboard"
              label="Start Learning"
              color="#B2B0E8"
            />
            <RoundedSlideButton
              href="/about"
              icon={Info}
              label="About SiLang"
              color="#B2B0E8"
            />
          </div>
        </motion.div>

        {/* Right image card with motion animation */}
        <motion.div
          className="rounded-3xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: "#F9F6EE" }}
          initial={{
            scale: 0.8,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: 0.2,
          }}
        >
          <div className="aspect-[16/10] w-full relative">
            <Image
              src="/SilangBackgroundMain.webp"
              alt="Sign Language Illustration"
              fill
              className="object-cover object-center rounded-3xl"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
