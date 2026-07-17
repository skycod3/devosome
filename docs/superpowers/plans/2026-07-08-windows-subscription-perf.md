# Windows-store Subscription Perf — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar o fan-out de re-render do `windows-store` fatiando o acesso (`useWindowActions` / `useWindow(id)` / `useWindowIds` / `useOpenWindow`) e memoizando o `Icon`, sem mudar a lógica do store nem o comportamento observável.

**Architecture:** `useWindows()` (assina o array `windows` inteiro) é substituído por hooks focados. Componentes que só despacham ação deixam de assinar `windows`; cada `Window` assina só a própria fatia via `useWindow(id)`; o `Desktop` assina só a lista de ids via `useWindowIds()` (shallow). Lógica das actions do store fica intacta.

**Tech Stack:** Next.js 16, React 19, Zustand 5 (`zustand/react/shallow`), Vitest 4 + @testing-library/react (jsdom), motion/react.

---

## ⚠️ Convenções deste plano

- **SEM commits.** Instrução explícita do usuário: nada é commitado após a implementação — tudo fica no working tree para revisão manual. Cada tarefa termina em **verificação** (`tsc`/`eslint`/`vitest`), não em commit.
- Trabalho direto na branch `master` (sem worktree), seguindo o fluxo do repositório.
- Comandos rodam em PowerShell (Windows). Typecheck: `npx tsc --noEmit`. Lint: `npm run lint`. Testes: `npm test`.
- O `react-scan` já está commitado como profiler de dev (helpers `window.__scanReset()` / `window.__scanReport()`), usado na verificação final.

## File Structure

**Criar:**

- `src/hooks/useWindowActions.ts` — só actions do store (refs estáveis; não assina `windows`).
- `src/hooks/useWindowSelectors.ts` — `useWindow(id)` e `useWindowIds()`.
- `src/hooks/useOpenWindow.ts` — `openWindowCentered` (movido do `useWindows.ts`; lê `windows.length` via `getState()`).
- `src/hooks/useWindowActions.test.ts`, `src/hooks/useWindowSelectors.test.ts`, `src/hooks/useOpenWindow.test.ts`.

**Modificar:** `src/components/layout/desktop.tsx`, `src/components/window/index.tsx`, `src/components/icon.tsx`, e os consumidores listados nas Tasks 7–10.

**Remover:** `src/hooks/useWindows.ts` (após migrar todos os consumidores).

---

### Task 1: Hook `useWindowActions()`

**Files:**

- Create: `src/hooks/useWindowActions.ts`
- Test: `src/hooks/useWindowActions.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
// src/hooks/useWindowActions.test.ts
import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useWindowsStore } from "@/stores/windows-store";
import type { Window } from "@/stores/windows-store";
import { useWindowActions } from "./useWindowActions";
import { BASE_Z_INDEX } from "@/constants/windows";

function makeWindow(id: string): Window {
  return {
    id,
    iconId: id,
    parentId: "",
    title: id,
    icon: "",
    isActive: true,
    isMinimized: false,
    isMaximized: false,
    lastState: "normal",
    position: { x: 10, y: 10 },
    size: { width: 400, height: 300 },
    zIndex: BASE_Z_INDEX + 1,
  };
}

beforeEach(() => {
  useWindowsStore.setState({
    windows: [makeWindow("window-a")],
    activeWindowId: "window-a",
    highestZIndex: BASE_Z_INDEX + 1,
    snapPreview: null,
  });
});

describe("useWindowActions", () => {
  it("expõe actions com referência estável e NÃO re-renderiza quando um campo de janela muda", () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return useWindowActions();
    });

    const firstSetPosition = result.current.setWindowPosition;
    expect(renders).toBe(1);

    act(() => {
      useWindowsStore.getState().setWindowPosition("window-a", 99, 99);
    });

    // mudou a posição de uma janela, mas o hook de actions não assina `windows`
    expect(renders).toBe(1);
    expect(result.current.setWindowPosition).toBe(firstSetPosition);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run src/hooks/useWindowActions.test.ts`
