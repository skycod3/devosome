import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { RESUME, type Locale, type ResumeContent } from "./resume-content";

/**
 * Guards the generated PDFs against two failures:
 *  1. text rendered as image (an ATS would not be able to read it);
 *  2. drift — content edited here without re-running `npm run resume:pdf`.
 */

const PDF_BY_LOCALE: Record<Locale, string> = {
  en: "resume.pdf",
  pt: "resume.pt.pdf",
};

const DOCUMENTS_DIR = resolve(process.cwd(), "public/documents");

/** Strips all whitespace — immune to how the PDF split its text runs. */
function compact(value: string): string {
  return value.replace(/\s+/g, "");
}

async function readPdf(file: string): Promise<{ text: string; pages: number }> {
  const buffer = await readFile(resolve(DOCUMENTS_DIR, file));
  const doc = await getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  }).promise;
  const pages = doc.numPages;
  let text = "";
  for (let pageNumber = 1; pageNumber <= pages; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    text += content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
  }
  await doc.destroy();
  return { text: compact(text), pages };
}

/** Every string the sheet is expected to render, derived from the content module. */
function expectedStrings(content: ResumeContent): string[] {
  return [
    content.name,
    content.headline,
    content.summary,
    content.contact.email,
    content.contact.linkedin,
    content.contact.github,
    ...content.experience.flatMap((job) => [
      job.role,
      job.company,
      job.period,
      ...job.bullets,
    ]),
    ...content.skills.map((skill) => skill.label),
    content.project.name,
    content.educationLabel,
    content.education,
    content.languagesLabel,
    content.languages,
  ];
}

describe.each(Object.keys(PDF_BY_LOCALE) as Locale[])(
  "generated resume PDF (%s)",
  (locale) => {
    const file = PDF_BY_LOCALE[locale];

    it("fits on a single page", async () => {
      const { pages } = await readPdf(file);
      expect(pages).toBe(1);
    });

    it("carries every string from the content module as selectable text", async () => {
      const { text } = await readPdf(file);
      const missing = expectedStrings(RESUME[locale]).filter(
        (value) => !text.includes(compact(value)),
      );

      // A failure here usually means the content changed and the PDF was not
      // regenerated — run `npm run resume:pdf` (see the script for the flow).
      expect(missing).toEqual([]);
    });
  },
);
