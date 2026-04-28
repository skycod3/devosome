"use client";

import { SKILLS, Proficiency } from "@/constants/skills";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PROFICIENCY_COLORS: Record<Proficiency, string> = {
  Beginner: "bg-violet-100 text-violet-700 border-violet-200",
  Intermediate: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Advanced: "bg-blue-50 text-blue-700 border-blue-200",
  Expert: "bg-red-50 text-red-700 border-red-200",
};

export function Skills() {
  return (
    <div
      className="h-full overflow-auto p-4"
      style={{ scrollbarGutter: "stable" }}
    >
      {SKILLS.map(({ category, skills }) => (
        <div key={category} className="mt-6 first:mt-0">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {category}
          </h2>
          <Accordion
            type="multiple"
            className="grid grid-cols-fill-14 gap-4 items-start"
          >
            {skills.map((skill) => (
              <AccordionItem
                key={skill.name}
                value={skill.name}
                className="rounded-lg border border-border bg-card"
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex flex-wrap items-center gap-3 text-left">
                    <h3 className="font-medium text-base text-foreground">
                      {skill.name}
                    </h3>
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
                  </div>
                </AccordionTrigger>

                <AccordionContent className="space-y-4 bg-accent/20 p-4">
                  {skill.stack && skill.stack.length > 0 && (
                    <div className="flow">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Stack
                      </h4>
                      <ul className="flex flex-wrap gap-1.5">
                        {skill.stack.map((item) => (
                          <li
                            key={item}
                            className="rounded bg-accent border border-border px-2 py-1 text-xs text-foreground"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {skill.projects && skill.projects.length > 0 && (
                    <div className="flow">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Projects
                      </h4>
                      <ul className="flex flex-wrap gap-1.5">
                        {skill.projects.map((project) => (
                          <li
                            key={project}
                            className="rounded bg-accent border border-border px-2 py-1 text-xs text-foreground"
                          >
                            {project}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}