Expected: FAIL — `Cannot find module './useWindowActions'`.

- [ ] **Step 3: Implementar o hook**

```ts
// src/hooks/useWindowActions.ts
"use client";

import { useWindowsStore } from "@/stores/windows-store";

/**
 * Só as actions do windows-store. Actions no zustand têm referência estável,
 * então selecioná-las individualmente NÃO cria subscription ao array `windows`:
 * um componente que só despacha nunca re-renderiza por mudança de janela.
 */
export const useWindowActions = () => ({
  openWindow: useWindowsStore((s) => s.openWindow),
  closeWindow: useWindowsStore((s) => s.closeWindow),
  closeAllWindows: useWindowsStore((s) => s.closeAllWindows),
  setActiveWindow: useWindowsStore((s) => s.setActiveWindow),
  deactivateAllWindows: useWindowsStore((s) => s.deactivateAllWindows),
  minimizeWindow: useWindowsStore((s) => s.minimizeWindow),
  maximizeWindow: useWindowsStore((s) => s.maximizeWindow),
  restoreWindow: useWindowsStore((s) => s.restoreWindow),
  toggleMinimize: useWindowsStore((s) => s.toggleMinimize),
  toggleMaximize: useWindowsStore((s) => s.toggleMaximize),
  setWindowPosition: useWindowsStore((s) => s.setWindowPosition),
  setWindowSize: useWindowsStore((s) => s.setWindowSize),
  snapWindow: useWindowsStore((s) => s.snapWindow),
  setSnapPreview: useWindowsStore((s) => s.setSnapPreview),
  bringToFront: useWindowsStore((s) => s.bringToFront),
  setWindowActiveTab: useWindowsStore((s) => s.setWindowActiveTab),
  updateWindowTitle: useWindowsStore((s) => s.updateWindowTitle),
});
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/hooks/useWindowActions.test.ts`
Expected: PASS.

---

### Task 2: Hooks `useWindow(id)` e `useWindowIds()`

**Files:**

- Create: `src/hooks/useWindowSelectors.ts`
- Test: `src/hooks/useWindowSelectors.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
// src/hooks/useWindowSelectors.test.ts
import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useWindowsStore } from "@/stores/windows-store";
import type { Window } from "@/stores/windows-store";
import { useWindow, useWindowIds } from "./useWindowSelectors";
import { BASE_Z_INDEX } from "@/constants/windows";

function makeWindow(id: string): Window {
  return {
    id,
    iconId: id,
    parentId: "",
    title: id,
    icon: "",
    isActive: false,
    isMinimized: false,
    isMaximized: false,
    lastState: "normal",
    position: { x: 10, y: 10 },
    size: { width: 400, height: 300 },
    zIndex: BASE_Z_INDEX + 1,
  };
}

beforeEach(() => {
  useWindowsStore.setState({
    windows: [makeWindow("window-a"), makeWindow("window-b")],
    activeWindowId: null,
    highestZIndex: BASE_Z_INDEX + 2,
    snapPreview: null,
  });
});

describe("useWindow", () => {
  it("retorna a fatia da janela e atualiza quando ELA muda", () => {
    const { result } = renderHook(() => useWindow("window-a"));
    expect(result.current?.position).toEqual({ x: 10, y: 10 });

    act(() => {
      useWindowsStore.getState().setWindowPosition("window-a", 50, 60);
    });
    expect(result.current?.position).toEqual({ x: 50, y: 60 });
  });

  it("NÃO re-renderiza quando OUTRA janela muda", () => {
    let renders = 0;
    renderHook(() => {
      renders++;
      return useWindow("window-a");
    });
    expect(renders).toBe(1);

    act(() => {
      useWindowsStore.getState().setWindowPosition("window-b", 1, 1);
    });
    expect(renders).toBe(1);
  });
});

describe("useWindowIds", () => {
  it("NÃO re-renderiza quando só uma posição muda (lista de ids é shallow-igual)", () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return useWindowIds();
    });
    expect(result.current).toEqual(["window-a", "window-b"]);
    expect(renders).toBe(1);

    act(() => {
      useWindowsStore.getState().setWindowPosition("window-a", 7, 7);
    });
    expect(renders).toBe(1);

    act(() => {
      useWindowsStore.getState().closeWindow("window-a");
    });
    expect(result.current).toEqual(["window-b"]);
    expect(renders).toBe(2);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run src/hooks/useWindowSelectors.test.ts`
