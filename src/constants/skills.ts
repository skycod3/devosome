export type Proficiency = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface Skill {
  name: string;
  proficiency: Proficiency;
  experience?: string;
  stack?: string[];
  projects?: string[];
}

export interface SkillCategory {
  category: string;
  skills: Skill[];
}

export const SKILLS: SkillCategory[] = [
  {
    category: "Frontend",
    skills: [
      {
        name: "JavaScript",
        proficiency: "Expert",
        experience: "8+ years",
        stack: ["ES6+", "DOM", "Web APIs", "Async programming"],
        projects: [
          "Portfolio DevOSome",
          "Game development",
          "Interactive web apps",
        ],
      },
      {
        name: "TypeScript",
        proficiency: "Advanced",
        experience: "5+ years",
        stack: ["Type safety", "Generics", "Utility types", "Type inference"],
        projects: ["Next.js projects", "React applications"],
      },
      {
        name: "HTML",
        proficiency: "Expert",
        experience: "8+ years",
        stack: ["Semantic HTML", "Accessibility", "SEO"],
        projects: ["Landing pages", "Corporate sites", "SPA apps"],
      },
      {
        name: "CSS",
        proficiency: "Expert",
        experience: "8+ years",
        stack: ["Flexbox", "Grid", "Sass", "Tailwind CSS", "Modern CSS"],
        projects: ["Design systems", "Responsive layouts", "UI components"],
      },
      {
        name: "React",
        proficiency: "Advanced",
        experience: "5+ years",
        stack: [
          "Hooks",
          "Context API",
          "React Router",
          "React Query",
          "Zustand",
        ],
        projects: ["Complex SPAs", "Component libraries"],
      },
      {
        name: "Next.js",
        proficiency: "Advanced",
        experience: "4+ years",
        stack: [
          "App Router",
          "Server Components",
          "SSG/SSR",
          "API Routes",
          "Middleware",
        ],
        projects: ["Portfolios", "E-commerce", "SEO-focused sites", "DevOSome"],
      },
    ],
  },
  {
    category: "UI/UX & SEO",
    skills: [
      {
        name: "UI/UX",
        proficiency: "Intermediate",
        experience: "4+ years",
        stack: [
          "Figma",
          "Wireframing",
          "Prototyping",
          "Design systems",
          "User research",
        ],
        projects: [
          "App redesigns",
          "Design system creation",
          "Landing page optimization",
        ],
      },
      {
        name: "Technical SEO",
        proficiency: "Intermediate",
        experience: "4+ years",
        stack: [
          "Meta tags",
          "Sitemap",
          "Structured data",
          "Core Web Vitals",
          "Performance",
        ],
        projects: ["SEO audits", "Migration projects", "Content platforms"],
      },
    ],
  },
  {
    category: "Backend",
    skills: [
      {
        name: "Node.js",
        proficiency: "Intermediate",
        experience: "3+ years",
        stack: ["Express", "Async/await", "Streams", "Worker threads"],
        projects: ["REST APIs", "Microservices", "Serverless functions"],
      },
      {
        name: "Fastify",
        proficiency: "Intermediate",
        experience: "2+ years",
        stack: ["Plugins", "Schema validation", "Fastify-typed-config"],
        projects: ["High-performance APIs", "Internal tools"],
      },
      {
        name: "Prisma",
        proficiency: "Intermediate",
        experience: "3+ years",
        stack: [
          "ORM",
          "Migrations",
          "Relations",
          "Transactions",
          "Raw queries",
        ],
        projects: ["Web applications", "SaaS backends"],
      },
      {
        name: "REST APIs",
        proficiency: "Advanced",
        experience: "5+ years",
        stack: [
          "CRUD",
          "Authentication",
          "Pagination",
          "Filtering",
          "Error handling",
          "Versioning",
        ],
        projects: [
          "Public APIs",
          "Internal services",
          "Third-party integrations",
        ],
      },
    ],
  },
  {
    category: "Design",
    skills: [
      {
        name: "Figma",
        proficiency: "Intermediate",
        experience: "3+ years",
        stack: [
          "Components",
          "Auto-layout",
          "Prototyping",
          "Design systems",
          "Developer handoff",
        ],
        projects: ["UI design", "Design tokens", "Collaborative workflows"],
      },
      {
        name: "Photoshop",
        proficiency: "Intermediate",
        experience: "5+ years",
        stack: ["Photo editing", "Image manipulation", "Banners", "Mockups"],
        projects: ["Marketing materials", "Social media content", "Web assets"],
      },
      {
        name: "Illustrator",
        proficiency: "Beginner",
        experience: "4+ years",
        stack: ["Vector graphics", "Logos", "Icons", "Illustrations"],
        projects: ["Brand identity", "Icon sets", "Print materials"],
      },
    ],
  },
  {
    category: "Languages",
    skills: [
      {
        name: "English",
        proficiency: "Advanced",
        experience: "10+ years (B2 → C1)",
        stack: [
          "Technical vocabulary",
          "Technical documentation",
          "Code reviews",
        ],
        projects: [
          "International projects",
          "Documentation",
          "Communication with global teams",
        ],
      },
    ],
  },
];
