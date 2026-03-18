# Window Maximize/Restore Animation — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add smooth animated transitions (x, y, width, height, borderRadius) when maximizing/restoring a window via the green title bar button.

**Architecture:** Use imperative `animate()` from `motion/react` targeting `useMotionValue` instances. A `useRef<boolean>` flag (`isAnimatingRef`) prevents sync `useEffect`s from overwriting in-progress animations. `Promise.all` coordinates completion of all parallel animations.

**Tech Stack:** React 19, motion/react v12 (`animate`, `useMotionValue`), Zustand v5, Next.js 16, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-18-window-maximize-restore-animation-design.md`

---

## File Structure

Only one file is modified:

| File | Responsibility |
|------|---------------|
| `src/components/window/index.tsx` | Window component — add motion values, animation flag, refactor `handleMaximize`, adjust sync effects, update `style`/`className` |

No new files. No store changes.

---

## Chunk 1: Implementation

### Task 1: Add new imports and motion values

**Files:**
- Modify: `src/components/window/index.tsx:5-7` (imports), `src/components/window/index.tsx:43-45` (motion values)

- [ ] **Step 1: Update imports**

In `src/components/window/index.tsx`, change line 5 to add `useRef`:

```typescript
import { CSSProperties, useEffect, useRef, useState } from "react";
```

Change line 7 to add `animate`:

```typescript
import { animate, motion, useMotionValue, useDragControls } from "motion/react";
```

- [ ] **Step 2: Add new motion values and animation ref**

After line 45 (`const y = useMotionValue(window.position.y);`), add:

```typescript
  const mvWidth = useMotionValue(window.size.width);
  const mvHeight = useMotionValue(window.size.height);
  const mvRadius = useMotionValue(window.isMaximized ? 0 : 8);

  const isAnimatingRef = useRef(false);
```

- [ ] **Step 3: Verify the app still compiles**

Run: `npm run build` (or `npm run dev` and check browser)
Expected: No errors — new values are declared but not yet used.

- [ ] **Step 4: Commit**

```bash
git add src/components/window/index.tsx
git commit -m "feat(window): add motion values for width, height, borderRadius and animation ref"
```

---

### Task 2: Guard existing position sync useEffect

**Files:**
- Modify: `src/components/window/index.tsx:51-55` (position sync useEffect)

- [ ] **Step 1: Add isAnimatingRef guard to position sync**

Replace the existing position sync `useEffect` (lines 51-55):

```typescript
  // Sync MotionValue with store position
  useEffect(() => {
    x.set(window.position.x);
    y.set(window.position.y);
  }, [window.position.x, window.position.y, x, y]);
```

With:

```typescript
  // Sync MotionValue with store position (skipped during maximize/restore animation)
  useEffect(() => {
    if (isAnimatingRef.current) return;
    x.set(window.position.x);
    y.set(window.position.y);
  }, [window.position.x, window.position.y, x, y]);
```

- [ ] **Step 2: Add new sync useEffect for width/height/borderRadius**

Immediately after the position sync `useEffect`, add:

```typescript
  // Sync width/height/borderRadius with store (skipped during maximize/restore animation)
  useEffect(() => {
    if (isAnimatingRef.current) return;
    mvWidth.set(window.size.width);
    mvHeight.set(window.size.height);
    mvRadius.set(window.isMaximized ? 0 : 8);
  }, [window.size.width, window.size.height, window.isMaximized, mvWidth, mvHeight, mvRadius]);
```

- [ ] **Step 3: Verify the app still compiles**

Run: `npm run build` (or `npm run dev` and check browser)
Expected: No errors. Behavior unchanged — `isAnimatingRef.current` is always `false` at this point.

- [ ] **Step 4: Commit**

```bash
git add src/components/window/index.tsx
git commit -m "feat(window): add animation guard to sync useEffects and size/radius sync"
```

---

### Task 3: Refactor handleMaximize with imperative animate()

**Files:**
- Modify: `src/components/window/index.tsx:62-71` (handleMaximize function)

- [ ] **Step 1: Replace handleMaximize**

Replace the current `handleMaximize` function (lines 62-71):

```typescript
  function handleMaximize() {
    const wasMaximized = window.isMaximized;
    toggleMaximize(window.id);

    // After state change, adjust size for fullscreen
    if (!wasMaximized) {
      // Maximizing: set size to fullscreen (position is set to 0,0 by store)
      setWindowSize(window.id, width, height);
    }
  }
```

With:

```typescript
  function handleMaximize() {
    const wasMaximized = window.isMaximized;
    const transition = { duration: 0.18, ease: "easeOut" as const };

    if (!wasMaximized) {
      // Maximizing: capture nothing, animate to fullscreen
      toggleMaximize(window.id);
      setWindowSize(window.id, width, height);

      isAnimatingRef.current = true;
      Promise.all([
        animate(x, 0, transition),
        animate(y, 0, transition),
        animate(mvWidth, width, transition),
        animate(mvHeight, height, transition),
        animate(mvRadius, 0, transition),
      ]).then(() => {
        isAnimatingRef.current = false;
      });
    } else {
      // Restoring: capture restore values BEFORE toggleMaximize clears them
      // (React props are snapshots — window still has the old state here)
      const restorePos = window.restorePosition ?? window.position;
      const restoreSize = window.restoreSize ?? window.size;

      toggleMaximize(window.id);

      isAnimatingRef.current = true;
      Promise.all([
        animate(x, restorePos.x, transition),
        animate(y, restorePos.y, transition),
        animate(mvWidth, restoreSize.width, transition),
        animate(mvHeight, restoreSize.height, transition),
        animate(mvRadius, 8, transition),
      ]).then(() => {
        isAnimatingRef.current = false;
      });
    }
  }
