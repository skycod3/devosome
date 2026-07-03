import * as React from "react";

import { cn } from "@/lib/utils";

import ElectricBorder from "@/components/effects/electric-border";

import { useTheme } from "@/hooks/useTheme";
import { useReducedMotion } from "motion/react";

function Textarea({
  className,
  onFocus,
  onBlur,
  ...props
}: React.ComponentProps<"textarea">) {
  const [focused, setFocused] = React.useState(false);

  const { isDark } = useTheme();
  const reducedMotion = useReducedMotion() ?? false;

  // react-hook-form flags invalidity via aria-invalid (see contact.tsx).
  const invalid =
    props["aria-invalid"] === true || props["aria-invalid"] === "true";
  const color = invalid
    ? isDark
      ? "#ff6467"
      : "#ef4444"
    : isDark
      ? "#7df9ff"
      : "#5227FF";

  return (
    <ElectricBorder
      color={color}
      speed={0.5}
      chaos={0.03}
      active={focused && !reducedMotion}
      borderRadius={8}
      className="w-full"
    >
      <textarea
        data-slot="textarea"
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className={cn(
          "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-accent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring motion-reduce:focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-accent dark:aria-invalid:ring-destructive/40",
          className,
        )}
        {...props}
      />
    </ElectricBorder>
  );
}

export { Textarea };
