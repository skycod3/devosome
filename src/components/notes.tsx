"use client";

import { NOTES_SECTIONS } from "@/constants/notes";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { getModKeyLabel } from "@/utils/mod-key";

function keyLabel(token: string): string {
  return token === "mod" ? getModKeyLabel() : token;
}

export function Notes({ iconId: _ }: { iconId: string }) {
  return (
    <div
      className="h-full overflow-y-auto bg-[#fdf6c9] p-6 text-neutral-800"
      style={{ fontFamily: "var(--font-caveat)" }}
    >
      <div className="flow mx-auto max-w-md -rotate-1 [text-shadow:0_1px_0_rgba(0,0,0,0.04)]">
        <h1 className="text-3xl text-neutral-800">DevOSome tips ✍️</h1>

        {NOTES_SECTIONS.map((section) => (
          <section className="flow" key={section.category}>
            <h2 className="mb-2 text-xl text-neutral-800 underline decoration-neutral-400 decoration-wavy underline-offset-5">
              {section.category}
            </h2>
            <ul className="space-y-2">
              {section.tips.map((tip, i) => (
                <li
                  key={i}
                  className="flex flex-wrap items-center gap-2 text-lg leading-snug"
                >
                  <span>{tip.text}</span>
                  {tip.keys && (
                    <KbdGroup>
                      {tip.keys.map((k, ki) => (
                        <Kbd
                          className="bg-neutral-800 text-neutral-200"
                          key={ki}
                        >
                          {keyLabel(k)}
                        </Kbd>
                      ))}
                    </KbdGroup>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="text-right text-lg text-neutral-500">
          — left here for you :)
        </p>
      </div>
    </div>
  );
}