```

- [ ] **Step 2: Verify app compiles**

Run: `npm run build` (or `npm run dev` and check browser)
Expected: No errors. At this point the animations fire but the `style` prop still uses `windowStyles` for width/height, so the visual effect is partial (position animates, size doesn't yet). This is expected — Task 4 completes the visual wiring.

- [ ] **Step 3: Commit**

```bash
git add src/components/window/index.tsx
git commit -m "feat(window): refactor handleMaximize with imperative animate() and Promise.all"
```

---

### Task 4: Wire motion values into style and className

**Files:**
- Modify: `src/components/window/index.tsx:108-113` (windowStyles), `src/components/window/index.tsx:131-132` (style prop), `src/components/window/index.tsx:176-178` (className)

- [ ] **Step 1: Simplify windowStyles**

Replace `windowStyles` (lines 108-113):

```typescript
  const windowStyles: CSSProperties = {
    width: window?.size.width,
    height: window?.size.height,
    maxHeight: window.isMaximized ? undefined : `calc(${height}px - 10vh)`,
    zIndex: window?.zIndex,
  };
```

With:

```typescript
  const windowStyles: CSSProperties = {
    zIndex: window?.zIndex,
    maxHeight:
      isAnimatingRef.current || window.isMaximized
        ? undefined
        : `calc(${height}px - 10vh)`,
  };
```

Width and height are now controlled by motion values. `maxHeight` is suppressed during animation to prevent clamping during restore.

- [ ] **Step 2: Update the style prop on motion.div**

Replace the `style` prop on the `motion.div` (line 132):

```typescript
      style={{ ...windowStyles, x, y }}
```

With:

```typescript
      style={{ ...windowStyles, x, y, width: mvWidth, height: mvHeight, borderRadius: mvRadius }}
```

- [ ] **Step 3: Remove borderRadius from className**

Replace the className on the `motion.div` (lines 176-178):

```typescript
      className={`absolute bg-popover text-popover-foreground grid grid-rows-[auto_1fr] overflow-hidden border shadow-lg ${
        window.isMaximized ? "rounded-none shadow-2xl" : "rounded-lg"
      }`}
```

With:

```typescript
      className={`absolute bg-popover text-popover-foreground grid grid-rows-[auto_1fr] overflow-hidden border shadow-lg ${
        window.isMaximized ? "shadow-2xl" : ""
      }`}
```

The `rounded-none` and `rounded-lg` classes are removed because `borderRadius` is now controlled by the `mvRadius` motion value via the `style` prop. The shadow classes remain as they are not animated.

- [ ] **Step 4: Verify full animation works**

Run: `npm run dev` and open the app in browser.

Test manually:
1. Open a window (double-click desktop icon)
2. Click the green maximize button → window should expand smoothly to fullscreen with border-radius animating to 0
3. Click the green button again (restore) → window should shrink smoothly back to its previous position/size with border-radius animating back to rounded
4. Minimize a window, then restore from taskbar → should still work correctly
5. Open/close a window → fade+scale animations should still work
6. Drag a non-maximized window → should work normally

Expected: All 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/window/index.tsx
git commit -m "feat(window): wire motion values into style/className for animated maximize/restore"
```

---

### Task 5: Edge case testing and polish

**Files:**
- No file changes expected — this task is verification only. If issues are found, fix them before committing.

- [ ] **Step 1: Test rapid maximize/restore clicks**

In the browser, quickly click the green button multiple times in succession.
Expected: Animations reverse smoothly without visual glitches or stuck states. The `isAnimatingRef` should not get stuck at `true`.

- [ ] **Step 2: Test minimize → restore of maximized window**

1. Open a window
2. Maximize it (green button)
3. Minimize it (yellow button)
4. Restore it from the taskbar dropdown

Expected: Window reappears in maximized state (fullscreen) with correct border-radius (0).

- [ ] **Step 3: Test multiple windows**

1. Open two different windows
2. Maximize one
3. Click the other window
4. Maximize the second one

Expected: Each window's animation is independent. Maximizing one does not affect the other.

- [ ] **Step 4: Test maxHeight constraint during restore**

1. Open a window at default size (800x600)
2. Maximize it
3. Restore it

Expected: During the restore animation, the height should not visually "jump" or get clamped. The window should shrink smoothly from fullscreen to its previous 600px height.

- [ ] **Step 5: Final commit (only if fixes were needed)**

If any fixes were made during testing:

```bash
git add src/components/window/index.tsx
git commit -m "fix(window): address edge cases in maximize/restore animation"
```
