import { SKILLS } from "@/constants/skills";

export function SkillsViewer() {
  return (
    <div className="grid content-start gap-6 overflow-auto p-2">
      {SKILLS.map(({ category, skills }) => (
        <div className="flow" key={category}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {category}
          </h2>

          <ul className="flex flex-wrap gap-2">
            {skills.map(({ name }) => (
              <li
                key={name}
                className="rounded-md border border-border bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
