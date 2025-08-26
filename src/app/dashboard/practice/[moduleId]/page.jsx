// Server Component
import PracticeSession from "@/components/practice/PracticeSession";

const MODULES = {
  "mod-1": { title: "Modul 1: A - E", letters: ["A","B","C","D","E"] },
  "mod-2": { title: "Modul 2: F - J", letters: ["F","G","H","I","J"] },
  "mod-3": { title: "Modul 3: K - O", letters: ["K","L","M","N","O"] },
  "mod-4": { title: "Modul 4: P - T", letters: ["P","Q","R","S","T"] },
  "mod-5": { title: "Modul 5: U - Z", letters: ["U","V","W","X","Y","Z"] },
  "mod-6": {
    title: "Modul 6: Kata Kerja",
    words: ["membangun","menulis","membaca","memikirkan","mengajar"],
  },
};

// ⬇⬇ Next 15: params can be a thenable in dev — await it before reading.
export default async function PracticeModulePage(props) {
  const prm = (props?.params && typeof props.params.then === "function")
    ? await props.params
    : props.params;

  const moduleId = prm?.moduleId || "mod-1";
  const cfg = MODULES[moduleId] || MODULES["mod-1"];

  return (
    <PracticeSession
      moduleId={moduleId}
      title={cfg.title}
      letters={cfg.letters}
      words={cfg.words}
    />
  );
}
