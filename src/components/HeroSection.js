import Image from "next/image";
import { orbitron, quicksand, baloo } from "@/lib/fonts";
import RoundedSlideButton from "@/components/RoundedSlideButton";


export default function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-14 pb-24 lg:mt-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left text */}
        <div>
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
              icon={null}
              label="About SiLang"
              color="#B2B0E8"
            />
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
