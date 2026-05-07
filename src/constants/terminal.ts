import { ABOUT_ME } from "./about";
import { SKILLS } from "./skills";
import { PROJECTS } from "./projects";

// ─── Open aliases ─────────────────────────────────────────────────────────────

export const OPEN_ALIASES: Record<string, string> = {
  about: "about-me",
  skills: "skills",
  portfolio: "portfolio",
  contact: "contact",
  files: "files",
};

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatHelp(): string {
  return [
    "Available commands:",
    "",
    "  whoami         Name, title, location and availability",
    "  about          Full bio, highlights and contact info",
    "  skills         Tech skills by category",
    "  ls projects    List all projects",
    "  cat project    <id>  Project details",
    "  contact        Contact info",
    "  date           Current date and time",
    "  open <app>     Open a desktop window (about, skills, portfolio, contact, files)",
    "  clear          Clear the terminal",
    "  exit           Close this window",
  ].join("\n");
}

export function formatAbout(): string {
  const {
    name,
    title,
    location,
    availability,
    description,
    highlights,
    contact,
  } = ABOUT_ME;
  return [
    `${name} — ${title}`,
    `Location: ${location}  ·  Availability: ${availability}`,
    "",
    description,
    "",
    "Highlights:",
    ...highlights.map((h) => `  ${h.label.padEnd(24)} ${h.value}`),
    "",
    "Contact:",
    `  email      ${contact.email}`,
    `  github     ${contact.github}`,
    `  linkedin   ${contact.linkedin}`,
  ].join("\n");
}

export function formatSkills(): string {
  const lines: string[] = [];
  for (const category of SKILLS) {
    lines.push(category.category);
    for (const skill of category.skills) {
      const name = skill.name.padEnd(18);
      const prof = skill.proficiency.padEnd(14);
      const exp = skill.experience ?? "";
      lines.push(`  ${name} ${prof} ${exp}`);
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

export function formatProjects(): string {
  const lines: string[] = ["Projects:", ""];
  for (const project of PROJECTS) {
    lines.push(`  [${project.id}]`);
    lines.push(`  ${project.title}`);
    if (project.description) lines.push(`  ${project.description}`);
    if (project.stack.length > 0)
      lines.push(`  Stack: ${project.stack.join(", ")}`);
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

export function formatProject(id: string): string {
  const project = PROJECTS.find((p) => p.id === id);
  if (!project)
    return `cat: project '${id}' not found\nTry 'ls projects' to see available projects.`;
  const lines = [`Title:   ${project.title}`, ``, project.description];
  if (project.stack.length > 0) {
    lines.push("", `Stack:   ${project.stack.join(" · ")}`);
  }
  if (project.github) lines.push(`GitHub:  ${project.github}`);
  if (project.live) lines.push(`Live:    ${project.live}`);
  return lines.join("\n");
}

export function formatContact(): string {
  const { contact } = ABOUT_ME;
  return [
    "Contact:",
    "",
    `  email      ${contact.email}`,
    `  phone      ${contact.phone}`,
    `  github     ${contact.github}`,
    `  linkedin   ${contact.linkedin}`,
  ].join("\n");
}

export function formatDate(): string {
  return new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ─── Command type ─────────────────────────────────────────────────────────────

export type CommandResult =
  | { type: "output"; text: string }
  | { type: "clear" }
  | { type: "exit" }
  | { type: "open"; appId: string };

// ─── Command executor ─────────────────────────────────────────────────────────

export function executeCommand(raw: string): CommandResult {
  const trimmed = raw.trim();
  const parts = trimmed.split(/\s+/);
  const cmd = parts[0]?.toLowerCase() ?? "";
  const args = parts.slice(1);

  switch (cmd) {
    case "help":
      return { type: "output", text: formatHelp() };

    case "whoami":
      return { type: "output", text: `${ABOUT_ME.name} · ${ABOUT_ME.title} · ${ABOUT_ME.location} · ${ABOUT_ME.availability}` };

    case "about":
      return { type: "output", text: formatAbout() };

    case "skills":
      return { type: "output", text: formatSkills() };

    case "ls": {
      const target = args[0]?.toLowerCase();
      if (target === "projects")
        return { type: "output", text: formatProjects() };
      return {
        type: "output",
        text: `ls: unknown target '${args[0] ?? ""}'\nTry: ls projects`,
      };
    }

    case "cat": {
      const sub = args[0]?.toLowerCase();
      if (sub === "project") {
        const id = args[1];
        if (!id) return { type: "output", text: "Usage: cat project <id>" };
        return { type: "output", text: formatProject(id) };
      }
      return {
        type: "output",
        text: `cat: unknown target '${args[0] ?? ""}'\nTry: cat project <id>`,
      };
    }

    case "contact":
      return { type: "output", text: formatContact() };

    case "date":
      return { type: "output", text: formatDate() };

    case "clear":
      return { type: "clear" };

    case "exit":
      return { type: "exit" };

    case "open": {
      const alias = args[0]?.toLowerCase();
      if (!alias)
        return {
          type: "output",
          text: "Usage: open <app>\nApps: about, skills, portfolio, contact, files",
        };
      const appId = OPEN_ALIASES[alias];
      if (!appId)
        return {
          type: "output",
          text: `open: unknown app '${alias}'\nApps: ${Object.keys(OPEN_ALIASES).join(", ")}`,
        };
      return { type: "open", appId };
    }

    case "sudo":
      return { type: "output", text: "Nice try." };

    case "rm": {
      const joined = args.join(" ");
      if (joined.includes("-rf") || joined.includes("rf")) {
        return { type: "output", text: "I'm afraid I can't do that." };
      }
      return {
        type: "output",
        text: `rm: command not available in this environment.`,
      };
    }

    case "":
      return { type: "output", text: "" };

    default:
      return {
        type: "output",
        text: `command not found: ${cmd}\nType 'help' for available commands.`,
      };
  }
}
