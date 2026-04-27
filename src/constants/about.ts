export interface Highlight {
  label: string;
  value: string;
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
  contact: AboutMeContact;
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
  contact: {
    email: "jeamcrv@hotmail.com",
    phone: "+555499179-1737",
    linkedin: "https://www.linkedin.com/in/skycod3",
    github: "https://github.com/skycod3",
  },
};
