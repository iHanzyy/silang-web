import { Orbitron, Baloo_2, Quicksand } from "next/font/google";

export const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-orbitron",
  preload: true,
});

export const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-baloo",
  preload: true,
});

export const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-quicksand",
  preload: true,
});
