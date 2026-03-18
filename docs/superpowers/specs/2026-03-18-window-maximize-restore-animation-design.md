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
- Animated properties: x, y, width, height, borderRadius
- Duration: ~150-200ms with ease-out easing
- Border-radius animates from rounded (8px) to 0 on maximize, and back on restore
- Must not break existing open/close, minimize/restore, or drag behaviors

**Note on "center outward" expansion:** The animation interpolates x, y, width, and height simultaneously from the window's current bounds to the maximized bounds (and vice versa). This means the window grows while its top-left corner moves toward (0,0). This is a smooth geometric interpolation, not a transform-origin-based center expansion. The visual effect is similar to Windows OS — the window appears to expand toward the screen edges.

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
mvWidth  → useMotionValue(window.size.width)    — initialized from store
mvHeight → useMotionValue(window.size.height)   — initialized from store
mvRadius → useMotionValue(window.isMaximized ? 0 : 8) — initialized from state
```

The `style` prop of the `motion.div` will use these motion values instead of the current `windowStyles` object for width/height, and instead of the conditional className for border-radius.

### `maxHeight` Handling

The current component applies `maxHeight: calc(${height}px - 10vh)` when not maximized (line 111). This CSS constraint could clamp the visual height during animation:

- **During maximize:** Not a problem — `toggleMaximize` sets `isMaximized: true` before the animation starts, so React re-renders without `maxHeight` before or at the start of the animation.
- **During restore:** Problem — `toggleMaximize` sets `isMaximized: false` immediately, so `maxHeight` kicks in while the height is still animating down from viewport size, potentially clamping the visual.

**Solution:** Move `maxHeight` to a motion value (`mvMaxHeight`) or apply it conditionally based on `isAnimatingRef`. The simplest approach: while `isAnimatingRef.current` is true, don't apply `maxHeight`. This keeps the constraint during normal use but removes it during the animation. After the animation completes and the flag clears, the next render will apply `maxHeight` normally, and the window will already be at its restore size (which fits within the constraint).

### Animation Flag

A `useRef<boolean>` called `isAnimatingRef` prevents the sync `useEffect`s from overwriting animations in progress. The flow:

1. `handleMaximize` sets `isAnimatingRef.current = true`
2. Fires `animate()` calls for all 5 motion values — each returns a Promise
3. Uses `Promise.all()` on all animation promises, then clears `isAnimatingRef.current = false` in the `.then()` callback
4. All sync `useEffect`s (position AND size) check this flag and skip updates while animating

Using `Promise.all` instead of a single `onComplete` is more robust: if any animation is interrupted (e.g., rapid clicks), the promises still resolve, preventing the flag from getting stuck.

### Maximize Flow

When the user clicks the green maximize button:

1. `handleMaximize()` reads `wasMaximized` from the current `window` prop
2. Calls `toggleMaximize(id)` on the store (saves restore data, sets position to 0,0)
3. If maximizing: calls `setWindowSize(id, viewportWidth, viewportHeight)`
4. Sets `isAnimatingRef.current = true`
5. Fires imperative animations and awaits all:
   ```typescript
   const transition = { duration: 0.18, ease: "easeOut" as const };
   Promise.all([
     animate(x, 0, transition),
     animate(y, 0, transition),
     animate(mvWidth, viewportWidth, transition),
     animate(mvHeight, viewportHeight, transition),
     animate(mvRadius, 0, transition),
   ]).then(() => {
     isAnimatingRef.current = false;
   });
   ```

### Restore Flow

When the user clicks the green button while maximized:

1. `handleMaximize()` captures `window.restorePosition` and `window.restoreSize` from the current `window` prop. This works because React props are snapshots — calling `toggleMaximize` triggers a store update, but the component's `window` prop won't reflect the new state until the next render. So the restore values are still available at this point.
2. Calls `toggleMaximize(id)` on the store (which internally calls `restoreWindow`, clearing `restorePosition`/`restoreSize` and calling `bringToFront` — the zIndex change during animation is harmless since it's a separate CSS property)
3. Sets `isAnimatingRef.current = true`
4. Fires imperative animations toward the captured restore values:
   ```typescript
   const transition = { duration: 0.18, ease: "easeOut" as const };
   Promise.all([
     animate(x, restorePos.x, transition),
     animate(y, restorePos.y, transition),
     animate(mvWidth, restoreSize.width, transition),
     animate(mvHeight, restoreSize.height, transition),
     animate(mvRadius, 8, transition),
   ]).then(() => {
     isAnimatingRef.current = false;
   });
   ```

### Interaction with Existing Animations

**Open/close:** Uses `initial`/`animate`/`exit` props for opacity and scale. These properties are separate from the motion values controlling width/height/position/borderRadius. No conflict.

**Minimize/restore:** Uses `getWindowAnimations()` which returns `{ opacity, scale, y }` for the `animate` prop. When minimized, the `animate` prop sets `y: -100`, which takes precedence over the `y` motion value in the `style` prop. When restored, the `animate` returns `{ opacity: 1, scale: 1 }` — note that `y` is absent, not explicitly reset. This is a pre-existing behavior: motion/react retains the last animated value when a property is removed from the `animate` target. In practice this works because the `y` motion value is synced from the store via `useEffect`, and the `style` prop's `y` provides the baseline. However, this interaction between the `animate` prop and the `style` motion value for `y` is fragile and could produce visual jumps in edge cases. This is not introduced by this spec but should be noted as a known limitation.

**Drag:** Drag writes to x/y motion values directly. Drag is disabled when `isMaximized` is true (`drag={!window.isMaximized}`). No conflict with maximize animation because drag cannot occur while maximized.

**Rapid clicks:** If the user clicks maximize twice quickly, the second `animate()` call overrides the first (motion/react default behavior). The first set of promises resolve immediately (interrupted), `Promise.all` resolves, flag clears, then the new animation sets the flag again. This produces a natural reversal animation.

### Sync `useEffect`s

The existing position sync `useEffect` must check the animation flag:

```typescript
useEffect(() => {
  if (isAnimatingRef.current) return;
  x.set(window.position.x);
  y.set(window.position.y);
}, [window.position.x, window.position.y, x, y]);
```

A new sync `useEffect` for width/height/borderRadius handles non-animated state changes (initial render, window open, external size changes):

```typescript
useEffect(() => {
  if (isAnimatingRef.current) return;
  mvWidth.set(window.size.width);
  mvHeight.set(window.size.height);
  mvRadius.set(window.isMaximized ? 0 : 8);
}, [window.size.width, window.size.height, window.isMaximized, mvWidth, mvHeight, mvRadius]);
```

Both `useEffect`s are guarded by `isAnimatingRef` to prevent store updates triggered by `toggleMaximize`/`setWindowSize` from overwriting the in-progress animation.

## Files Modified

| File | Change |
|------|--------|
| `src/components/window/index.tsx` | Add motion values (width, height, borderRadius) with proper initialization, `isAnimatingRef`, refactor `handleMaximize` with imperative `animate()` + `Promise.all`, adjust both sync useEffects with animation guard, handle `maxHeight` during animation, move width/height/borderRadius from style+className to motion values, import `animate` from `motion/react` |

**No new files. No store changes.**

## Testing

Manual testing scenarios:
1. Click maximize button → window expands smoothly to fullscreen
2. Click restore button → window shrinks smoothly to previous position/size
3. Border-radius animates along with size changes
4. Minimize a maximized window, then restore → returns to maximized state correctly
5. Open/close animations still work as before
6. Drag behavior works normally on non-maximized windows
7. Rapid maximize/restore clicks produce smooth reversal without stuck animations
8. Multiple windows: maximizing one doesn't affect others
9. During restore animation, `maxHeight` does not clamp the visual height
10. Window opens at correct size (motion values initialized from store)
