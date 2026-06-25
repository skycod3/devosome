import type { CSSProperties, ReactNode } from "react";

import styles from "./glitch-text.module.css";

interface GlitchTextProps {
  children: ReactNode;
  /** Animation speed multiplier (higher = slower). */
  speed?: number;
  /** Render the red/cyan offset shadows. */
  enableShadows?: boolean;
  /** Only glitch on hover instead of continuously. */
  enableOnHover?: boolean;
  className?: string;
}

// CSS custom properties consumed by glitch-text.module.css.
type GlitchCSSVars = CSSProperties & {
  "--after-duration": string;
  "--before-duration": string;
  "--after-shadow": string;
  "--before-shadow": string;
};

export function GlitchText({
  children,
  speed = 1,
  enableShadows = true,
  enableOnHover = true,
  className = "",
}: GlitchTextProps) {
  const inlineStyles: GlitchCSSVars = {
    "--after-duration": `${speed * 3}s`,
    "--before-duration": `${speed * 2}s`,
    "--after-shadow": enableShadows ? "-5px 0 red" : "none",
    "--before-shadow": enableShadows ? "5px 0 cyan" : "none",
  };

  const hoverClass = enableOnHover ? styles["enable-on-hover"] : "";

  return (
    <div
      className={`${styles.glitch} ${hoverClass} ${className}`.trim()}
      style={inlineStyles}
      data-text={typeof children === "string" ? children : undefined}
    >
      {children}
    </div>
  );
}