Expected: FAIL — `Cannot find module './useWindowSelectors'`.

- [ ] **Step 3: Implementar os hooks**

```ts
// src/hooks/useWindowSelectors.ts
"use client";

import { useShallow } from "zustand/react/shallow";
import { useWindowsStore } from "@/stores/windows-store";

/** Assina a fatia de UMA janela; re-renderiza só quando o objeto dela muda. */
export const useWindow = (id: string) =>
  useWindowsStore((s) => s.windows.find((w) => w.id === id));

/**
 * Assina só a lista de ids (shallow). Retorna igual-raso enquanto nenhuma janela
 * é aberta/fechada/reordenada — o consumidor não re-renderiza em mudança de
 * posição/foco/aba.
 */
export const useWindowIds = () =>
  useWindowsStore(useShallow((s) => s.windows.map((w) => w.id)));
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/hooks/useWindowSelectors.test.ts`
Expected: PASS.

---

### Task 3: Hook `useOpenWindow()`

Move `openWindowCentered` de `useWindows.ts` para um hook próprio que lê `windows.length` via `getState()` (sem assinar `windows`). Usa `useViewport` (re-render só em resize) e `useRecent`.

**Files:**

- Create: `src/hooks/useOpenWindow.ts`
- Test: `src/hooks/useOpenWindow.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
// src/hooks/useOpenWindow.test.ts
import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useWindowsStore } from "@/stores/windows-store";
import { useOpenWindow } from "./useOpenWindow";
import { BASE_Z_INDEX } from "@/constants/windows";

beforeEach(() => {
  useWindowsStore.setState({
    windows: [],
    activeWindowId: null,
    highestZIndex: BASE_Z_INDEX,
    snapPreview: null,
  });
});

describe("useOpenWindow", () => {
  it("abre uma janela nova e a registra no store", () => {
    const { result } = renderHook(() => useOpenWindow());

    act(() => {
      result.current("terminal", "", "Terminal", "");
    });

    const { windows } = useWindowsStore.getState();
    expect(windows).toHaveLength(1);
    expect(windows[0].iconId).toBe("terminal");
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run src/hooks/useOpenWindow.test.ts`
Expected: FAIL — `Cannot find module './useOpenWindow'`.

- [ ] **Step 3: Implementar o hook** (corpo transcrito de `useWindows.ts`, trocando o array assinado por `getState()`)

