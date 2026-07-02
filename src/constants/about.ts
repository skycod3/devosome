export interface Highlight {
  label: string;
  value: string;
}

export interface TimelineEntry {
  period: string;
  role: string;
  description: string;
}

export interface AboutMeContact {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
}

export interface AboutMeData {
  name: string;
  title: string;
  location: string;
  availability: string;
  photo: string;
  description: string;
  highlights: Highlight[];
  timeline: TimelineEntry[];
  /** Caveat shown under the timeline to scope the tech lead role. */
  timelineNote: string;
  contact: AboutMeContact;
  /** URL to a support/donation page (e.g. Buy Me a Coffee) */
  supportUrl?: string;
}

export const ABOUT_ME: AboutMeData = {
  name: "Jean Medeiros",
  title: "Frontend Developer",
  location: "Brazil",
  availability: "Open to Work",
  photo: "", // add your photo path here, e.g. "/images/photo.jpg"
  description: `Frontend developer with 8+ years of experience in web projects, focusing on code quality, performance, and best development practices. I have solid expertise in JavaScript, HTML, and CSS, along with experience in React, Next.js, and TypeScript for building modern, scalable, and performance-oriented interfaces. I also pay attention to user experience (UI/UX) and technical SEO best practices, ensuring efficient applications for both users and search engines. Throughout my career, i have participated in technical decisions, project organization, and development standards definition, collaborating with other developers and contributing to the quality of deliveries. I am interested in environments that value best practices, continuous evolution, and modern technologies in the frontend ecosystem.`,
  highlights: [
    { label: "Years of experience", value: "8+" },
    { label: "Projects delivered", value: "200+" },
    { label: "Technologies", value: "15+" },
  ],
  timeline: [
    {
      period: "2018",
      role: "Frontend Intern / Apprentice",
      description:
        "Joined the company as an intern, taking my first steps into professional frontend development.",
    },
    {
      period: "2018",
      role: "Junior Frontend Developer",
      description:
        "Hired as a junior developer about three months later, moving on to real production work.",
    },
    {
      period: "2024",
      role: "Frontend Tech Lead",
      description:
        "Promoted to tech lead of the frontend team, owning architecture decisions and choices of libraries and tooling across projects.",
    },
    {
      period: "Present",
      role: "Tech Lead — AI Tooling",
      description:
        "Still leading the frontend team, now also driving decisions on which AI harnesses, models, and plugins the company adopts.",
    },
  ],
  timelineNote:
    "Frontend-focused — I'm not involved in backend, database, or infrastructure decisions, though I have basic Node.js knowledge.",
  contact: {
    email: "jeamcrv@hotmail.com",
    phone: "+55 54 99179-1737",
    linkedin: "https://www.linkedin.com/in/skycod3",
    github: "https://github.com/skycod3",
  },
  supportUrl: "https://buymeacoffee.com/jeanmedeiros.dev",
};
