export interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  stack: string[];
  github?: string;
  live?: string;
  featured?: boolean;
}

export const PROJECTS: Project[] = [
  {
    id: "devosome",
    title: "Devosome",
    description:
      "A desktop OS-style developer portfolio built with Next.js, featuring draggable windows, a taskbar, and file system navigation.",
    thumbnail: "/projects/devosome.png",
    stack: ["Next.js", "TypeScript", "Zustand", "Tailwind CSS"],
    github: "https://github.com/skycod3/devosome",
    live: "https://devosome.vercel.app",
    featured: true,
  },
  {
    id: "project-alpha",
    title: "Coming soon",
    description: "Description soon.",
    thumbnail: "/projects/project-alpha.png",
    stack: [],
    live: undefined,
  },
  {
    id: "project-beta",
    title: "Coming soon",
    description: "Description soon.",
    thumbnail: "/projects/project-beta.png",
    stack: [],
    live: undefined,
  },
];