```ts
// src/hooks/useOpenWindow.ts
"use client";

import { StaticImageData } from "next/image";
import { useWindowsStore } from "@/stores/windows-store";
import { useViewport } from "./useViewport";
import { useRecent } from "./useRecent";
import {
  SMALL_DESKTOP_WINDOW_SIZE,
  TABLET_WINDOW_SIZE,
  LARGE_DESKTOP_WINDOW_SIZE,
  IMAGE_WINDOW_SIZE,
  CASCADE_STEP,
  MAX_CASCADE_SLOTS,
  WORKAREA_TOP_INSET,
  WORKAREA_BOTTOM_INSET,
} from "@/constants/windows";
import { APPLICATIONS } from "@/constants/applications";
import { BREAKPOINTS } from "@/constants/breakpoints";
import { computeCascadePosition } from "@/lib/cascade";

// Derivado de APPLICATIONS; cacheado na 1ª chamada (evita tocar APPLICATIONS
// durante a cadeia de import circular e não recomputa por render).
let mediaTabsCache: Set<string> | null = null;
function getMediaTabs(): Set<string> {
  if (!mediaTabsCache) {
    mediaTabsCache = new Set(
      Object.values(APPLICATIONS).flatMap((app) => app.availableTabs ?? []),
    );
  }
  return mediaTabsCache;
}

/**
 * Retorna `openWindowCentered`. Lê `windows.length` via `getState()` no momento
 * da chamada, então componentes que só abrem janelas não assinam `windows`
 * (re-renderizam apenas em resize de viewport).
 */
export const useOpenWindow = () => {
  const addRecentItem = useRecent().addRecentItem;
  const { width, height } = useViewport();

  const isMobile = width > 0 && width < BREAKPOINTS.TABLET;
  const isTablet = width >= BREAKPOINTS.TABLET && width < BREAKPOINTS.DESKTOP;
  const isSmallDesktop =
    width >= BREAKPOINTS.DESKTOP && width < BREAKPOINTS.WIDE;

  return function openWindowCentered(
    iconId: string,
    parentId: string,
    title: string,
    icon: StaticImageData | string,
  ) {
    const store = useWindowsStore.getState();
    const openCountBefore = store.windows.length;

    const app = APPLICATIONS[iconId];
    const showTabs = app?.showTabs ?? false;
    const isImage = iconId.startsWith("image-");

    const parentApp = parentId ? APPLICATIONS[parentId] : undefined;
    const parentTitle = parentApp?.tabTitle ?? parentApp?.windowTitle;

    if (parentId && getMediaTabs().has(parentId)) {
      const iconSrc = typeof icon === "string" ? icon : icon.src;
      addRecentItem({ id: iconId, title, icon: iconSrc, sourceTab: parentId });
    }

    const windowId = store.openWindow(
      iconId,
      parentId,
      title,
      icon,
      showTabs,
      parentTitle,
    );

    if (isMobile) {
      store.setWindowSize(windowId, width, height);
      store.setWindowPosition(windowId, 0, 0);
    } else if (isTablet) {
      const preferredSize =
        app?.defaultSize ?? (isImage ? IMAGE_WINDOW_SIZE : TABLET_WINDOW_SIZE);
      const tabletWidth = Math.min(preferredSize.width, width * 0.9);
      const tabletHeight = Math.min(preferredSize.height, height * 0.9);
      const tabletX = width / 2 - tabletWidth / 2;
      const tabletY = height / 2 - tabletHeight / 2;
      store.setWindowSize(windowId, tabletWidth, tabletHeight);
      store.setWindowPosition(windowId, tabletX, tabletY);
    } else {
      const breakpointSize = isSmallDesktop
        ? SMALL_DESKTOP_WINDOW_SIZE
        : LARGE_DESKTOP_WINDOW_SIZE;
      const preferredSize =
        app?.defaultSize ?? (isImage ? IMAGE_WINDOW_SIZE : breakpointSize);
      const effectiveWidth = Math.min(preferredSize.width, width * 0.9);
      const effectiveHeight = Math.min(preferredSize.height, height * 0.9);
      const { x: calculatedX, y: calculatedY } = computeCascadePosition({
        index: openCountBefore,
        step: CASCADE_STEP,
        maxSlots: MAX_CASCADE_SLOTS,
        windowWidth: effectiveWidth,
        windowHeight: effectiveHeight,
        viewportWidth: width,
        viewportHeight: height,
        topInset: WORKAREA_TOP_INSET,
        bottomInset: WORKAREA_BOTTOM_INSET,
      });
      store.setWindowSize(windowId, effectiveWidth, effectiveHeight);
      store.setWindowPosition(windowId, calculatedX, calculatedY);
    }

    return windowId;
  };
};
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/hooks/useOpenWindow.test.ts`
Expected: PASS.

---

### Task 4: Migrar `Window` para `useWindow(id)` + actions (com fallback de exit)

**Files:**

- Modify: `src/components/window/index.tsx`

- [ ] **Step 1: Trocar imports**

Substituir a linha `import { useWindows } from "@/hooks/useWindows";` por:

```ts
import { useWindowActions } from "@/hooks/useWindowActions";
import { useWindow } from "@/hooks/useWindowSelectors";
```

