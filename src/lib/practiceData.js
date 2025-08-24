export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const MODULES = [
  { id: "mod-1", title: "Modul 1: A - E", slug: "a-e", range: ["A","B","C","D","E"] },
  { id: "mod-2", title: "Modul 2: F - J", slug: "f-j", range: ["F","G","H","I","J"] },
  { id: "mod-3", title: "Modul 3: K - O", slug: "k-o", range: ["K","L","M","N","O"] },
  { id: "mod-4", title: "Modul 4: P - T", slug: "p-t", range: ["P","Q","R","S","T"] },
  { id: "mod-5", title: "Modul 5: U - Z", slug: "u-z", range: ["U","V","W","X","Y","Z"] },
  { id: "mod-6", title: "Modul 6: Kata Kerja", slug: "verbs", range: null }, // words-mode
];

export function getModuleById(id) {
  return MODULES.find(m => m.id === id);
}

/** Kumpulan kata kerja (huruf latin, tanpa spasi di awal/akhir). */
export const VERBS = [
  "membangun","membaca","menulis","membantu","memikirkan","menjawab","mengajar",
  "belajar","berjalan","berlari","mendengar","melihat","mengetik","menggambar",
  "memasak","membersihkan","menghitung","memulai","mengakhiri","mencari","menemukan",
  "mengirim","menerima","menyusun","memilih","menyapa","menyanyi","menari",
  "bermain","berlatih"
];

/** Ambil N kata acak (unik). */
export function pickRandomVerbs(count = 6) {
  const pool = [...VERBS];
  const out = [];
  while (out.length < count && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}
