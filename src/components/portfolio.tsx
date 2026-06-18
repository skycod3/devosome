"use client";

import { useState } from "react";
import Image from "next/image";
import { FaGithub } from "react-icons/fa6";
import { PiArrowSquareOut } from "react-icons/pi";

import { PROJECTS, type Project } from "@/constants/projects";

import { Badge } from "./ui/badge";

import { supportsRelativeColors } from "@/utils/css-supports";

function Thumbnail({ src, alt }: { src: string; alt: string }) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-2xl font-bold text-muted-foreground select-none">
        {alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 200px"
      className="size-full object-cover"
      onError={() => setImgError(true)}
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
          rel="noopener noreferrer"
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
          rel="noopener noreferrer"
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
    <div className="grid sm:grid-cols-[auto_1fr] gap-2 overflow-hidden rounded-lg border bg-card transition hover:shadow">
      {/* Thumbnail */}
      <div className="relative h-36 w-full sm:h-full sm:w-64 shrink-0 overflow-hidden bg-muted">
        <Thumbnail src={project.thumbnail} alt={project.title} />
      </div>

      {/* Content */}
      <div className="flow p-4">
        <span
          className={`rounded-full ${supportsRelativeColors ? "bg-primary/10 text-primary" : "bg-neutral-100 text-black border"} px-2 py-0.5 text-xs font-medium`}
        >
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
  const visibleProjects = PROJECTS.filter((p) => !p.isPlaceholder);
  const featured = visibleProjects.find((p) => p.featured);
  const rest = visibleProjects.filter((p) => !p.featured);

  return (
    <div className="space-y-6 p-4 md:p-6">
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