- [ ] **Step 2: `TabbedWindow` usa `useWindowActions`**

Em `TabbedWindow`, trocar:

```ts
const { setWindowActiveTab } = useWindows();
```

por:

```ts
const { setWindowActiveTab } = useWindowActions();
```

- [ ] **Step 3: Mudar a assinatura de `Window` para receber `id`**

Trocar a interface e a assinatura. De:

```ts
interface WindowProps {
  window: WindowType;
  desktopRect: { width: number; height: number; top: number; left: number };
}
```

```ts
export function Window({ window, desktopRect }: WindowProps) {
  const {
    bringToFront,
    activeWindowId,
    setWindowPosition,
    setWindowSize,
    snapWindow,
    setSnapPreview,
    maximizeWindow,
    isMobile,
  } = useWindows();
  const { width: viewportWidth, height: viewportHeight } = useViewport();
```

para:

```ts
interface WindowProps {
  id: string;
  desktopRect: { width: number; height: number; top: number; left: number };
}

export function Window({ id, desktopRect }: WindowProps) {
  const {
    bringToFront,
    setWindowPosition,
    setWindowSize,
    snapWindow,
    setSnapPreview,
    maximizeWindow,
  } = useWindowActions();
  const { width: viewportWidth, height: viewportHeight } = useViewport();
  const isMobile = viewportWidth > 0 && viewportWidth < BREAKPOINTS.TABLET;

  // Assina só a fatia desta janela. Durante o exit-animation a entrada some do
  // store, então guardamos o último valor para o AnimatePresence terminar a saída.
  const liveWindow = useWindow(id);
  const lastWindowRef = useRef(liveWindow);
  if (liveWindow) lastWindowRef.current = liveWindow;
  const window = liveWindow ?? lastWindowRef.current;
  if (!window) return null;
```

> Nota: `BREAKPOINTS` e `useViewport`/`useRef` já estão importados no arquivo.

- [ ] **Step 4: Substituir os usos de `activeWindowId` por `window.isActive`**

No efeito de foco (≈ linha 293):

```ts
if (activeWindowId !== window.id || window.isMinimized) return;
```

→

```ts
if (!window.isActive || window.isMinimized) return;
```

e nas deps do mesmo `useEffect`, trocar `activeWindowId` por `window.isActive`:

```ts
}, [window.isActive, window.id, window.isMinimized]);
```

Em `handleWindowClick` (≈ linha 300):

```ts
function handleWindowClick() {
  if (window.isActive) return;
  bringToFront(window.id);
}
```

- [ ] **Step 5: Verificar typecheck/lint**

Run: `npx tsc --noEmit`
Expected: erros SÓ em `src/components/layout/desktop.tsx` (ainda passa `window={...}` em vez de `id={...}`) — corrigido na Task 5. Nenhum erro dentro de `window/index.tsx`.

---

### Task 5: Migrar `Desktop` para `useWindowIds()`

**Files:**

- Modify: `src/components/layout/desktop.tsx`

- [ ] **Step 1: Trocar o import e o hook**

Trocar `import { useWindows } from "@/hooks/useWindows";` por:

```ts
import { useWindowIds } from "@/hooks/useWindowSelectors";
```

e trocar `const { windows } = useWindows();` (linha 38) por:

```ts
const windowIds = useWindowIds();
```

- [ ] **Step 2: Trocar o `.map`**

De:

```tsx
<AnimatePresence>
  {windows.map((window) => (
    <Window key={window.id} window={window} desktopRect={desktopRect} />
  ))}
</AnimatePresence>
```

para:

```tsx
<AnimatePresence>
  {windowIds.map((id) => (
    <Window key={id} id={id} desktopRect={desktopRect} />
  ))}
</AnimatePresence>
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`
Expected: sem erros em `desktop.tsx` nem `window/index.tsx` (os demais consumidores ainda usam `useWindows`, que existe até a Task 11).

---

### Task 6: `React.memo` no `Icon` + `useOpenWindow`

