# Desktop Decomposition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quebrar o god-component `Desktop` em componentes focados, deixando-o uma casca de layout sem estado/subscription que nunca re-renderiza — cortando o cascateamento para Taskbar/Dock/IconGrid/Wallpaper.

**Architecture:** Extração incremental. Cada concern do `Desktop` (Spotlight, effects mount-only, wallpaper, grid de ícones, camada de janelas) vira um componente que assina só o seu. `Desktop` mantém apenas o `ref` do container de layout. Sem novos testes unitários (é composição/subscription); verificação por tsc/lint/suíte + react-scan + manual.

**Tech Stack:** Next.js 16, React 19, Zustand 5, motion/react, Vitest.

---

## ⚠️ Convenções deste plano

- **SEM commits.** Nada é commitado — tudo fica no working tree. Cada tarefa fecha em verificação (`tsc`/`eslint`/`vitest`).
- Branch `master`. PowerShell (Windows). Typecheck: `npx tsc --noEmit`. Lint: `npm run lint` (baseline: 10 problemas pré-existentes em boot-screen/contact/image-viewer/weather/useSounds — não introduzir novos; **atenção a imports órfãos**, que o lint acusa como erro). Testes: `npm test`.
- Cada tarefa mantém o app compilando: remove do `desktop.tsx` exatamente o que moveu, adiciona o novo componente, e remove imports que ficarem sem uso.

## File Structure

**Criar:** `src/components/layout/spotlight-launcher.tsx`, `src/components/layout/desktop-effects.tsx`, `src/components/layout/wallpaper.tsx`, `src/components/layout/icon-grid.tsx`, `src/components/window/window-layer.tsx`.

**Modificar (encolhendo a cada tarefa):** `src/components/layout/desktop.tsx`.

O estado final de `desktop.tsx` está na Task 6 (alvo de convergência).

---

### Task 1: `SpotlightLauncher`

**Files:** Create `src/components/layout/spotlight-launcher.tsx`; Modify `src/components/layout/desktop.tsx`.

- [ ] **Step 1: Criar o componente**

```tsx
// src/components/layout/spotlight-launcher.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Spotlight } from "@/components/spotlight";

export function SpotlightLauncher() {
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      setSpotlightOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return spotlightOpen ? (
    <Spotlight onClose={() => setSpotlightOpen(false)} />
  ) : null;
}
```

- [ ] **Step 2: Atualizar `desktop.tsx`**

Remover: o estado `spotlightOpen` (`const [spotlightOpen, setSpotlightOpen] = useState(false);`), a callback `handleSpotlightKeyDown`, o `useEffect` que registra o keydown do Ctrl+K, e o render `{spotlightOpen && <Spotlight onClose={...} />}`. Adicionar `<SpotlightLauncher />` no lugar do render do Spotlight. Adicionar `import { SpotlightLauncher } from "./spotlight-launcher";`. Remover o import `import { Spotlight } from "@/components/spotlight";`. Se `useCallback` ficar sem uso, removê-lo do import de `react`.

- [ ] **Step 3: Verificar** — `npx tsc --noEmit` limpo; `npm run lint` só com o baseline (sem imports órfãos); `npm test` verde.

---

### Task 2: `DesktopEffects`

**Files:** Create `src/components/layout/desktop-effects.tsx`; Modify `src/components/layout/desktop.tsx`.

- [ ] **Step 1: Criar o componente** (move os effects mount-only)

```tsx
// src/components/layout/desktop-effects.tsx
"use client";

import { useEffect } from "react";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useNotify } from "@/hooks/useNotify";
import { useSounds } from "@/hooks/useSounds";

/** Mount-only desktop side effects (no render output). */
export function DesktopEffects() {
  const isMobile = useIsMobile();
  const { notify } = useNotify();
  const { playClickLeft, playClickRight } = useSounds();

  // Global click sounds
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (e.button === 0) playClickLeft();
    };
    const handleContextMenu = () => playClickRight();
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [playClickLeft, playClickRight]);

  // Welcome message on first visit — run once on mount.
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEYS.WELCOME_SHOWN)) return;
    localStorage.setItem(STORAGE_KEYS.WELCOME_SHOWN, "true");
    notify.info("Welcome to DevOSome! 🖖", {
      description:
        "Explore the projects and portfolio of a passionate developer.",
      duration: 1000 * 8,
      dedupeId: "welcome",
      expiresIn: 1000 * 60 * 60 * 24 * 3,
      delay: 1000 * 2,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Point first-time visitors at the Tips note — run once on mount.
  useEffect(() => {
    if (isMobile) return;
    if (localStorage.getItem(STORAGE_KEYS.TIPS_HINT_SHOWN)) return;
    localStorage.setItem(STORAGE_KEYS.TIPS_HINT_SHOWN, "true");
    notify.info("Tip: open the Tips note on your desktop 📝", {
      description: "It lists handy shortcuts and things you can do here.",
      duration: 1000 * 8,
      dedupeId: "tips-hint",
      expiresIn: 1000 * 60 * 60 * 24 * 3,
      delay: 1000 * 10,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
```

