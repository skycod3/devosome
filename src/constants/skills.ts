export interface Skill {
  name: string;
}

export interface SkillCategory {
  category: string;
  skills: Skill[];
}

export const SKILLS: SkillCategory[] = [
  {
    category: "Frontend",
    skills: [
      { name: "JavaScript" },
      { name: "TypeScript" },
      { name: "HTML" },
      { name: "CSS" },
      { name: "React" },
      { name: "Next.js" },
    ],
  },
  {
    category: "UI/UX & SEO",
    skills: [
      { name: "UI/UX" },
      { name: "Technical SEO" },
    ],
  },
  {
    category: "Backend",
    skills: [
      { name: "Node.js" },
      { name: "Fastify" },
      { name: "Prisma" },
      { name: "REST APIs" },
    ],
  },
  {
    category: "Design",
    skills: [
      { name: "Figma" },
      { name: "Photoshop" },
      { name: "Illustrator" },
    ],
  },
  {
    category: "Languages",
    skills: [
      { name: "English (B2 → C1)" },
    ],
  },
];
