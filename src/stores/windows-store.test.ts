import { beforeEach, describe, expect, it, vi } from "vitest";

// Isolate the store from the real APPLICATIONS map (which pulls in the whole
// component tree). A minimal, representative config is enough to exercise the
// tab/window logic.
vi.mock("@/constants/applications", () => ({
  APPLICATIONS: {
    files: {
      id: "files",
      windowTitle: "Files",
      showTabs: true,
      availableTabs: ["recent", "pictures", "documents"],
    },
    pictures: { id: "pictures", windowTitle: "Pictures", showTabs: false },
    documents: { id: "documents", windowTitle: "Documents", showTabs: false },
    about: { id: "about", windowTitle: "About" },
    contact: { id: "contact", windowTitle: "Contact" },
    skills: { id: "skills", windowTitle: "Skills" },
  },
}));

import { useWindowsStore } from "./windows-store";
import { useRecentStore } from "./recent-store";
import { BASE_Z_INDEX } from "@/constants/windows";

const reset = () => {
  useWindowsStore.setState({
    windows: [],
    activeWindowId: null,
    highestZIndex: BASE_Z_INDEX,
  });
  useRecentStore.setState({ items: [] });
};

const open = (iconId: string, title = iconId) =>
  useWindowsStore.getState().openWindow(iconId, "", title, "");

beforeEach(reset);

describe("openWindow", () => {
  it("creates a new active window", () => {
    const id = open("about", "About");
    const { windows, activeWindowId } = useWindowsStore.getState();

    expect(windows).toHaveLength(1);
    expect(windows[0].iconId).toBe("about");
    expect(windows[0].isActive).toBe(true);
    expect(activeWindowId).toBe(id);
    expect(windows[0].zIndex).toBeGreaterThan(BASE_Z_INDEX);
  });

  it("focuses the existing window instead of duplicating", () => {
    const first = open("about");
    const second = open("about");

    expect(first).toBe(second);
    expect(useWindowsStore.getState().windows).toHaveLength(1);
  });

  it("deactivates other windows when opening a new one", () => {
    open("about");
    open("contact");
    const { windows } = useWindowsStore.getState();

    const about = windows.find((w) => w.iconId === "about")!;
    const contact = windows.find((w) => w.iconId === "contact")!;
    expect(about.isActive).toBe(false);
    expect(contact.isActive).toBe(true);
  });
});

describe("tabbed windows", () => {
  it("opening a tab creates the parent window with that tab active", () => {
    open("pictures", "Pictures");
    const { windows } = useWindowsStore.getState();

    expect(windows).toHaveLength(1);
    expect(windows[0].iconId).toBe("files");
    expect(windows[0].showTabs).toBe(true);
    expect(windows[0].activeTab).toBe("pictures");
  });

  it("opening a second tab reuses the parent and switches the active tab", () => {
    open("pictures");
    open("documents");
    const { windows } = useWindowsStore.getState();

    expect(windows).toHaveLength(1);
    expect(windows[0].activeTab).toBe("documents");
  });

  it("opening Files defaults to the Pictures tab when Recent is empty", () => {
    open("files", "Files");
    const { windows } = useWindowsStore.getState();

    expect(windows[0].iconId).toBe("files");
    expect(windows[0].activeTab).toBe("pictures");
  });

  it("opening Files defaults to the Recent tab when Recent has items", () => {
    useRecentStore.setState({
      items: [
        {
          id: "image-1",
          title: "Photo",
          icon: "",
          sourceTab: "pictures",
          openedAt: 1,
        },
      ],
    });

    open("files", "Files");
    const { windows } = useWindowsStore.getState();

    expect(windows[0].activeTab).toBe("recent");
  });
});