- [ ] **Step 2: Atualizar `desktop.tsx`**

Remover: o `useEffect` dos sons de clique, o `useEffect` de welcome, o `useEffect` de tips, e os hooks `const { notify } = useNotify();` e `const { playClickLeft, playClickRight } = useSounds();`. Adicionar `<DesktopEffects />` (ao lado dos outros filhos, ex.: antes de `</div>` do root). Adicionar `import { DesktopEffects } from "./desktop-effects";`. Remover imports órfãos: `useNotify`, `useSounds`, `STORAGE_KEYS`. Manter `useIsMobile` por ora (ainda usado no overlay do wallpaper, movido na Task 3).

- [ ] **Step 3: Verificar** — `tsc` limpo; lint baseline; `npm test` verde.

---

### Task 3: `Wallpaper`

**Files:** Create `src/components/layout/wallpaper.tsx`; Modify `src/components/layout/desktop.tsx`.

- [ ] **Step 1: Criar o componente** (move fundo + overlay de deselect + shader)

```tsx
// src/components/layout/wallpaper.tsx
"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSettings } from "@/hooks/useSettings";
import { useIconActions } from "@/hooks/useIconActions";

// Lazy-loaded: the wallpaper distortion shader pulls in three.js (~1MB). It
// only renders on desktop with motion enabled, and mounting it via next/dynamic
// keeps three.js out of the initial bundle (loaded after first paint).
const GridDistortion = dynamic(
  () =>
    import("@/components/effects/grid-distortion").then((mod) => ({
      default: mod.GridDistortion,
    })),
  { ssr: false },
);

export function Wallpaper() {
  const { wallpaper } = useSettings();
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const { unhighlightAllIcons } = useIconActions();
  const wallpaperSrc = `/wallpapers/${wallpaper}`;

  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-top"
        style={{ backgroundImage: `url(${wallpaperSrc})` }}
      />
      {!isMobile && (
        <div className="absolute inset-0" onClick={() => unhighlightAllIcons()}>
          {/* Distortion shader animates continuously — skip it under reduced
              motion, keeping the overlay (and its deselect-on-click) intact. */}
          {!prefersReducedMotion && (
            <GridDistortion
              imageSrc={wallpaperSrc}
              grid={100}
              mouse={0.1}
              strength={0.15}
              relaxation={0.9}
            />
          )}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Atualizar `desktop.tsx`**

Remover: `const { wallpaper, iconVisibility } = useSettings();` vira `const { iconVisibility } = useSettings();` (wallpaper sai; iconVisibility fica até a Task 4); a const `wallpaperSrc`; `useReducedMotion`; a função `handleDesktopClick`; o import dinâmico `GridDistortion`; e o bloco JSX do overlay `{!isMobile && (<div className="absolute inset-0" onClick={handleDesktopClick}>…</div>)}`. Do `style` do root, remover `backgroundImage`; das classes do root, remover `bg-cover bg-top`. Adicionar `<Wallpaper />` como **primeiro filho** do root. Adicionar `import { Wallpaper } from "./wallpaper";`. Remover imports órfãos: `useReducedMotion` (de motion/react — manter `AnimatePresence` se ainda usado), `useIsMobile` (não é mais usado no desktop após mover o overlay), `dynamic`.

> Após esta tarefa o `style` do root fica só `{ gridTemplateRows: "[taskbar] auto [desktop] 1fr [dock] auto" }` e a className perde `bg-cover bg-top`.

- [ ] **Step 3: Verificar** — `tsc` limpo; lint baseline (conferir que `useIsMobile`/`useReducedMotion`/`dynamic` não ficaram órfãos); `npm test` verde.

---

### Task 4: `IconGrid`

**Files:** Create `src/components/layout/icon-grid.tsx`; Modify `src/components/layout/desktop.tsx`.

- [ ] **Step 1: Criar o componente** (move grid + seed)

```tsx
// src/components/layout/icon-grid.tsx
"use client";

