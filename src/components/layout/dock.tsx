"use client";

import { useOpenWindow } from "@/hooks/useOpenWindow";

import { APPLICATIONS } from "@/constants/applications";

import {
  Children,
  cloneElement,
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  MotionValue,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import {
  PiUserDuotone,
  PiBookOpenDuotone,
  PiGameControllerDuotone,
  PiEnvelopeDuotone,
} from "react-icons/pi";

import {
  DOCK_HEIGHT,
  DOCK_OFFSET_BOTTOM,
  DOCK_BASE_ITEM_SIZE,
  DOCK_MAGNIFICATION,
  DOCK_DISTANCE,
  DOCK_SPRING_MASS,
  DOCK_SPRING_STIFFNESS,
  DOCK_SPRING_DAMPING,
  DOCK_LABEL_ANIMATION_DURATION,
  DOCK_ICON_SIZE,
} from "@/constants/dock";
import { useIsMobile } from "@/hooks/useIsMobile";

import { supportsRelativeColors } from "@/utils/css-supports";

// ─── Entrance animation ─────────────────────────────────────────────────────
// The Dock only mounts once the Desktop renders (after boot), so this mount-time
// entrance plays at the right moment: the panel background fades in first
// (when: "beforeChildren"), then the icons stagger up — mirroring the Files
// window items. The panel animates opacity only: it relies on a Tailwind
// `-translate-x-1/2` for centering, so a motion transform would break it.
const dockPanelVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: "easeOut",
      delay: 0.1,
      when: "beforeChildren",
      delayChildren: 0.05,
      staggerChildren: 0.06,
    },
  },
};

const dockItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpringConfig {
  mass?: number;
  stiffness?: number;
  damping?: number;
}

interface DockItemData {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}

interface DockItemProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  spring: SpringConfig;
  distance: number;
  magnification: number;
  baseItemSize: number;
  label: string;
  /** Entrance variants; inherits show/hidden state from the dock panel. */
  variants?: Variants;
}

interface DockLabelProps {
  children?: ReactNode;
  className?: string;
  isHovered?: MotionValue<number>;
}

interface DockIconProps {
  children?: ReactNode;
  className?: string;
  isHovered?: MotionValue<number>;
}

interface DockBaseProps {
  items: DockItemData[];
  className?: string;
  spring?: SpringConfig;
  magnification?: number;
  distance?: number;
  panelHeight?: number;
  dockHeight?: number;
  baseItemSize?: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DockItem({
  children,
  className = "",
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  label,
  variants,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);
  const isMobile = useIsMobile();

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize],
  );
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      variants={variants}
      style={{
        width: !isMobile ? size : baseItemSize,
        height: !isMobile ? size : baseItemSize,
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`group relative flex-center rounded-lg border border-border bg-card shadow-md outline-none ${className}`}
      tabIndex={0}
      role="button"
      aria-label={label}
      aria-haspopup="true"
    >
      {Children.map(children, (child) =>
        cloneElement(
          child as ReactElement<{ isHovered?: MotionValue<number> }>,
          { isHovered },
        ),
      )}
    </motion.div>
  );
}

function DockLabel({ children, className = "", isHovered }: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on("change", (latest) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: !isMobile ? 1 : 0, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: DOCK_LABEL_ANIMATION_DURATION }}
          className={`absolute -top-8 left-1/2 w-fit -translate-x-1/2 whitespace-pre rounded border border-border bg-card px-2 py-0.5 text-xs text-card-foreground ${className}`}
          role="tooltip"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = "", isHovered }: DockIconProps) {
  const isMobile = useIsMobile();
  const fallback = useMotionValue(0);
  const hovered = isHovered ?? fallback;
  const targetScale = useTransform(hovered, [0, 1], [1, 1.25]);
  const scale = useSpring(targetScale, {
    mass: 0.1,
    stiffness: 300,
    damping: 15,
  });

  return (
    <motion.div
      style={{ scale: !isMobile ? scale : 1 }}
      className={`flex-center ${className}`}
    >
      {children}
    </motion.div>
  );
}

function DockBase({
  items,
  className = "",
  spring = {
    mass: DOCK_SPRING_MASS,
    stiffness: DOCK_SPRING_STIFFNESS,
    damping: DOCK_SPRING_DAMPING,
  },
  magnification = DOCK_MAGNIFICATION,
  distance = DOCK_DISTANCE,
  panelHeight = DOCK_HEIGHT,
  baseItemSize = DOCK_BASE_ITEM_SIZE,
}: DockBaseProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  // a11y: skip the entrance for users who prefer reduced motion — the dock
  // simply appears at its final state.
  const prefersReducedMotion = useReducedMotion();
  const animateEntrance = !prefersReducedMotion;

  return (
    <div
      className="relative mx-2 flex max-w-full items-center overflow-visible"
      style={{ height: panelHeight, marginBottom: DOCK_OFFSET_BOTTOM }}
    >
      <motion.div
        initial={animateEntrance ? "hidden" : false}
        animate={animateEntrance ? "show" : false}
        variants={animateEntrance ? dockPanelVariants : undefined}
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={`absolute bottom-0 left-1/2 flex w-fit -translate-x-1/2 items-end gap-4 rounded-lg ${supportsRelativeColors ? "border border-background/25 bg-card/50" : ""} px-2 pb-2 ${className}`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            label={item.label}
            variants={animateEntrance ? dockItemVariants : undefined}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────

export function Dock() {
  const openWindowCentered = useOpenWindow();

  function openWindow(id: string) {
    const { windowTitle } = APPLICATIONS[id];

    openWindowCentered(id, "", windowTitle ?? "", "");
  }

  const items: DockItemData[] = [
    {
      icon: <PiUserDuotone size={DOCK_ICON_SIZE} />,
      label: "About Me",
      onClick: () => openWindow("about-me"),
    },
    {
      icon: <PiBookOpenDuotone size={DOCK_ICON_SIZE} />,
      label: "Portfolio",
      onClick: () => openWindow("portfolio"),
    },
    {
      icon: <PiGameControllerDuotone size={DOCK_ICON_SIZE} />,
      label: "My Skills",
      onClick: () => openWindow("skills"),
    },
    {
      icon: <PiEnvelopeDuotone size={DOCK_ICON_SIZE} />,
      label: "Contact",
      onClick: () => openWindow("contact"),
    },
  ];

  return <DockBase items={items} panelHeight={DOCK_HEIGHT} />;
}