describe("minimize / restore", () => {
  it("minimizes the active window and activates the next one", () => {
    open("about");
    const contactId = open("contact");
    useWindowsStore.getState().minimizeWindow(contactId);

    const { windows, activeWindowId } = useWindowsStore.getState();
    const contact = windows.find((w) => w.id === contactId)!;
    expect(contact.isMinimized).toBe(true);
    expect(contact.isActive).toBe(false);
    expect(activeWindowId).not.toBe(contactId);
  });

  it("restores a minimized window back to normal and active", () => {
    const id = open("about");
    useWindowsStore.getState().minimizeWindow(id);
    useWindowsStore.getState().restoreWindow(id);

    const win = useWindowsStore.getState().windows.find((w) => w.id === id)!;
    expect(win.isMinimized).toBe(false);
    expect(win.isActive).toBe(true);
    expect(useWindowsStore.getState().activeWindowId).toBe(id);
  });
});

describe("maximize / restore", () => {
  it("saves position/size on maximize and restores them", () => {
    const id = open("about");
    const store = useWindowsStore.getState();
    store.setWindowPosition(id, 120, 80);
    store.setWindowSize(id, 640, 480);

    store.maximizeWindow(id);
    let win = useWindowsStore.getState().windows.find((w) => w.id === id)!;
    expect(win.isMaximized).toBe(true);
    expect(win.position).toEqual({ x: 0, y: 0 });
    expect(win.restorePosition).toEqual({ x: 120, y: 80 });
    expect(win.restoreSize).toEqual({ width: 640, height: 480 });

    useWindowsStore.getState().restoreWindow(id);
    win = useWindowsStore.getState().windows.find((w) => w.id === id)!;
    expect(win.isMaximized).toBe(false);
    expect(win.position).toEqual({ x: 120, y: 80 });
    expect(win.size).toEqual({ width: 640, height: 480 });
  });
});

describe("snapWindow", () => {
  const snapRect = { x: 0, y: 48, width: 720, height: 832 };

  it("applies the rect, flags the window as snapped, and saves pre-snap geometry", () => {
    const id = open("about");
    const store = useWindowsStore.getState();
    store.setWindowPosition(id, 120, 90);
    store.setWindowSize(id, 640, 500);

    store.snapWindow(id, snapRect);

    const win = useWindowsStore.getState().windows.find((w) => w.id === id)!;
    expect(win.position).toEqual({ x: 0, y: 48 });
    expect(win.size).toEqual({ width: 720, height: 832 });
    expect(win.isSnapped).toBe(true);
    expect(win.isMaximized).toBe(false);
    // Pre-snap geometry preserved so a drag can restore it.
    expect(win.restorePosition).toEqual({ x: 120, y: 90 });
    expect(win.restoreSize).toEqual({ width: 640, height: 500 });
  });

  it("clears the snapped flag on manual move, resize, or maximize", () => {
    const id = open("about");
    const get = useWindowsStore.getState;

    get().snapWindow(id, snapRect);
    get().setWindowPosition(id, 200, 200);
    expect(get().windows.find((w) => w.id === id)!.isSnapped).toBe(false);

    get().snapWindow(id, snapRect);
    get().setWindowSize(id, 500, 400);
    expect(get().windows.find((w) => w.id === id)!.isSnapped).toBe(false);

    get().snapWindow(id, snapRect);
    get().maximizeWindow(id);
    expect(get().windows.find((w) => w.id === id)!.isSnapped).toBe(false);
  });
});