import { useEffect } from "react";
import { DESKTOP_ICONS } from "@/constants/icons";
import { useIconActions } from "@/hooks/useIconActions";
import { useDesktopIconIds } from "@/hooks/useIconSelectors";
import { useSettings } from "@/hooks/useSettings";
import { Icon } from "../icon";

export function IconGrid() {
  const iconIds = useDesktopIconIds();
  const { setIcons } = useIconActions();
  const { iconVisibility } = useSettings();

  // Seed desktop icons from config + persisted visibility — run once on mount.
  useEffect(() => {
    setIcons(
      DESKTOP_ICONS.map((icon) => ({
        ...icon,
        show: iconVisibility[icon.id] ?? icon.show,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="text-white grid-cols-fill-5 grid-rows-fill-5 sm:grid-cols-fill-6 sm:grid-rows-fill-6 grid h-full grid-flow-col place-items-center gap-4 p-4">
      {iconIds.map((id) => (
        <Icon key={id} id={id} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Atualizar `desktop.tsx`**

Remover: `const iconIds = useDesktopIconIds();`, `const { setIcons, unhighlightAllIcons } = useIconActions();` (ambos os usos já saíram — `unhighlightAllIcons` foi p/ Wallpaper na Task 3, `setIcons` vai p/ IconGrid), `const { iconVisibility } = useSettings();`, o `useEffect` de seed, e o JSX interno do grid. Trocar `<div style={{ gridRow: "desktop" }}>…grid…</div>` por `<div style={{ gridRow: "desktop" }}><IconGrid /></div>`. Adicionar `import { IconGrid } from "./icon-grid";`. Remover imports órfãos: `useDesktopIconIds`, `useIconActions`, `useSettings`, `DESKTOP_ICONS`, `Icon`.

- [ ] **Step 3: Verificar** — `tsc` limpo; lint baseline; `npm test` verde.

---

### Task 5: `WindowLayer`

**Files:** Create `src/components/window/window-layer.tsx`; Modify `src/components/layout/desktop.tsx`.

- [ ] **Step 1: Criar o componente** (move janelas + `desktopRect`/ResizeObserver)

```tsx
// src/components/window/window-layer.tsx
"use client";

import { RefObject, useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useWindowIds } from "@/hooks/useWindowSelectors";
import { Window } from "./index";

/**
 * Renders the open windows. Owns the desktop rect measurement (drag
 * constraints) so a resize re-renders only this layer, not the whole shell.
 */
export function WindowLayer({
  containerRef,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const windowIds = useWindowIds();
  const [desktopRect, setDesktopRect] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setDesktopRect({
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();

    return () => observer.disconnect();
  }, [containerRef]);

  return (
    <AnimatePresence>
      {windowIds.map((id) => (
        <Window key={id} id={id} desktopRect={desktopRect} />
      ))}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Atualizar `desktop.tsx`**

Remover: `const windowIds = useWindowIds();`, o estado `desktopRect` (`useState`), o `useEffect` do `ResizeObserver` (measure), e o bloco `<AnimatePresence>{windowIds.map(...)}</AnimatePresence>`. **Manter** `const desktopRef = useRef<HTMLDivElement>(null);` e o `ref={desktopRef}` no root. Trocar o `<AnimatePresence>…` por `<WindowLayer containerRef={desktopRef} />`. Adicionar `import { WindowLayer } from "../window/window-layer";`. Remover imports órfãos: `useWindowIds`, `AnimatePresence`, `Window`, `useState`, `useEffect` (se não sobrar nenhum uso).

- [ ] **Step 3: Verificar** — `tsc` limpo; lint baseline; `npm test` verde.

---

### Task 6: Convergir `Desktop` para a casca fina

**Files:** Modify `src/components/layout/desktop.tsx`.

- [ ] **Step 1: Garantir o estado final exato**

Após as Tasks 1–5, `desktop.tsx` deve ser **exatamente** isto (ajustar qualquer sobra):

```tsx
"use client";

import { useRef } from "react";

import { Taskbar } from "./taskbar";
import { Dock } from "./dock";
import { Wallpaper } from "./wallpaper";
import { IconGrid } from "./icon-grid";
import { DesktopEffects } from "./desktop-effects";
import { SpotlightLauncher } from "./spotlight-launcher";
import { SnapPreview } from "../window/snap-preview";
import { WindowLayer } from "../window/window-layer";

export function Desktop() {
  const desktopRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={desktopRef}
      // tabIndex makes the desktop a programmatic focus target: when a window
      // closes and its opener is gone, focus returns here instead of <body>.
      tabIndex={-1}
      style={{ gridTemplateRows: "[taskbar] auto [desktop] 1fr [dock] auto" }}
      className="desktop-area relative grid h-dvh select-none overflow-hidden outline-none"
    >
      <Wallpaper />

      <div className="z-1" style={{ gridRow: "taskbar" }}>
        <Taskbar />
      </div>

      <div style={{ gridRow: "desktop" }}>
        <IconGrid />
      </div>

      <div style={{ gridRow: "dock" }}>
        <Dock />
      </div>

      <SnapPreview />

      <WindowLayer containerRef={desktopRef} />

      <SpotlightLauncher />

      <DesktopEffects />
    </div>
  );
}
```

- [ ] **Step 2: Suíte completa** — `npx tsc --noEmit` (0 erros); `npm run lint` (só baseline); `npm test` (verde); `npx prettier --check` nos 5 arquivos novos + `desktop.tsx` (rodar `--write` nos que acusarem).

---

### Task 7: Verificação antes/depois (react-scan + manual)

Dev server no ar (`npm run dev`), com 2+ janelas abertas.

- [ ] **Step 1: Abrir janela** — `window.__scanReset()`, abrir uma app, `window.__scanReport()`. Esperado: `Desktop`, `Dock`, `Wallpaper`, `IconGrid` e janelas existentes **ausentes**; só `WindowLayer` + a janela nova (e `Taskbar` pela contagem `Windows (N)`).
- [ ] **Step 2: Ctrl+K** — reset, disparar `keydown` Ctrl+K, report. Esperado: só `SpotlightLauncher` (+ o Spotlight montando); `Desktop`/`Dock`/`Taskbar`/janelas: 0.
- [ ] **Step 3: Trocar wallpaper** — reset, trocar wallpaper no system-settings, report. Esperado: só `Wallpaper`.
- [ ] **Step 4: Checklist manual** — abrir/fechar/arrastar/snap/maximizar/minimizar janela, **drag constraints corretos** (janela não sai da área), deselect por clique no fundo, Ctrl+K, troca de wallpaper, mostrar/ocultar ícones, som de clique, notificações welcome/tips (limpar `localStorage` para revê-las), foco retornando ao desktop ao fechar janela, mobile (sem shader).
- [ ] **Step 5:** Deixar no working tree. NÃO commitar. Reportar antes/depois ao usuário.

---

## Self-Review (autor do plano)

- **Cobertura do spec:** os 5 componentes (Tasks 1–5), a casca fina (Task 6) e a verificação (Task 7) cobrem cada item do design. `desktopRect` via `containerRef` (Task 5); wallpaper/layering (Task 3); seed em IconGrid (Task 4); effects mount-only em DesktopEffects (Task 2). ✔
- **Sem placeholders:** todo componente traz código completo; o estado final do `desktop.tsx` está explícito (Task 6). ✔
- **Consistência de nomes/props:** `WindowLayer` recebe `containerRef: RefObject<HTMLDivElement | null>` (Task 5) e o `Desktop` passa `desktopRef` desse tipo (Task 6). `Wallpaper`/`IconGrid`/`SpotlightLauncher`/`DesktopEffects` sem props. Imports relativos conferidos (`../icon`, `./index`, `../window/window-layer`). ✔
- **Comportamento preservado:** deselect (overlay no Wallpaper + `stopPropagation` do Icon), Ctrl+K, drag constraints (mesmo cálculo de `desktopRect`), effects mount-only com deps vazias, `.desktop-area`/`tabIndex` no root. ✔
- **App compila a cada passo:** cada tarefa remove só o que moveu e ajusta imports; `useIsMobile` sai na Task 3 (quando o overlay migra), `iconVisibility`/`useSettings` na Task 4. ✔