**Files:**

- Modify: `src/components/icon.tsx`

- [ ] **Step 1: Trocar a fonte de `openWindowCentered`**

Trocar `import { useWindows } from "@/hooks/useWindows";` por:

```ts
import { useOpenWindow } from "@/hooks/useOpenWindow";
```

e `const { openWindowCentered } = useWindows();` (linha 43) por:

```ts
const openWindowCentered = useOpenWindow();
```

- [ ] **Step 2: Envolver o componente em `memo`**

Garantir `memo` importado do react (adicionar ao import existente `import { ... } from "react"`). Trocar a declaração `export function Icon(props) {` para uma constante memoizada. Ex.: se hoje é `export function Icon({ ... }: IconProps) {`, passar para:

```tsx
export const Icon = memo(function Icon({} /* mesmos props */ : IconProps) {
  // corpo inalterado
});
```

(Fechar com `});` no final do componente.)

> Props do `Icon` vêm do `Desktop` como `{...icon}` (campos primitivos do ícone), então a comparação rasa do `memo` funciona sem comparador customizado.

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`
Expected: sem erros em `icon.tsx`.

---

### Task 7: Migrar consumidores só-`openWindowCentered` para `useOpenWindow()`

Troca mecânica idêntica em 6 arquivos: remover a linha `import { useWindows } from "@/hooks/useWindows";`, adicionar `import { useOpenWindow } from "@/hooks/useOpenWindow";`, e trocar `const { openWindowCentered } = useWindows();` por `const openWindowCentered = useOpenWindow();`.

**Files:**

- Modify: `src/components/about-me.tsx` (linha 35)
- Modify: `src/components/layout/dock.tsx` (linha 313)
- Modify: `src/components/spotlight.tsx` (linha 20)
- Modify: `src/components/layout/file-browser.tsx` (linha 142)
- Modify: `src/components/layout/taskbar/start-dropdown.tsx` (linha 38)
- Modify: `src/components/layout/desktop-wrapper.tsx` (linha 66)

- [ ] **Step 1: Aplicar a troca nos 6 arquivos** (padrão acima).

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit`
Expected: sem novos erros nesses arquivos.

---

### Task 8: Migrar consumidores de actions para `useWindowActions()`

**Files:**

- Modify: `src/components/image-viewer.tsx` (linha 59)
- Modify: `src/components/window/resize-handles.tsx` (linha 53)
- Modify: `src/components/window/window-header.tsx` (linhas 60–66, 128)

- [ ] **Step 1: `image-viewer.tsx`**

Trocar import por `import { useWindowActions } from "@/hooks/useWindowActions";` e `const { updateWindowTitle } = useWindows();` por `const { updateWindowTitle } = useWindowActions();`.

- [ ] **Step 2: `resize-handles.tsx`**

Trocar import e `const { setWindowPosition, setWindowSize } = useWindows();` por `const { setWindowPosition, setWindowSize } = useWindowActions();`.

- [ ] **Step 3: `window-header.tsx` — actions + trocar `activeWindowId` por `window.isActive`**

Trocar import por `import { useWindowActions } from "@/hooks/useWindowActions";`. Trocar o bloco:

```ts
const {
  closeWindow,
  toggleMaximize,
  setWindowSize,
  minimizeWindow,
  activeWindowId,
} = useWindows();
```

por:

```ts
const { closeWindow, toggleMaximize, setWindowSize, minimizeWindow } =
  useWindowActions();
```

e a linha 128:

```ts
const isActive = activeWindowId === window.id;
```

por:

```ts
const isActive = window.isActive;
```