describe("snap → maximize → restore", () => {
  it("restores the snapped state (full work-area height, not a clamped float)", () => {
    const id = open("about");
    const get = useWindowsStore.getState;
    // pre-snap floating geometry
    get().setWindowPosition(id, 120, 90);
    get().setWindowSize(id, 640, 500);
    // snap to the left (fills the work area)
    get().snapWindow(id, { x: 0, y: 48, width: 720, height: 832 });

    get().maximizeWindow(id);
    get().restoreWindow(id);

    const win = get().windows.find((w) => w.id === id)!;
    expect(win.isMaximized).toBe(false);
    // Must come back as a proper snap — not an unflagged float that the 90dvh
    // max-height clamp would then clip below the work-area height.
    expect(win.isSnapped).toBe(true);
    expect(win.position).toEqual({ x: 0, y: 48 });
    expect(win.size).toEqual({ width: 720, height: 832 });
  });

  it("keeps the pre-snap floating geometry so the restored snap can be dragged free", () => {
    const id = open("about");
    const get = useWindowsStore.getState;
    // pre-snap floating geometry
    get().setWindowPosition(id, 120, 90);
    get().setWindowSize(id, 640, 500);
    get().snapWindow(id, { x: 0, y: 48, width: 720, height: 832 });

    get().maximizeWindow(id);
    get().restoreWindow(id);

    const win = get().windows.find((w) => w.id === id)!;
    expect(win.isSnapped).toBe(true);
    // Comes back at the snapped geometry...
    expect(win.size).toEqual({ width: 720, height: 832 });
    // ...but still remembers the pre-snap floating size, so dragging it un-snaps
    // back to a normal window (and doesn't stay stuck at work-area height).
    expect(win.restoreSize).toEqual({ width: 640, height: 500 });
    expect(win.restorePosition).toEqual({ x: 120, y: 90 });
  });

  it("a plain (non-snapped) window stays unsnapped after maximize/restore", () => {
    const id = open("about");
    const get = useWindowsStore.getState;
    get().setWindowPosition(id, 120, 90);
    get().setWindowSize(id, 640, 500);

    get().maximizeWindow(id);
    get().restoreWindow(id);

    const win = get().windows.find((w) => w.id === id)!;
    expect(win.isSnapped).toBeFalsy();
    expect(win.size).toEqual({ width: 640, height: 500 });
  });
});

describe("closeWindow", () => {
  it("activates the highest non-minimized window after closing the active one", () => {
    const aboutId = open("about");
    const contactId = open("contact"); // active, highest zIndex

    useWindowsStore.getState().closeWindow(contactId);
    const { windows, activeWindowId } = useWindowsStore.getState();

    expect(windows).toHaveLength(1);
    expect(activeWindowId).toBe(aboutId);
    expect(windows[0].isActive).toBe(true);
  });

  it("leaves no active window when the last one is closed", () => {
    const id = open("about");
    useWindowsStore.getState().closeWindow(id);

    const { windows, activeWindowId, highestZIndex } =
      useWindowsStore.getState();
    expect(windows).toHaveLength(0);
    expect(activeWindowId).toBeNull();
    expect(highestZIndex).toBe(BASE_Z_INDEX);
  });
});

describe("bringToFront", () => {
  it("gives the target the highest zIndex and marks it active", () => {
    const aboutId = open("about");
    open("contact");

    useWindowsStore.getState().bringToFront(aboutId);
    const { windows } = useWindowsStore.getState();
    const about = windows.find((w) => w.id === aboutId)!;
    const contact = windows.find((w) => w.iconId === "contact")!;

    expect(about.zIndex).toBeGreaterThan(contact.zIndex);
    expect(about.isActive).toBe(true);
    expect(contact.isActive).toBe(false);
  });
});

describe("bringToFront (surgical)", () => {
  it("only touches the focused window and the previously active one", () => {
    const a = open("about");
    const b = open("contact");
    const c = open("files"); // c is active

    const bBefore = useWindowsStore.getState().windows.find((w) => w.id === b)!;

    useWindowsStore.getState().bringToFront(a);

    const s = useWindowsStore.getState();
    expect(s.windows.find((w) => w.id === b)).toBe(bBefore);
    expect(s.windows.find((w) => w.id === a)!.isActive).toBe(true);
    expect(s.windows.find((w) => w.id === c)!.isActive).toBe(false);
    expect(s.activeWindowId).toBe(a);
  });

  it("gives the focused window the highest zIndex (monotonic)", () => {
    const a = open("about");
    const b = open("contact");

    const zBefore = useWindowsStore.getState().highestZIndex;
    useWindowsStore.getState().bringToFront(a);

    const s = useWindowsStore.getState();
    expect(s.highestZIndex).toBe(zBefore + 1);
    const za = s.windows.find((w) => w.id === a)!.zIndex;
    const zb = s.windows.find((w) => w.id === b)!.zIndex;
    expect(za).toBe(s.highestZIndex);
    expect(za).toBeGreaterThan(zb);
  });

  it("is a no-op for an unknown id", () => {
    open("about");
    const before = useWindowsStore.getState().windows;
    useWindowsStore.getState().bringToFront("nope");
    expect(useWindowsStore.getState().windows).toBe(before);
  });
});

