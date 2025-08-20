// src/app/about/page.js
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutHero from "@/components/AboutHero";

export const metadata = {
  title: "About — SiLang",
  description:
    "Learn more about SiLang — our story, mission, and why we build it.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <AboutHero />
      </main>
      <Footer />
    </>
  );
}
