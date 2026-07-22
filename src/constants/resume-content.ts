export type Locale = "en" | "pt";

export interface ContactInfo {
  location: string;
  email: string;
  /** Display text, e.g. "linkedin.com/in/skycod3" */
  linkedin: string;
  linkedinUrl: string;
  /** Display text, e.g. "github.com/skycod3" */
  github: string;
  githubUrl: string;
}

export interface ExperienceEntry {
  role: string;
  company: string;
  period: string;
  bullets: string[];
}

/** A skill chip. `emphasis` renders it highlighted (real strengths). */
export interface SkillChip {
  label: string;
  emphasis: boolean;
}

export interface ProjectEntry {
  name: string;
  stack: string;
  link: string;
}

export interface ResumeContent {
  name: string;
  headline: string;
  summary: string;
  contact: ContactInfo;
  sectionTitles: {
    experience: string;
    skills: string;
    project: string;
    footer: string;
  };
  experience: ExperienceEntry[];
  skills: SkillChip[];
  project: ProjectEntry;
  educationLabel: string;
  education: string;
  languagesLabel: string;
  languages: string;
}

const CONTACT: ContactInfo = {
  location: "Brazil · Remote",
  email: "jeamcrv@hotmail.com",
  linkedin: "linkedin.com/in/skycod3",
  linkedinUrl: "https://www.linkedin.com/in/skycod3",
  github: "github.com/skycod3",
  githubUrl: "https://github.com/skycod3",
};

// Skill order is identical across locales; labels are tech names (not translated).
const SKILLS: SkillChip[] = [
  { label: "JavaScript", emphasis: true },
  { label: "TypeScript", emphasis: true },
  { label: "CSS / Sass", emphasis: true },
  { label: "HTML", emphasis: true },
  { label: "React", emphasis: false },
  { label: "Next.js", emphasis: false },
  { label: "Accessibility (WCAG AA)", emphasis: true },
  { label: "Core Web Vitals", emphasis: true },
  { label: "Technical SEO", emphasis: true },
  { label: "AI Tooling", emphasis: true },
  { label: "Design Systems", emphasis: false },
  { label: "Figma", emphasis: false },
];

export const RESUME_EN: ResumeContent = {
  name: "Jean Medeiros",
  headline: "Senior Frontend Engineer / Tech Lead",
  summary:
    "Frontend engineer with 8 years of experience, currently leading a 4-person team. I built the agency's shared design system and an AI-driven renewal pipeline that cut the site delivery cycle from ~3 days to ~2 hours — and introduced version control and modern frontend practices along the way.",
  contact: CONTACT,
  sectionTitles: {
    experience: "Experience",
    skills: "Skills",
    project: "Selected Project",
    footer: "Education & Languages",
  },
  experience: [
    {
      role: "Frontend Tech Lead",
      company: "AgênciaNet",
      period: "2024 — Present",
      bullets: [
        "Designed and built the design system behind a library of ~35 site templates, now the baseline for every new project at the company.",
        "Cut the client site renewal cycle from ~3 days to ~2 hours (~7 renewals/month) with an AI-driven pipeline: template selection, content ingestion via internal API, and layout adaptation to each client's business.",
        "Set the template quality bar: WCAG AA, Core Web Vitals, cross-browser compatibility, responsive design, and technical SEO.",
        "Introduced Git to a company with no version control; established English as the standard for code, design, and documentation.",
      ],
    },
    {
      role: "Frontend Developer → Senior",
      company: "AgênciaNet",
      period: "2018 — 2024",
      bullets: [
        "Delivered production sites and grew into technical decisions on tooling and standards; trained junior developers, with a focus on CSS.",
      ],
    },
  ],
  skills: SKILLS,
  project: {
    name: "DevOSome — OS-style developer portfolio",
    stack: "Next.js · TypeScript · Zustand",
    link: "github.com/skycod3",
  },
  educationLabel: "Education",
  education: "Technical Diploma in Informatics",
  languagesLabel: "Languages",
  languages: "Portuguese (Native) · English (C1 Advanced)",
};

export const RESUME_PT: ResumeContent = {
  name: "Jean Medeiros",
  headline: "Engenheiro Frontend Sênior / Tech Lead",
  summary:
    "Engenheiro frontend com 8 anos de experiência, hoje liderando um time de 4 pessoas. Construí o design system compartilhado da agência e um pipeline de renovação de sites com IA que reduziu o ciclo de entrega de ~3 dias para ~2 horas — e introduzi controle de versão e práticas modernas de frontend no caminho.",
  contact: CONTACT,
  sectionTitles: {
    experience: "Experiência",
    skills: "Competências",
    project: "Projeto em destaque",
    footer: "Formação & Idiomas",
  },
  experience: [
    {
      role: "Tech Lead de Frontend",
      company: "AgênciaNet",
      period: "2024 — Presente",
      bullets: [
        "Projetei e construí o design system por trás de uma biblioteca de ~35 templates de site, hoje base de todo novo projeto da empresa.",
        "Reduzi o ciclo de renovação de sites de clientes de ~3 dias para ~2 horas (~7 renovações/mês) com um pipeline dirigido por IA: seleção de template, ingestão de conteúdo via API interna e adaptação de layout ao negócio de cada cliente.",
        "Defini o padrão de qualidade dos templates: WCAG AA, Core Web Vitals, compatibilidade cross-browser, responsividade e SEO técnico.",
        "Introduzi Git em uma empresa sem controle de versão; estabeleci o inglês como padrão para código, design e documentação.",
      ],
    },
    {
      role: "Desenvolvedor Frontend → Sênior",
      company: "AgênciaNet",
      period: "2018 — 2024",
      bullets: [
        "Entreguei sites em produção e evoluí para decisões técnicas de tooling e padrões; treinei desenvolvedores júnior, com foco em CSS.",
      ],
    },
  ],
  skills: SKILLS,
  project: {
    name: "DevOSome — portfólio de desenvolvedor estilo SO",
    stack: "Next.js · TypeScript · Zustand",
    link: "github.com/skycod3",
  },
  educationLabel: "Formação",
  education: "Curso Técnico em Informática",
  languagesLabel: "Idiomas",
  languages: "Português (Nativo) · Inglês (C1 Avançado)",
};

export const RESUME: Record<Locale, ResumeContent> = {
  en: RESUME_EN,
  pt: RESUME_PT,
};
