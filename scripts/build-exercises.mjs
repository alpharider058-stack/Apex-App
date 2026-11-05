// Builds the exercise library from yuhonas/free-exercise-db (public domain / Unlicense).
// Selects ~320 gym exercises with balanced muscle coverage, downloads both frames,
// converts them to compact WebP and writes src/data/exercises.json.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main';
const OUT_IMG = path.resolve('public/ex');
const OUT_JSON = path.resolve('src/data/exercises.json');
const TARGET = 320;

const EQUIP_OK = new Set(['barbell', 'dumbbell', 'cable', 'machine', 'body only', 'e-z curl bar', 'kettlebells', 'other', 'bands']);
const CAT_OK = new Set(['strength', 'powerlifting', 'olympic weightlifting', 'plyometrics']);
const EQUIP_W = { barbell: 6, dumbbell: 6, cable: 5, machine: 5, 'e-z curl bar': 4, 'body only': 4, kettlebells: 2, other: 1, bands: 0 };
const LEVEL_W = { beginner: 3, intermediate: 2, expert: 0 };

// Well-known lifts that must always be included if present
const MUST = [
  'Barbell Bench Press - Medium Grip', 'Barbell Squat', 'Barbell Deadlift', 'Pullups', 'Chin-Up', 'Dips - Chest Version',
  'Dips - Triceps Version', 'Incline Dumbbell Press', 'Dumbbell Bench Press', 'Barbell Curl', 'Hammer Curls',
  'Standing Military Press', 'Seated Dumbbell Press', 'Bent Over Barbell Row', 'One-Arm Dumbbell Row', 'Wide-Grip Lat Pulldown',
  'Seated Cable Rows', 'Leg Press', 'Leg Extensions', 'Lying Leg Curls', 'Seated Leg Curl', 'Romanian Deadlift',
  'Standing Calf Raises', 'Seated Calf Raise', 'Side Lateral Raise', 'Cable Crossover', 'Butterfly', 'Triceps Pushdown',
  'EZ-Bar Skullcrusher', 'Preacher Curl', 'Face Pull', 'Barbell Hip Thrust', 'Hack Squat', 'Front Barbell Squat',
  'Pushups', 'Plank', 'Crunches', 'Hanging Leg Raise', 'Barbell Shrug', 'Dumbbell Lunges', 'Goblet Squat',
  'Incline Barbell Bench Press', 'Decline Barbell Bench Press', 'Arnold Dumbbell Press', 'Reverse Flyes',
  'Concentration Curls', 'Cable Hammer Curls - Rope Attachment', 'Smith Machine Squat', 'Thigh Abductor', 'Thigh Adductor',
];

const db = await (await fetch(`${SRC}/dist/exercises.json`)).json();
const pool = db.filter((e) => CAT_OK.has(e.category) && EQUIP_OK.has(e.equipment) && e.images?.length >= 2);

const score = (e) =>
  (EQUIP_W[e.equipment] ?? 0) + (LEVEL_W[e.level] ?? 0) + (e.mechanic === 'compound' ? 2 : 0) +
  (e.category === 'strength' ? 2 : 0) - (/(variation|- version| with bands|band )/i.test(e.name) ? 2 : 0);

const picked = new Map();
for (const name of MUST) {
  const e = pool.find((x) => x.name.toLowerCase() === name.toLowerCase());
  if (e) picked.set(e.id, e);
}

// Balanced quota by primary muscle
const byMuscle = {};
for (const e of pool) (byMuscle[e.primaryMuscles[0]] ??= []).push(e);
for (const k in byMuscle) byMuscle[k].sort((a, b) => score(b) - score(a));
const muscles = Object.keys(byMuscle);
const totals = Object.fromEntries(muscles.map((m) => [m, byMuscle[m].length]));
const sum = Object.values(totals).reduce((a, b) => a + b, 0);
const idx = Object.fromEntries(muscles.map((m) => [m, 0]));
const quota = Object.fromEntries(muscles.map((m) => [m, Math.max(6, Math.round((totals[m] / sum) * TARGET))]));
const countFor = (m) => [...picked.values()].filter((e) => e.primaryMuscles[0] === m).length;
let progress = true;
while (picked.size < TARGET && progress) {
  progress = false;
  for (const m of muscles) {
    if (picked.size >= TARGET) break;
    if (countFor(m) >= quota[m]) continue;
    while (idx[m] < byMuscle[m].length && picked.has(byMuscle[m][idx[m]].id)) idx[m]++;
    if (idx[m] < byMuscle[m].length) { picked.set(byMuscle[m][idx[m]].id, byMuscle[m][idx[m]]); progress = true; }
  }
}
// Fill remainder with best overall
const rest = pool.filter((e) => !picked.has(e.id)).sort((a, b) => score(b) - score(a));
while (picked.size < TARGET && rest.length) { const e = rest.shift(); picked.set(e.id, e); }

await fs.mkdir(OUT_IMG, { recursive: true });
await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });

const list = [...picked.values()];
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const out = [];
let i = 0;
const queue = [...list];
async function worker() {
  while (queue.length) {
    const e = queue.shift();
    const id = slug(e.id);
    for (const f of [0, 1]) {
      const dest = path.join(OUT_IMG, `${id}-${f}.webp`);
      try { await fs.access(dest); continue; } catch {}
      const res = await fetch(`${SRC}/exercises/${e.images[f]}`);
      if (!res.ok) throw new Error(`${res.status} ${e.images[f]}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await sharp(buf).resize({ width: 560, withoutEnlargement: true }).webp({ quality: 74 }).toFile(dest);
    }
    out.push({
      id,
      name: e.name,
      force: e.force,
      level: e.level,
      mechanic: e.mechanic,
      equipment: e.equipment,
      category: e.category,
      primary: e.primaryMuscles,
      secondary: e.secondaryMuscles,
      instructions: e.instructions,
    });
    i++;
    if (i % 20 === 0) console.log(`${i}/${list.length}`);
  }
}
await Promise.all(Array.from({ length: 12 }, worker));
out.sort((a, b) => a.name.localeCompare(b.name));
await fs.writeFile(OUT_JSON, JSON.stringify(out));
const perMuscle = {};
for (const e of out) perMuscle[e.primary[0]] = (perMuscle[e.primary[0]] ?? 0) + 1;
console.log('Total', out.length, perMuscle);
