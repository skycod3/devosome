"use client";

import { useRef, type Ref } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";

// Entrance motion shared across window content. Durations/easing mirror the
// window scale-in (window/index.tsx) and the boot screen (globals.css).
const DURATION = 0.2;
const Y_OFFSET = 8;

// Single element: fade + slide-up, slightly delayed so it starts after the
// window's own scale-in instead of competing with it.
const revealVariants: Variants = {
  hidden: { opacity: 0, y: Y_OFFSET },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION, ease: "easeOut", delay: 0.08 },
  },
};

// Stagger container: children animate in sequence. The lead-in before the first
// child matches the standalone delay above.
const groupVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } },
};

// Item inside a RevealGroup — no own delay; the parent orchestrates timing.
const itemVariants: Variants = {
  hidden: { opacity: 0, y: Y_OFFSET },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION, ease: "easeOut" },
  },
};

type RevealTag = "div" | "section" | "ul" | "li" | "form";

type RevealProps = HTMLMotionProps<"div"> & {
  /** Which element to render. Defaults to a div. */
  as?: RevealTag;
};

type RevealGroupProps = RevealProps & {
  /**
   * Replay the staggered entrance every time the group (re-)enters the
   * viewport, not just on mount. Use for content that is hidden and re-shown
   * without unmounting — e.g. the file browser's forceMounted tab panels.
   */
  replayOnView?: boolean;
};

// Render the chosen motion element. A switch over static motion.* components
// (instead of a component variable computed in render) keeps the React Compiler
// lint rule happy and avoids remounting on every render.
function renderTag(as: RevealTag, props: HTMLMotionProps<"div">) {
  switch (as) {
    case "section":
      return <motion.section {...(props as HTMLMotionProps<"section">)} />;
    case "ul":
      return <motion.ul {...(props as HTMLMotionProps<"ul">)} />;
    case "li":
      return <motion.li {...(props as HTMLMotionProps<"li">)} />;
    case "form":
      return <motion.form {...(props as HTMLMotionProps<"form">)} />;
    default:
      return <motion.div {...props} />;
  }
}

/**
 * Fades and slides a single block of content in once on mount. Use for
 * non-list window content (About Me, Contact, Terminal, …).
 */
export function Reveal({ as = "div", ...props }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return renderTag(as, props);
  return renderTag(as, {
    variants: revealVariants,
    initial: "hidden",
    animate: "show",
    ...props,
  });
}

/**
 * Orchestrates a staggered entrance for its RevealItem descendants. Wrap a list
 * or grid container with this and mark each item with RevealItem.
 */
export function RevealGroup({
  as = "div",
  replayOnView = false,
  ...props
}: RevealGroupProps) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return renderTag(as, props);
  if (replayOnView) return <RevealGroupInView as={as} {...props} />;
  return renderTag(as, {
    variants: groupVariants,
    initial: "hidden",
    animate: "show",
    ...props,
  });
}

/**
 * RevealGroup variant that drives its animation from viewport visibility, so it
 * replays whenever it re-enters view (e.g. when a hidden tab panel is shown).
 * The ref is attached directly to the element (not threaded through a helper).
 */
function RevealGroupInView({ as = "div", ...props }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref);
  const motionProps: HTMLMotionProps<"div"> = {
    variants: groupVariants,
    initial: "hidden",
    animate: inView ? "show" : "hidden",
    ...props,
  };
  switch (as) {
    case "section":
      return (
        <motion.section
          ref={ref as Ref<HTMLElement>}
          {...(motionProps as HTMLMotionProps<"section">)}
        />
      );
    case "ul":
      return (
        <motion.ul
          ref={ref as Ref<HTMLUListElement>}
          {...(motionProps as HTMLMotionProps<"ul">)}
        />
      );
    case "li":
      return (
        <motion.li
          ref={ref as Ref<HTMLLIElement>}
          {...(motionProps as HTMLMotionProps<"li">)}
        />
      );
    case "form":
      return (
        <motion.form
          ref={ref as Ref<HTMLFormElement>}
          {...(motionProps as HTMLMotionProps<"form">)}
        />
      );
    default:
      return <motion.div ref={ref as Ref<HTMLDivElement>} {...motionProps} />;
  }
}

/**
 * A single staggered item. Inherits its animation state from the nearest
 * RevealGroup via motion's variant propagation, so it needs no initial/animate.
 */
export function RevealItem({ as = "div", ...props }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return renderTag(as, props);
  return renderTag(as, { variants: itemVariants, ...props });
}
