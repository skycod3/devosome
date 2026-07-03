import * as React from "react";

import { cn } from "@/lib/utils";

import ElectricBorder from "@/components/effects/electric-border";

import { useReducedMotion } from "motion/react";

import { useTheme } from "@/hooks/useTheme";

function Input({
  className,
  type,
  onFocus,
  onBlur,
  ...props
}: React.ComponentProps<"input">) {
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
      chaos={0.02}
      active={focused && !reducedMotion}
      borderRadius={8}
      className="w-full"
    >
      <input
        type={type}
        data-slot="input"
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className={cn(
          "h-9 w-full min-w-0 rounded-md border bg-accent border-input px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
          "focus-visible:border-ring motion-reduce:focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-accent dark:aria-invalid:ring-destructive/40",
          className,
        )}
        {...props}
      />
    </ElectricBorder>
  );
}

export { Input };
