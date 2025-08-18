import Image from "next/image";
import { orbitron, quicksand, baloo } from "@/lib/fonts";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-14 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left text */}
        <div>
          <p className={`text-[15px] uppercase tracking-[0.2em] text-slate-300/80 ${orbitron.className} font-bold`}>
            Sign Language, a Universal Connection
          </p>

          <h1 className={`mt-4 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-slate-50 ${baloo.className}`}>
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

          <div className={`mt-10 flex flex-wrap items-center gap-4 ${quicksand.className}`}>
            <a
              id="get-started"
              href="#learn"
              className="inline-flex items-center justify-center rounded-xl bg-white text-[#3B38A0] px-5 py-3 font-bold shadow hover:shadow-lg transition"
            >
              Start Learning <ArrowRight size={20} />
            </a>
            <a
              href="/about"
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 font-bold text-[#3B38A0] hover:shadow-lg transition"
            >
              About SiLang
            </a>
          </div>
        </div>

        {/* Right image card */}
        <div className="rounded-3xl card-ivory p-8 md:p-12 shadow-2xl">
          <div className="aspect-[16/10] w-full relative rounded-2xl overflow-hidden">
            <Image
              src="/SilangBackgroundMain.png"
              alt="Sign Language Illustration"
              fill
              className="object-cover object-center"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