> `window` é prop do `WindowHeader` e `isActive` é mantido em sincronia pelo store (`setActiveWindow`), então é equivalente.

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit`
Expected: sem novos erros nesses arquivos.

---

### Task 9: Migrar consumidores de `isMobile` para `useIsMobile()`

**Files:**

- Modify: `src/components/portfolio.tsx` (linha 180)
- Modify: `src/components/window/window-content.tsx` (linha 34)

- [ ] **Step 1: `portfolio.tsx`**

Trocar `import { useWindows } from "@/hooks/useWindows";` por `import { useIsMobile } from "@/hooks/useIsMobile";` e `const { isMobile } = useWindows();` por `const isMobile = useIsMobile();`.

- [ ] **Step 2: `window-content.tsx`**

Mesma troca: `const { isMobile } = useWindows();` → `const isMobile = useIsMobile();` (com o import de `useIsMobile`).

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`
Expected: sem novos erros. Rodar também `npm test` para garantir que nada quebrou até aqui.

---

### Task 10: Migrar consumidores do array `windows` para seletores estreitos

**Files:**

- Modify: `src/components/layout/taskbar/index.tsx` (linha 10)
- Modify: `src/components/layout/taskbar/windows.dropdown.tsx` (linhas 13, 19–20)
- Modify: `src/components/system-monitor.tsx` (linha 112)
- Modify: `src/components/terminal.tsx` (linha 31)

- [ ] **Step 1: `taskbar/index.tsx` — só precisa de `windows.length`**

Trocar `import { useWindows } from "@/hooks/useWindows";` por `import { useWindowsStore } from "@/stores/windows-store";` e `const { windows } = useWindows();` por:

```ts
const windowCount = useWindowsStore((s) => s.windows.length);
```

e o uso `{windows.length > 0 && <WindowsDropdown />}` por `{windowCount > 0 && <WindowsDropdown />}`.

- [ ] **Step 2: `windows.dropdown.tsx` — lista projetada + actions**

Trocar o import por:

```ts
import { useShallow } from "zustand/react/shallow";
import { useWindowsStore } from "@/stores/windows-store";
import { useWindowActions } from "@/hooks/useWindowActions";
```

Trocar o bloco:

```ts
const { windows, closeWindow, closeAllWindows, bringToFront, restoreWindow } =
  useWindows();
```

por:

```ts
const windows = useWindowsStore(
  useShallow((s) =>
    s.windows.map((w) => ({
      id: w.id,
      title: w.title,
      isActive: w.isActive,
      isMinimized: w.isMinimized,
    })),
  ),
);
const { closeWindow, closeAllWindows, bringToFront, restoreWindow } =
  useWindowActions();
```

> O restante do componente já usa apenas `w.id`, `w.title`, `w.isActive`, `w.isMinimized` — compatível com a projeção. Re-renderiza só quando esses campos mudam.

- [ ] **Step 3: `system-monitor.tsx` — contadores projetados**

Trocar o import por:

```ts
import { useShallow } from "zustand/react/shallow";
import { useWindowsStore } from "@/stores/windows-store";
```

Trocar:

```ts
const { windows } = useWindows();
const openCount = windows.length;
const minimizedCount = windows.filter((w) => w.isMinimized).length;
```

por:

```ts
const { openCount, minimizedCount } = useWindowsStore(
  useShallow((s) => ({
    openCount: s.windows.length,
    minimizedCount: s.windows.filter((w) => w.isMinimized).length,
  })),
);
```

- [ ] **Step 4: `terminal.tsx` — ler `windows` sob demanda + `useOpenWindow`/`useWindowActions`**

`windows` só é usado dentro do `handleSubmit` (callback), então não precisa de subscription. Trocar o import por:

```ts
import { useWindowsStore } from "@/stores/windows-store";
import { useOpenWindow } from "@/hooks/useOpenWindow";
import { useWindowActions } from "@/hooks/useWindowActions";
```

Trocar `const { openWindowCentered, windows, closeWindow } = useWindows();` por:

```ts
const openWindowCentered = useOpenWindow();
const { closeWindow } = useWindowActions();
```

Dentro do handler, trocar a linha 72:

```ts
const win = windows.find((w) => w.iconId === iconId);
```

por:

```ts
const win = useWindowsStore.getState().windows.find((w) => w.iconId === iconId);
```

