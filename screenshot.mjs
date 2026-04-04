import { chromium } from "playwright";
import { mkdirSync } from "fs";

const BASE = "http://localhost:3333";
const DIR = "./screenshots";
mkdirSync(DIR, { recursive: true });

const pages = [
  { name: "landing-full", path: "/pt-BR", fullPage: true },
  { name: "landing-hero", path: "/pt-BR", fullPage: false },
  { name: "gifts", path: "/pt-BR/gifts", fullPage: false },
  { name: "gallery", path: "/pt-BR/gallery", fullPage: true },
];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});

for (const p of pages) {
  const page = await context.newPage();
  await page.goto(`${BASE}${p.path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/${p.name}.png`, fullPage: p.fullPage ?? false });
  console.log(`Screenshot: ${p.name}`);
  await page.close();
}

await browser.close();
console.log("Done!");
