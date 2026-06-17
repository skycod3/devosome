import { APPLICATIONS } from "@/constants/applications";
import { DESKTOP_ICONS } from "@/constants/icons";

/** IDs that are child tabs of a tabbed window — do not appear as independent apps */
export const TAB_IDS = new Set(
  Object.values(APPLICATIONS).flatMap((app) => app.availableTabs ?? []),
);

/** All top-level apps (excluding tab views) */
export const ALL_APPS = DESKTOP_ICONS.filter(
  (icon) => icon.appId == null || !TAB_IDS.has(icon.appId),
);
