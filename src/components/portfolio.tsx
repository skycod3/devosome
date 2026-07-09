"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";
import { FaGithub } from "react-icons/fa6";
import { PiArrowSquareOut } from "react-icons/pi";

import { PROJECTS, type Project } from "@/constants/projects";
import { useIsMobile } from "@/hooks/useIsMobile";

import { Badge } from "./ui/badge";
import { RevealGroup, RevealItem } from "./ui/reveal";
import {
  AppToolbar,
  ToolbarButton,
  ToolbarSeparator,
} from "./window/app-toolbar";
import { HeroBackdrop } from "./effects/hero-backdrop";

import { supportsRelativeColors } from "@/utils/css-supports";

type SortMode = "featured" | "az";

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

/**
 * Pointer-driven 3D tilt. The entrance animation lives on the surrounding
 * RevealItem; this inner element only handles the hover tilt so the two
 * transforms don't fight. Disabled for reduced-motion and touch.
 */
function Tilt({
  children,
  className,
  enabled,
}: {
  children: ReactNode;
  className?: string;
  enabled: boolean;
}) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(ry, { stiffness: 200, damping: 20 });

  if (!enabled) return <div className={className}>{children}</div>;

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rx.set(-py * 5);
    ry.set(px * 5);
  }

  function handleLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ProjectCard({ project, tilt }: { project: Project; tilt: boolean }) {
  return (
    <RevealItem className="perspective-[1000px]">
      <Tilt
        enabled={tilt}
        className="h-full overflow-hidden rounded-lg border bg-card transition-shadow shadow-foreground/10 hover:shadow-lg"
      >
        {/* Thumbnail */}
        <div className="relative h-36 w-full overflow-hidden bg-muted">
          <Thumbnail src={project.thumbnail} alt={project.title} />
          {project.featured && (
            <span
              className={`absolute left-2 top-2 rounded-full ${supportsRelativeColors ? "bg-primary/80 text-primary-foreground" : "bg-neutral-900 text-white"} px-2 py-0.5 text-[10px] font-medium backdrop-blur`}
            >
              Featured
            </span>
          )}
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
      </Tilt>
    </RevealItem>
  );
}

export function Portfolio() {
  const reducedMotion = useReducedMotion() ?? false;
  const isMobile = useIsMobile();
  const tilt = !reducedMotion && !isMobile;

  const [activeTech, setActiveTech] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("featured");

  const allProjects = useMemo(
    () => PROJECTS.filter((p) => !p.isPlaceholder),
    [],
  );

  const techs = useMemo(() => {
    const set = new Set<string>();
    allProjects.forEach((p) => p.stack.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [allProjects]);

  const filtered = useMemo(() => {
    const byTech = activeTech
      ? allProjects.filter((p) => p.stack.includes(activeTech))
      : allProjects;
    if (sort === "az") {
      return [...byTech].sort((a, b) => a.title.localeCompare(b.title));
    }
    // "featured" — featured projects first, original order otherwise.
    return [...byTech].sort(
      (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
    );
  }, [allProjects, activeTech, sort]);

  return (
    <div className="relative min-h-full">
      <AppToolbar>
        <ToolbarButton
          active={activeTech === null}
          onClick={() => setActiveTech(null)}
        >
          All
        </ToolbarButton>
        {techs.map((tech) => (
          <ToolbarButton
            key={tech}
            active={activeTech === tech}
            onClick={() => setActiveTech(tech)}
          >
            {tech}
          </ToolbarButton>
        ))}
        <ToolbarSeparator />
        <ToolbarButton
          active={sort === "featured"}
          onClick={() => setSort("featured")}
        >
          Featured
        </ToolbarButton>
        <ToolbarButton active={sort === "az"} onClick={() => setSort("az")}>
          A–Z
        </ToolbarButton>
      </AppToolbar>

      <HeroBackdrop />

      {/* key on the group so a filter/sort change replays the staggered entrance
          instead of leaving newly shown cards stuck hidden. */}
      <RevealGroup
        key={`${activeTech ?? "all"}-${sort}`}
        className="space-y-6 p-4 md:p-6"
      >
        {/* Header */}
        <RevealItem>
          <h2 className="text-lg font-semibold">Portfolio</h2>
          <p className="text-sm text-muted-foreground mt-1">
            A selection of projects I&apos;ve built over the years.
          </p>
        </RevealItem>

        {/* Uniform grid — cards inherit the stagger from the surrounding RevealGroup */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-fill-15 gap-4">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} tilt={tilt} />
            ))}
          </div>
        ) : (
          <RevealItem className="py-12 text-center text-sm text-muted-foreground">
            No projects match this filter.
          </RevealItem>
        )}
      </RevealGroup>
    </div>
  );
}