e **remover** `windows` do array de dependências do `useCallback` (linha 83): `[input, iconId, closeWindow, openWindowCentered, appendOutput]`.

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit`
Expected: sem novos erros nesses arquivos.

---

### Task 11: Remover `useWindows.ts` e validar o conjunto

**Files:**

- Delete: `src/hooks/useWindows.ts`

- [ ] **Step 1: Confirmar que não há mais consumidores**

Run: `npx tsc --noEmit` (ou buscar por `useWindows` no `src/`).
Expected: nenhuma referência a `@/hooks/useWindows` restante.

- [ ] **Step 2: Deletar o arquivo**

Remover `src/hooks/useWindows.ts`.

- [ ] **Step 3: Suite completa de verificação estática**

Run: `npx tsc --noEmit`
Expected: PASS (0 erros).

Run: `npm run lint`
Expected: PASS.

Run: `npm test`
Expected: PASS — inclui `src/stores/windows-store.test.ts` (lógica do store inalterada) e os 3 novos testes de hook.

Run: `npx prettier --check src/hooks src/components`
Expected: sem arquivos fora do padrão (rodar `npx prettier --write` nos que acusarem).

---

### Task 12: Verificação antes/depois com react-scan + manual

Reproduzir o roteiro do baseline e confirmar a queda do fan-out. O dev server precisa estar no ar (`npm run dev`), com duas janelas abertas (ex.: System Settings + Terminal) e a janela Files aberta para o teste de aba.

- [ ] **Step 1: Medir troca de foco**

No console/eval da página, com duas janelas abertas, focar a inativa após reset:

```js
window.__scanReset();
document
  .querySelector('[role="dialog"][aria-label="Terminal"]')
  .dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
```

Depois:

```js
const r = window.__scanReport();
({ components: r.length, total: r.reduce((a, x) => a + x.total, 0) });
```

Expected: `Desktop`, `Icon`, `ContextMenu`, `Popper` **ausentes** do relatório; contagem cai de ~141 componentes / ~771 renders para só as subárvores de janela afetadas.

- [ ] **Step 2: Medir troca de aba (janela Files)**

```js
window.__scanReset();
[...document.querySelectorAll('[role="tab"]')]
  .find((t) => t.textContent.trim() === "Documents")
  .dispatchEvent(new MouseEvent("click", { bubbles: true }));
```

Depois `window.__scanReport()`.
Expected: cai de ~945 renders / 168 componentes para ~só a janela Files; `IconBase`/`ContextMenu` fora do relatório.

- [ ] **Step 3: Checklist manual** (dev server no browser)

Confirmar sem regressão: arrastar janela, edge-snap (esquerda/direita/maximizar), maximizar/restaurar, minimizar/restaurar pela taskbar, trocar foco entre janelas, trocar abas no Files, abrir/fechar janelas (animação de saída OK), abrir via Dock/Spotlight/Start, e o comando de fechar do Terminal.

- [ ] **Step 4: Deixar tudo no working tree**

NÃO commitar. Reportar ao usuário o resumo antes/depois (números do react-scan) e a checklist manual para revisão. O usuário decide o commit.

---

## Self-Review (autor do plano)

- **Cobertura do spec:** hooks fatiados (Tasks 1–3), `Desktop`→ids (Task 5), `Window`→slice + fallback de exit (Task 4), `memo` no `Icon` (Task 6), migração dos 19 consumidores (Tasks 4,6,7,8,9,10), remoção do `useWindows` (Task 11), verificação react-scan+testes+manual (Tasks 9,11,12). ✔
- **Sem placeholders:** todos os passos de código trazem o código real. ✔
- **Consistência de tipos/nomes:** `useWindowActions`, `useWindow`, `useWindowIds`, `useOpenWindow` usados com os mesmos nomes em todas as tarefas; `Window` passa a receber `{ id, desktopRect }` (Task 4) e o `Desktop` passa `id`/`desktopRect` (Task 5). ✔
- **Comportamento preservado:** lógica do store intacta; `activeWindowId === window.id` → `window.isActive` (equivalente pelo store); cascade lê `windows.length` pré-abertura. ✔
