// Batch image generator for seed landmark images
// Usage: node generate-seed-images.js <seed-id>
// Example: node generate-seed-images.js space-odyssey

import { readFileSync } from "fs";
import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";

const CLI = "C:/Users/User/.claude/plugins/cache/media-pipeline-marketplace/media-pipeline/1.0.0/mcp-server/build/cli.bundle.js";
const BASE = "c:/Users/User/Documents/My Project/Board Game Live/assets/seeds";

// Load seeds data
const seedsCode = readFileSync("src/seeds.js", "utf8");

// Simple seed extractor — find the seed by ID in SEED_CATALOG
const seedId = process.argv[2];
if (!seedId) {
  console.error("Usage: node generate-seed-images.js <seed-id>");
  process.exit(1);
}

// We need to dynamically import the seeds module
const seedsMod = await import("./src/seeds.js");
const seed = seedsMod.getSeed(seedId);

if (!seed) {
  console.error(`Seed not found: ${seedId}`);
  process.exit(1);
}

const outDir = `${BASE}/${seedId}`;
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

console.log(`\nGenerating ${seed.landmarks.length} landmark images for: ${seed.name} (${seedId})`);
console.log(`Output: ${outDir}\n`);

// Theme description for consistent style
const themeDesc = {
  "space-odyssey": "futuristic space exploration, sci-fi cosmic environment",
  "ai-wars": "futuristic AI technology, glowing circuits and holographic displays",
  "deep-ocean": "deep underwater ocean environment, bioluminescent and aquatic",
  "wall-street": "financial district, stock exchange, modern glass skyscrapers",
  "silicon-valley": "modern tech campus, clean minimalist technology aesthetic",
  "ancient-empires": "ancient civilization ruins, historical stone architecture",
  "fantasy-kingdom": "magical fantasy realm, enchanted medieval environment",
  "cyberpunk-city": "neon-lit cyberpunk dystopian city, rain and holographics",
  "wild-west": "American Wild West frontier, desert and wooden buildings",
  "dinosaur-era": "prehistoric Jurassic environment, dinosaurs and primeval nature",
  "pirate-seas": "Caribbean pirate adventure, sailing ships and tropical islands",
  "arctic-expedition": "polar Arctic environment, ice glaciers and aurora borealis",
  "music-legends": "music industry, concert venues, instruments and stage lights",
  "baseball-league": "professional baseball, stadiums and team culture",
  "food-empire": "gourmet cuisine, restaurants and culinary arts",
  "movie-studio": "Hollywood film production, cinema and movie sets",
  "crypto-metaverse": "cryptocurrency and virtual reality, digital blockchain world",
  "medieval-castle": "medieval European castles and fortress architecture",
  "tropical-paradise": "tropical island resort, beaches and clear ocean",
  "steampunk-world": "Victorian steampunk, brass machinery and steam power",
  "kpop-hallyu": "Korean K-POP culture, concert stages and Seoul cityscape",
  "amazon-jungle": "Amazon rainforest, dense tropical jungle and rivers",
  "mars-colony": "Mars colonization, red planet landscape with dome cities",
  "luxury-brands": "luxury fashion, elegant boutiques and designer aesthetics",
  "art-gallery": "fine art museum, classical paintings and sculptures",
  "railway-tycoon": "railway and trains, steam locomotives and stations",
  "volcano-islands": "volcanic landscape, erupting volcanoes and lava flows",
  "robot-factory": "robot manufacturing, humanoid robots and assembly lines",
  "fairy-tale": "fairy tale storybook, enchanted magical pastel world",
  "zombie-apocalypse": "post-apocalyptic zombie survival, abandoned ruined city",
  "natural-resources": "mining and natural resources, oil rigs and gold mines",
  "department-store": "luxury department store, elegant retail interiors",
};

const theme = themeDesc[seedId] || seed.description;

let generated = 0;
let skipped = 0;
let failed = 0;

for (const lm of seed.landmarks) {
  const filename = `${lm.id}.png`;
  const outPath = `${outDir}/${filename}`;

  if (existsSync(outPath)) {
    console.log(`  SKIP ${lm.name} (already exists)`);
    skipped++;
    continue;
  }

  const prompt = `Board game landmark tile illustration: ${lm.name} in ${lm.city}. ${lm.flavor} Style: ${theme}. Detailed digital art, suitable for a small board game tile, 4:3 aspect ratio, dark atmospheric background`;

  console.log(`  [${generated + skipped + failed + 1}/${seed.landmarks.length}] Generating: ${lm.name}...`);

  try {
    const result = execSync(
      `node "${CLI}" --prompt "${prompt.replace(/"/g, '\\"')}" --output "${outPath}" --aspect-ratio "4:3"`,
      { timeout: 60000, encoding: "utf8" }
    );
    const json = JSON.parse(result.split("\n").pop());
    if (json.success) {
      console.log(`    ✓ ${filename}`);
      generated++;
    } else {
      console.log(`    ✗ ${json.error}`);
      failed++;
    }
  } catch (err) {
    console.log(`    ✗ Error: ${err.message?.slice(0, 80)}`);
    failed++;
  }
}

console.log(`\nDone! Generated: ${generated}, Skipped: ${skipped}, Failed: ${failed}`);
