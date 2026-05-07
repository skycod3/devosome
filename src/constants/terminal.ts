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
    "  whoami              Name, title, location and availability",
    "  about               Full bio, highlights and contact info",
    "  skills              Tech skills by category",
    "  ls projects         List all projects",
    "  cat project <id>    Project details",
    "  contact             Contact info",
    "  date                Current date and time",
    "  open <app>          Open a desktop window (about, skills, portfolio, contact, files)",
    "  clear               Clear the terminal",
    "  exit                Close this window",
    "",
    "🚩 Hint: Not --all commands are listed!",
  ].join("\n");
}

export function formatHelpAll(): string {
  return [
    "All commands (including hidden ones):",
    "",
    "  whoami              Name, title, location and availability",
    "  about               Full bio, highlights and contact info",
    "  skills              Tech skills by category",
    "  ls projects         List all projects",
    "  cat project <id>    Project details",
    "  contact             Contact info",
    "  date                Current date and time",
    "  open <app>          Open a desktop window",
    "  clear               Clear the terminal",
    "  exit                Close this window",
    "",
    "  — Hidden commands —",
    "",
    "  pwd                 ...",
    "  sudo                ...",
    "  rm -rf /            ...",
    "  git push --force    ...",
    "  git blame           ...",
    "  npm install         ...",
    "  vim                 ...",
    "  cd ..               ...",
    "  ls -la              ...",
    "  curl localhost:3000 ...",
    "  hack                ...",
    "  coffee              ...",
    "  sleep               ...",
    "  reboot              ...",
    "  ping                ...",
    "  uname               ...",
    "  10x                 ...",
    "  bug                 ...",
    "  todo                ...",
    "  console.log         ...",
    "  fix                 ...",
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
    case "help": {
      const flag = args[0]?.toLowerCase();
      if (flag === "--all") return { type: "output", text: formatHelpAll() };
      return { type: "output", text: formatHelp() };
    }

    case "whoami":
      return {
        type: "output",
        text: `${ABOUT_ME.name} · ${ABOUT_ME.title} · ${ABOUT_ME.location} · ${ABOUT_ME.availability}`,
      };

    case "about":
      return { type: "output", text: formatAbout() };

    case "skills":
      return { type: "output", text: formatSkills() };

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

    case "pwd":
      return { type: "output", text: "/home/visitor/devosome" };

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

    case "git": {
      const sub = args[0]?.toLowerCase();
      if (sub === "push")
        return { type: "output", text: "Whoa. Absolutely not." };
      if (sub === "blame")
        return { type: "output", text: "Honestly? Probably you." };
      return {
        type: "output",
        text: `git: command not available in this environment.`,
      };
    }

    case "npm": {
      const sub = args[0]?.toLowerCase();
      if (sub === "install")
        return {
          type: "output",
          text: "Installing 847 packages... just kidding.",
        };
      return {
        type: "output",
        text: `npm: command not available in this environment.`,
      };
    }

    case "vim":
    case "vi":
      return {
        type: "output",
        text: "You are now trapped. Type ':q!' to escape. (just kidding, this isn't real vim)",
      };

    case "cd":
      return { type: "output", text: "Nice try. You're already at the top." };

    case "ls": {
      const target = args[0]?.toLowerCase();
      if (target === "projects")
        return { type: "output", text: formatProjects() };
      if (target === "-la" || target === "-al" || target === "-a")
        return {
          type: "output",
          text: "drwxr-xr-x  jean  staff  — nothing to hide here.",
        };
      return {
        type: "output",
        text: `ls: unknown target '${args[0] ?? ""}'\nTry: ls projects`,
      };
    }

    case "curl":
      return { type: "output", text: "That's literally this page." };

    case "hack":
      return {
        type: "output",
        text: "Hacking... done. Just kidding, please don't.",
      };

    case "coffee":
      return { type: "output", text: "Brewing... this terminal runs on it." };

    case "sleep":
      return {
        type: "output",
        text: "Developers don't sleep. They just go into low-power mode.",
      };

    case "reboot":
    case "restart":
      return {
        type: "output",
        text: "Have you tried turning the developer off and on again?",
      };

    case "ping":
      return { type: "output", text: "pong" };

    case "uname":
      return {
        type: "output",
        text: "devosome 1.0.0 — a browser pretending to be an OS",
      };

    case "10x":
      return {
        type: "output",
        text: "The 10x developer is a myth. But a well-caffeinated one comes close.",
      };

    case "bug":
      return {
        type: "output",
        text: "It's not a bug, it's an undocumented feature.",
      };

    case "todo":
      return { type: "output", text: "// TODO: finish this later (2016)" };

    case "console.log":
      return {
        type: "output",
        text: "The most powerful debugging tool ever invented.",
      };

    case "fix":
      return {
        type: "output",
        text: "Have you tried turning it off and on again?",
      };

    case "":
      return { type: "output", text: "" };

    default:
      return {
        type: "output",
        text: `command not found: ${cmd}\nType 'help' for available commands.`,
      };
  }
}
