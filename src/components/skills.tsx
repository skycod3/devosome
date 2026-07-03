"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { SKILLS, Proficiency, type Skill } from "@/constants/skills";

import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import {
  AppToolbar,
  ToolbarButton,
  ToolbarSeparator,
} from "@/components/window/app-toolbar";
import { HeroBackdrop } from "@/components/effects/hero-backdrop";

const PROFICIENCY_COLORS: Record<Proficiency, string> = {
  Beginner: "bg-violet-100 text-violet-700 border-violet-200",
  Intermediate: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Advanced: "bg-blue-50 text-blue-700 border-blue-200",
  Expert: "bg-red-50 text-red-700 border-red-200",
};

// Ring fill % and stroke color per proficiency level.
const PROFICIENCY_PERCENT: Record<Proficiency, number> = {
  Beginner: 25,
  Intermediate: 50,
  Advanced: 75,
  Expert: 100,
};

const PROFICIENCY_STROKE: Record<Proficiency, string> = {
  Beginner: "#8b5cf6",
  Intermediate: "#eab308",
  Advanced: "#3b82f6",
  Expert: "#ef4444",
};

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ProficiencyRing({
  proficiency,
  animate,
}: {
  proficiency: Proficiency;
  animate: boolean;
}) {
  const pct = PROFICIENCY_PERCENT[proficiency];
  const offset = CIRCUMFERENCE * (1 - pct / 100);

  return (
    <svg
      viewBox="0 0 64 64"
      className="size-16 shrink-0"
      role="img"
      aria-label={`${proficiency} proficiency`}
    >
      <circle
        cx="32"
        cy="32"
        r={RADIUS}
        fill="none"
        stroke="var(--border)"
        strokeWidth="6"
      />
      <motion.circle
        cx="32"
        cy="32"
        r={RADIUS}
        fill="none"
        stroke={PROFICIENCY_STROKE[proficiency]}
        strokeWidth="6"
        strokeLinecap="round"
        transform="rotate(-90 32 32)"
        strokeDasharray={CIRCUMFERENCE}
        initial={animate ? { strokeDashoffset: CIRCUMFERENCE } : false}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      />
      <text
        x="32"
        y="32"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground text-[13px] font-bold"
      >
        {pct}%
      </text>
    </svg>
  );
}

function Chips({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flow">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h4>
      <ul className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="rounded bg-accent border border-border px-2 py-1 text-xs text-foreground"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SkillCard({
  skill,
  flipped,
  onToggle,
  reducedMotion,
}: {
  skill: Skill;
  flipped: boolean;
  onToggle: () => void;
  reducedMotion: boolean;
}) {
  const hasBack =
    (skill.stack && skill.stack.length > 0) ||
    (skill.projects && skill.projects.length > 0);

  const front = (
    <div className="flex flex-col items-center justify-center h-full gap-2 p-4 text-center">
      <ProficiencyRing
        proficiency={skill.proficiency}
        animate={!reducedMotion}
      />
      <h3 className="font-medium text-base text-foreground">{skill.name}</h3>
      <span
        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${PROFICIENCY_COLORS[skill.proficiency]}`}
      >
        {skill.proficiency}
      </span>
      {skill.experience && (
        <span className="text-xs text-muted-foreground">
          {skill.experience}
        </span>
      )}
      {hasBack && (
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
          Click for details
        </span>
      )}
    </div>
  );

  const back = (
    <div className="grid h-full content-start gap-4 p-4">
      <h3 className="font-medium text-sm text-foreground">{skill.name}</h3>
      {skill.stack && skill.stack.length > 0 && (
        <Chips title="Stack" items={skill.stack} />
      )}
      {skill.projects && skill.projects.length > 0 && (
        <Chips title="Projects" items={skill.projects} />
      )}
    </div>
  );

  // Reduced motion / no back content: simple conditional render, no 3D flip.
  if (reducedMotion || !hasBack) {
    return (
      <button
        type="button"
        onClick={hasBack ? onToggle : undefined}
        aria-pressed={hasBack ? flipped : undefined}
        disabled={!hasBack}
        className="h-56 w-full overflow-auto rounded-lg border border-border bg-card text-left transition-shadow hover:shadow-sm disabled:cursor-default"
      >
        {flipped && hasBack ? back : front}
      </button>
    );
  }

  return (
    <div className="h-56 w-full perspective-[1000px]">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={flipped}
        className="relative h-full w-full rounded-lg transition-transform duration-500 transform-3d"
        style={{ transform: flipped ? "rotateY(180deg)" : undefined }}
      >
        <span className="absolute inset-0 overflow-hidden rounded-lg border border-border bg-card backface-hidden transition-transform hover:-translate-y-1">
          {front}
        </span>
        <span className="absolute inset-0 overflow-auto rounded-lg border border-border bg-card backface-hidden transform-[rotateY(180deg)]">
          {back}
        </span>
      </button>
    </div>
  );
}

export function Skills() {
  const reducedMotion = useReducedMotion() ?? false;
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => SKILLS.map((c) => c.category), []);
  const visible = activeCategory
    ? SKILLS.filter((c) => c.category === activeCategory)
    : SKILLS;

  // Every skill that actually has a back face — used by "Flip all".
  const flippableKeys = useMemo(
    () =>
      SKILLS.flatMap((c) => c.skills)
        .filter((s) => (s.stack?.length ?? 0) + (s.projects?.length ?? 0) > 0)
        .map((s) => s.name),
    [],
  );

  function toggle(name: string) {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const allFlipped = flipped.size >= flippableKeys.length;

  return (
    <div className="relative min-h-full">
      <AppToolbar>
        <ToolbarButton
          active={activeCategory === null}
          onClick={() => setActiveCategory(null)}
        >
          All
        </ToolbarButton>
        {categories.map((cat) => (
          <ToolbarButton
            key={cat}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </ToolbarButton>
        ))}
        <ToolbarSeparator />
        <ToolbarButton
          onClick={() =>
            setFlipped(allFlipped ? new Set() : new Set(flippableKeys))
          }
        >
          {allFlipped ? "Collapse all" : "Flip all"}
        </ToolbarButton>
      </AppToolbar>

      <HeroBackdrop />

      {/* key on the group so switching categories replays the staggered entrance
          instead of leaving newly shown cards stuck hidden. */}
      <RevealGroup key={activeCategory ?? "all"} className="p-4 md:p-6">
        {visible.map(({ category, skills }) => (
          <div key={category} className="mt-6 first:mt-0">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {category}
            </h2>
            <div className="grid grid-cols-fill-14 gap-4 items-start">
              {skills.map((skill) => (
                <RevealItem key={skill.name}>
                  <SkillCard
                    skill={skill}
                    flipped={flipped.has(skill.name)}
                    onToggle={() => toggle(skill.name)}
                    reducedMotion={reducedMotion}
                  />
                </RevealItem>
              ))}
            </div>
          </div>
        ))}
      </RevealGroup>
    </div>
  );
}
