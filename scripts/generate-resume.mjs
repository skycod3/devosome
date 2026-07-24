// Generates resume.pdf (EN) and resume.pt.pdf (PT) from the /resume/[lang] routes.
// Requires the Next server running in production mode at RESUME_BASE_URL.
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const BASE_URL = process.env.RESUME_BASE_URL ?? "http://localhost:3000";
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../public/documents");

const TARGETS = [
  { lang: "en", file: "resume.pdf" },
  { lang: "pt", file: "resume.pt.pdf" },
];

async function assertServerUp() {
  try {
    const res = await fetch(`${BASE_URL}/resume/en`, { method: "HEAD" });
    if (!res.ok) throw new Error(`status ${res.status}`);
  } catch (err) {
    console.error(
      `\n✖ No server found at ${BASE_URL}.\n` +
        `  Run in another terminal:  npm run build && npm start\n` +
        `  (or set RESUME_BASE_URL)\n`,
    );
    throw err;
  }
}

async function main() {
  await assertServerUp();
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch();
  try {
    for (const { lang, file } of TARGETS) {
      const page = await browser.newPage();
      await page.goto(`${BASE_URL}/resume/${lang}`, {
        waitUntil: "networkidle0",
      });
      // Wait for fonts to load before printing, otherwise they fall back.
      await page.evaluate(() => document.fonts.ready);
      const out = resolve(OUT_DIR, file);
      await page.pdf({
        path: out,
        preferCSSPageSize: true, // honors @page { size: A4 }
        printBackground: true, // keeps chip backgrounds and colors
      });
      console.log(`✓ ${file}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
