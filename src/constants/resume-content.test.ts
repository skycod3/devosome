import { describe, expect, it } from "vitest";
import { RESUME, type Locale, type ResumeContent } from "./resume-content";

const LOCALES: Locale[] = ["en", "pt"];

function keysOf(c: ResumeContent): string[] {
  return Object.keys(c).sort();
}

describe("resume-content", () => {
  it("has both locales", () => {
    expect(Object.keys(RESUME).sort()).toEqual(["en", "pt"]);
  });

  it("both locales share the same top-level shape", () => {
    expect(keysOf(RESUME.en)).toEqual(keysOf(RESUME.pt));
  });

  it("both locales have the same number of experience entries and matching bullet counts", () => {
    expect(RESUME.en.experience.length).toBe(RESUME.pt.experience.length);
    RESUME.en.experience.forEach((entry, i) => {
      expect(entry.bullets.length).toBe(RESUME.pt.experience[i].bullets.length);
    });
  });

  it("both locales expose the same skill labels in the same order", () => {
    const en = RESUME.en.skills.map((s) => s.label);
    const pt = RESUME.pt.skills.map((s) => s.label);
    expect(en).toEqual(pt); // skill labels are tech names, not translated
  });

  it("React and Next.js are present but never emphasized (working knowledge only)", () => {
    for (const loc of LOCALES) {
      const react = RESUME[loc].skills.find((s) => s.label === "React");
      const next = RESUME[loc].skills.find((s) => s.label === "Next.js");
      expect(react?.emphasis).toBe(false);
      expect(next?.emphasis).toBe(false);
    }
  });

  it("required header/contact fields are non-empty in both locales", () => {
    for (const loc of LOCALES) {
      const c = RESUME[loc];
      expect(c.name).toBe("Jean Medeiros");
      expect(c.headline.length).toBeGreaterThan(0);
      expect(c.summary.length).toBeGreaterThan(0);
      expect(c.contact.email).toContain("@");
      expect(c.contact.githubUrl).toMatch(/^https:\/\//);
      expect(c.contact.linkedinUrl).toMatch(/^https:\/\//);
    }
  });

  it("footer labels live in the content module, localized per locale", () => {
    for (const loc of LOCALES) {
      expect(RESUME[loc].educationLabel.length).toBeGreaterThan(0);
      expect(RESUME[loc].languagesLabel.length).toBeGreaterThan(0);
    }
    // Labels are translated, unlike the tech-name skill labels.
    expect(RESUME.en.educationLabel).not.toBe(RESUME.pt.educationLabel);
    expect(RESUME.en.languagesLabel).not.toBe(RESUME.pt.languagesLabel);
  });

  it("summary avoids the rejected sweeping claim", () => {
    // Guard against regressing to "modernized the entire delivery stack".
    expect(RESUME.en.summary.toLowerCase()).not.toContain("entire");
    expect(RESUME.pt.summary.toLowerCase()).not.toContain("inteira");
  });
});
