"use client";

import { FaGithub } from "react-icons/fa6";
import { PiArrowSquareOut } from "react-icons/pi";

import { PROJECTS, type Project } from "@/constants/projects";

import { Badge } from "./ui/badge";

function Thumbnail({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="size-full object-cover"
      onError={(e) => {
        const parent = (e.target as HTMLImageElement).parentElement;
        if (parent) {
          (e.target as HTMLImageElement).style.display = "none";
          const fallback = document.createElement("div");
          fallback.className =
            "flex size-full items-center justify-center bg-muted text-2xl font-bold text-muted-foreground select-none absolute inset-0";
          fallback.textContent = alt.charAt(0).toUpperCase();
          parent.appendChild(fallback);
        }
      }}
    />
  );
}

function StackBadges({ stack }: { stack: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {stack.map((tech) => (
        <Badge variant={"outline"} key={tech}>
          {tech}
        </Badge>
      ))}
    </div>
  );
}

function ProjectLinks({ github, live }: { github?: string; live?: string }) {
  return (
    <div className="flex gap-2">
      {github && (
        <a
          href={github}
          target="_blank"
          className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition hover:bg-accent"
        >
          <FaGithub className="size-3.5" />
          GitHub
        </a>
      )}
      {live && (
        <a
          href={live}
          target="_blank"
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <PiArrowSquareOut className="size-3.5" />
          Live
        </a>
      )}
    </div>
  );
}

function FeaturedCard({ project }: { project: Project }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-2 overflow-hidden rounded-lg border bg-card transition hover:shadow">
      {/* Thumbnail */}
      <div className="relative h-full w-64 shrink-0 overflow-hidden bg-muted">
        <Thumbnail src={project.thumbnail} alt={project.title} />
      </div>

      {/* Content */}
      <div className="flow p-4">
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          Featured
        </span>

        <div style={{ "--flow-space": "0.5em" } as React.CSSProperties}>
          <h3 className="text-base font-semibold">{project.title}</h3>
          <p className="text-sm mt-1 text-muted-foreground leading-relaxed">
            {project.description}
          </p>
        </div>

        {project.stack.length > 0 && <StackBadges stack={project.stack} />}
        {project.github || project.live ? (
          <ProjectLinks github={project.github} live={project.live} />
        ) : null}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card transition hover:shadow-sm">
      {/* Thumbnail */}
      <div className="relative h-36 w-full overflow-hidden bg-muted">
        <Thumbnail src={project.thumbnail} alt={project.title} />
      </div>

      {/* Content */}
      <div className="flow p-4">
        <div>
          <h3 className="text-sm font-semibold">{project.title}</h3>
          <p className="text-xs mt-1 text-muted-foreground leading-relaxed line-clamp-2">
            {project.description}
          </p>
        </div>

        {project.stack.length > 0 && <StackBadges stack={project.stack} />}
        {project.github || project.live ? (
          <ProjectLinks github={project.github} live={project.live} />
        ) : null}
      </div>
    </div>
  );
}

export function Portfolio() {
  const featured = PROJECTS.find((p) => p.featured);
  const rest = PROJECTS.filter((p) => !p.featured);

  return (
    <div className="space-y-6 overflow-y-auto h-full p-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Portfolio</h2>
        <p className="text-sm text-muted-foreground mt-1">
          A selection of projects I&apos;ve built over the years.
        </p>
      </div>

      {/* Featured project */}
      {featured && <FeaturedCard project={featured} />}

      {/* Grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-fit-15 gap-4">
          {rest.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
