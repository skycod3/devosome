import { ABOUT_ME } from "./about";
import { PROJECTS } from "./projects";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ClipboardItem = {
  id: string;
  category: string;
  label: string;
  value: string;
  display?: string;
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function shorten(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

// ─── Items ────────────────────────────────────────────────────────────────────

export function getClipboardItems(): ClipboardItem[] {
  const { contact } = ABOUT_ME;

  const items: ClipboardItem[] = [
    {
      id: "email",
      category: "Contact",
      label: "Email",
      value: contact.email,
    },
    {
      id: "phone",
      category: "Contact",
      label: "Phone",
      value: contact.phone,
    },
    {
      id: "linkedin",
      category: "Contact",
      label: "LinkedIn",
      value: contact.linkedin,
      display: shorten(contact.linkedin),
    },
    {
      id: "github",
      category: "Contact",
      label: "GitHub",
      value: contact.github,
      display: shorten(contact.github),
    },
  ];

  for (const project of PROJECTS) {
    if (project.live) {
      items.push({
        id: `${project.id}-live`,
        category: "Projects",
        label: `${project.title} · Live`,
        value: project.live,
        display: shorten(project.live),
      });
    }
    if (project.github) {
      items.push({
        id: `${project.id}-github`,
        category: "Projects",
        label: `${project.title} · GitHub`,
        value: project.github,
        display: shorten(project.github),
      });
    }
  }

  return items;
}