describe("openWindow (surgical)", () => {
  it("preserves the identity of already-inactive windows", () => {
    const a = open("about");
    const b = open("contact"); // b active, a inactive

    const aBefore = useWindowsStore.getState().windows.find((w) => w.id === a)!;

    open("skills"); // a third *regular* (non-tabbed) window — exercises the regular branch

    const s = useWindowsStore.getState();
    expect(s.windows.find((w) => w.id === a)).toBe(aBefore);
    expect(s.windows.find((w) => w.id === b)!.isActive).toBe(false);
  });

  it("gives the new window the highest zIndex (monotonic)", () => {
    open("about");
    const zBefore = useWindowsStore.getState().highestZIndex;

    const c = open("contact");

    const s = useWindowsStore.getState();
    expect(s.highestZIndex).toBe(zBefore + 1);
    expect(s.windows.find((w) => w.id === c)!.zIndex).toBe(s.highestZIndex);
    expect(s.windows.find((w) => w.id === c)!.isActive).toBe(true);
  });
});

describe("setActiveWindow (surgical)", () => {
  it("activates + fronts, touching only the two involved windows", () => {
    const a = open("about");
    const b = open("contact");
    const c = open("files"); // c active

    const bBefore = useWindowsStore.getState().windows.find((w) => w.id === b)!;

    useWindowsStore.getState().setActiveWindow(a);

    const s = useWindowsStore.getState();
    expect(s.windows.find((w) => w.id === b)).toBe(bBefore);
    expect(s.activeWindowId).toBe(a);
    expect(s.windows.find((w) => w.id === a)!.zIndex).toBe(s.highestZIndex);
    expect(s.windows.find((w) => w.id === c)!.isActive).toBe(false);
  });
});

describe("deactivateAllWindows (surgical)", () => {
  it("only touches the active window", () => {
    const a = open("about");
    const b = open("contact"); // b active

    const aBefore = useWindowsStore.getState().windows.find((w) => w.id === a)!;

    useWindowsStore.getState().deactivateAllWindows();

    const s = useWindowsStore.getState();
    expect(s.windows.find((w) => w.id === a)).toBe(aBefore);
    expect(s.windows.find((w) => w.id === b)!.isActive).toBe(false);
    expect(s.activeWindowId).toBeNull();
  });
});

describe("restoreWindow (surgical)", () => {
  it("only touches the restored window and the previously active one", () => {
    const a = open("about");
    const b = open("contact");
    const c = open("files"); // c active

    useWindowsStore.getState().minimizeWindow(a);

    const bBefore = useWindowsStore.getState().windows.find((w) => w.id === b)!;

    useWindowsStore.getState().restoreWindow(a);

    const s = useWindowsStore.getState();
    expect(s.windows.find((w) => w.id === b)).toBe(bBefore);
    const wa = s.windows.find((w) => w.id === a)!;
    expect(wa.isMinimized).toBe(false);
    expect(wa.isActive).toBe(true);
    expect(wa.zIndex).toBe(s.highestZIndex);
    expect(s.windows.find((w) => w.id === c)!.isActive).toBe(false);
    expect(s.activeWindowId).toBe(a);
  });
});

describe("closeWindow (monotonic zIndex)", () => {
  it("does not lower highestZIndex, and resets it only when empty", () => {
    const a = open("about");
    const b = open("contact");

    const zBefore = useWindowsStore.getState().highestZIndex;

    useWindowsStore.getState().closeWindow(b);
    expect(useWindowsStore.getState().highestZIndex).toBe(zBefore);

    useWindowsStore.getState().closeWindow(a);
    expect(useWindowsStore.getState().highestZIndex).toBe(BASE_Z_INDEX);
  });
});
