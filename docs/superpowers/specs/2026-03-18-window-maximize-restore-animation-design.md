# Window Maximize/Restore Animation

**Date:** 2026-03-18  
**Status:** Approved  
**Scope:** Add smooth animation to the Window component's maximize/restore transitions

## Context

The DevOSome project is a developer portfolio styled as a desktop OS. The Window component (`src/components/window/index.tsx`) already has animations for open/close (opacity + scale) and minimize/restore (slide up + fade + scale), implemented with `motion/react` v12. However, the maximize/restore transition is instantaneous — position, size, and border-radius snap to their new values with no interpolation.

The Zustand store (`src/stores/windows.store.ts`) manages all window state including `isMaximized`, `restorePosition`, and `restoreSize`. The store logic for saving/restoring these values is already complete and requires no changes.

## Requirements

- Smooth animation when maximizing (button click only, no drag-to-top)
- Smooth animation when restoring from maximized state
- Expansion from center outward (Windows OS style)
- Animated properties: x, y, width, height, borderRadius
- Duration: ~150-200ms with ease-out easing
- Border-radius animates from rounded (8px) to 0 on maximize, and back on restore
- Must not break existing open/close, minimize/restore, or drag behaviors

## Approach: Imperative `animate()` with `useMotionValue`

### Why This Approach

Three approaches were evaluated:

1. **Declarative `animate` prop** — More idiomatic but creates conflicts between the `animate` prop and the `useMotionValue` system used for drag. The drag system writes directly to x/y motion values, which would fight with the `animate` prop trying to control the same values.

2. **Imperative `animate()` with `useMotionValue` (chosen)** — Preserves the existing drag system without conflicts. The `animate()` function from motion/react can target individual motion values with full control over timing. Minimal changes to the existing architecture.

3. **CSS transitions** — Mixes two animation systems (motion + CSS), creating coordination problems and potential conflicts when both try to animate the same properties.

### Architecture: Motion Values

Current state:
```
x  → useMotionValue (drag + position sync)
y  → useMotionValue (drag + position sync)
```

New state:
```
x        → useMotionValue (drag + position sync + maximize animation)
y        → useMotionValue (drag + position sync + maximize animation)
mvWidth  → useMotionValue (window width, animated on maximize/restore)
mvHeight → useMotionValue (window height, animated on maximize/restore)
mvRadius → useMotionValue (border-radius, animated on maximize/restore)
```

The `style` prop of the `motion.div` will use these motion values instead of the current `windowStyles` object for width/height, and instead of the conditional className for border-radius.

### Animation Flag

A `useRef<boolean>` called `isAnimatingRef` prevents the position sync `useEffect` from overwriting animations in progress. The flow:

1. `handleMaximize` sets `isAnimatingRef.current = true`
2. Fires `animate()` calls for all 5 motion values
3. Uses `onComplete` callback on the last animation to set `isAnimatingRef.current = false`
4. The existing `useEffect` that syncs `x.set()`/`y.set()` from store changes checks this flag and skips updates while animating

### Maximize Flow

When the user clicks the green maximize button:

1. `handleMaximize()` reads current state (`wasMaximized`)
2. Calls `toggleMaximize(id)` on the store (saves restore data, sets position to 0,0)
3. If maximizing: calls `setWindowSize(id, viewportWidth, viewportHeight)`
4. Sets `isAnimatingRef.current = true`
5. Fires imperative animations:
   ```
   animate(x, 0, { duration: 0.18, ease: "easeOut" })
   animate(y, 0, { duration: 0.18, ease: "easeOut" })
   animate(mvWidth, viewportWidth, { duration: 0.18, ease: "easeOut" })
   animate(mvHeight, viewportHeight, { duration: 0.18, ease: "easeOut" })
   animate(mvRadius, 0, { duration: 0.18, ease: "easeOut", onComplete: () => isAnimatingRef.current = false })
   ```

### Restore Flow

When the user clicks the green button while maximized:

1. `handleMaximize()` reads `window.restorePosition` and `window.restoreSize` BEFORE calling `toggleMaximize` (because the store clears them during restore)
2. Calls `toggleMaximize(id)` on the store
3. Sets `isAnimatingRef.current = true`
4. Fires imperative animations toward the saved restore values:
   ```
   animate(x, restorePos.x, { duration: 0.18, ease: "easeOut" })
   animate(y, restorePos.y, { duration: 0.18, ease: "easeOut" })
   animate(mvWidth, restoreSize.width, { duration: 0.18, ease: "easeOut" })
   animate(mvHeight, restoreSize.height, { duration: 0.18, ease: "easeOut" })
   animate(mvRadius, 8, { duration: 0.18, ease: "easeOut", onComplete: () => isAnimatingRef.current = false })
   ```

**Important:** The restore position/size must be captured from the window state BEFORE calling `toggleMaximize`, because the store's `restoreWindow` action clears `restorePosition`/`restoreSize`.

### Interaction with Existing Animations

**Open/close:** Uses `initial`/`animate`/`exit` props for opacity and scale. These properties are separate from the motion values controlling width/height/position/borderRadius. No conflict.

**Minimize/restore:** Uses `getWindowAnimations()` which returns `{ opacity, scale, y }` for the `animate` prop. The `y` in the animate prop during minimize (-100) overrides the motion value temporarily. On restore from minimize, the animate prop returns `{ opacity: 1, scale: 1 }` and the y motion value resumes control. If the window was maximized before minimize, the width/height/radius motion values remain at maximized values (they don't change during minimize).

**Drag:** Drag writes to x/y motion values directly. Drag is disabled when `isMaximized` is true (`drag={!window.isMaximized}`). No conflict with maximize animation because drag cannot occur while maximized.

**Rapid clicks:** If the user clicks maximize twice quickly, the second `animate()` call overrides the first (motion/react default behavior). This produces a natural reversal animation.

### Interaction with the Sync `useEffect`

The existing `useEffect` that runs `x.set(window.position.x)` and `y.set(window.position.y)` on store changes must check the `isAnimatingRef`:

```typescript
useEffect(() => {
  if (isAnimatingRef.current) return;
  x.set(window.position.x);
  y.set(window.position.y);
}, [window.position.x, window.position.y, x, y]);
```

A similar useEffect will be added for width/height/borderRadius sync (for non-animated state changes like initial render or window open).

## Files Modified

| File | Change |
|------|--------|
| `src/components/window/index.tsx` | Add motion values (width, height, borderRadius), `isAnimatingRef`, refactor `handleMaximize` with imperative `animate()`, adjust sync useEffect, move width/height/borderRadius from style+className to motion values, import `animate` from `motion/react` |

**No new files. No store changes.**

## Testing

Manual testing scenarios:
1. Click maximize button → window expands smoothly from center to fullscreen
2. Click restore button → window shrinks smoothly from fullscreen to previous position/size
3. Border-radius animates along with size changes
4. Minimize a maximized window, then restore → returns to maximized state correctly
5. Open/close animations still work as before
6. Drag behavior works normally on non-maximized windows
7. Rapid maximize/restore clicks produce smooth reversal
8. Multiple windows: maximizing one doesn't affect others
