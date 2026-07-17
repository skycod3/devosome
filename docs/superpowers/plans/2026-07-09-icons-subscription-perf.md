# Icons-store Subscription Perf — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar o fan-out de re-render do `icons-store` fatiando o acesso (`useIconActions` / `useIcon(id)` / `useDesktopIconIds` / `useIconIdsByParent` / `useHighlightedIcon` / `useIconList`), espelhando o refactor já feito no `windows-store`, sem mudar comportamento observável.

**Architecture:** `useIcons()` (assina o array `icons` inteiro) é substituído por hooks focados. `Icon` passa a receber `id` e ler a própria fatia; `Desktop`/`file-browser` assinam listas de ids (shallow) e deixam de re-renderizar em highlight; `unhighlightAllIcons`/`unhighlightIcon` ganham early-return para permitir chamadas incondicionais no clique de fundo.

**Tech Stack:** Next.js 16, React 19, Zustand 5 (`zustand/react/shallow`), Vitest 4 + @testing-library/react (jsdom).

---

## ⚠️ Convenções deste plano

- **SEM commits.** Nada é commitado — tudo fica no working tree para revisão manual. Cada tarefa termina em **verificação** (`tsc`/`eslint`/`vitest`), não em commit.
- Trabalho direto na branch `master`.
- PowerShell (Windows). Typecheck: `npx tsc --noEmit`. Lint: `npm run lint` (baseline: 10 problemas pré-existentes em boot-screen/contact/image-viewer/weather/useSounds — não introduzir novos). Testes: `npm test`.
- Padrão do projeto: componentes ligam à store **via hooks** em `src/hooks/`, nunca `useIconsStore` direto no componente.

## File Structure

**Criar:**

- `src/hooks/useIconActions.ts` — só actions do icons-store.
- `src/hooks/useIconSelectors.ts` — `useIcon(id)`, `useDesktopIconIds()`, `useIconIdsByParent(parentId)`, `useHighlightedIcon()`, `useIconList()`.
- `src/hooks/useIconActions.test.ts`, `src/hooks/useIconSelectors.test.ts`, `src/stores/icons-store.test.ts`.

**Modificar:** `src/stores/icons-store.ts`, `src/components/icon.tsx`, `src/components/layout/desktop.tsx`, `src/components/layout/file-browser.tsx`, `src/components/window/index.tsx`, `src/components/window/window-header.tsx`, `src/components/image-viewer.tsx`, `src/components/system-settings.tsx`.

**Remover:** `src/hooks/useIcons.ts`.

---

### Task 1: Hook `useIconActions()`

**Files:** Create `src/hooks/useIconActions.ts`, `src/hooks/useIconActions.test.ts`.

- [ ] **Step 1: Teste que falha**

```ts
// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useIconsStore } from "@/stores/icons-store";
import type { Icon } from "@/stores/icons-store";
import { useIconActions } from "./useIconActions";

function makeIcon(id: string, overrides: Partial<Icon> = {}): Icon {
  return {
    id,
    title: id,
    icon: "",
    isHighlighted: false,
    show: true,
    size: { width: 48, height: 48 },
    ...overrides,
  };
}

beforeEach(() => {
  useIconsStore.setState({ icons: [makeIcon("a"), makeIcon("b")] });
});

describe("useIconActions", () => {
  it("exposes actions with stable references and does NOT re-render when an icon field changes", () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return useIconActions();
    });
    const firstHighlight = result.current.highlightIcon;
    expect(renders).toBe(1);
    act(() => {
      useIconsStore.getState().highlightIcon("a");
    });
    expect(renders).toBe(1);
    expect(result.current.highlightIcon).toBe(firstHighlight);
  });
});
```

- [ ] **Step 2: Rodar e confirmar FAIL** — `npx vitest run src/hooks/useIconActions.test.ts` → "Cannot find module './useIconActions'".

- [ ] **Step 3: Implementar**

```ts
// src/hooks/useIconActions.ts
"use client";

import { useIconsStore } from "@/stores/icons-store";

/**
 * Actions only from the icons-store. Zustand actions have stable references, so
 * selecting them individually creates NO subscription to the `icons` array: a
 * component that only dispatches never re-renders on icon changes.
 */
export const useIconActions = () => ({
  setIcons: useIconsStore((s) => s.setIcons),
  addIcon: useIconsStore((s) => s.addIcon),
  removeIcon: useIconsStore((s) => s.removeIcon),
  showIcon: useIconsStore((s) => s.showIcon),
  hideIcon: useIconsStore((s) => s.hideIcon),
  showAllIcons: useIconsStore((s) => s.showAllIcons),
  hideAllIcons: useIconsStore((s) => s.hideAllIcons),
  highlightIcon: useIconsStore((s) => s.highlightIcon),
  unhighlightIcon: useIconsStore((s) => s.unhighlightIcon),
  highlightAllIcons: useIconsStore((s) => s.highlightAllIcons),
  unhighlightAllIcons: useIconsStore((s) => s.unhighlightAllIcons),
});
```

- [ ] **Step 4: Rodar e confirmar PASS.**

---

### Task 2: Hooks de seleção (`useIconSelectors.ts`)

**Files:** Create `src/hooks/useIconSelectors.ts`, `src/hooks/useIconSelectors.test.ts`.

- [ ] **Step 1: Teste que falha**

```ts
// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useIconsStore } from "@/stores/icons-store";
import type { Icon } from "@/stores/icons-store";
import {
  useIcon,
  useDesktopIconIds,
  useIconIdsByParent,
  useHighlightedIcon,
} from "./useIconSelectors";

function makeIcon(id: string, overrides: Partial<Icon> = {}): Icon {
  return {
    id,
    title: id,
    icon: "",
    isHighlighted: false,
    show: true,
    size: { width: 48, height: 48 },
    ...overrides,
  };
}

beforeEach(() => {
  useIconsStore.setState({
    icons: [
      makeIcon("d1"),
      makeIcon("d2"),
      makeIcon("f1", { parentId: "folder" }),
    ],
  });
});

describe("useIcon", () => {
  it("returns a single icon slice and does NOT re-render when another icon changes", () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return useIcon("d1");
    });
    expect(result.current?.id).toBe("d1");
    expect(renders).toBe(1);
    act(() => {
      useIconsStore.getState().highlightIcon("d2");
    });
    expect(renders).toBe(1);
  });
});

describe("useDesktopIconIds", () => {
  it("lists shown desktop icon ids and stays shallow-equal across a highlight", () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return useDesktopIconIds();
    });
    expect(result.current).toEqual(["d1", "d2"]);
    expect(renders).toBe(1);
    act(() => {
      useIconsStore.getState().highlightIcon("d1");
    });
    expect(renders).toBe(1);
    act(() => {
      useIconsStore.getState().hideIcon("d1");
    });
    expect(result.current).toEqual(["d2"]);
    expect(renders).toBe(2);
  });
});

describe("useIconIdsByParent", () => {
  it("lists a folder's icon ids", () => {
    const { result } = renderHook(() => useIconIdsByParent("folder"));
    expect(result.current).toEqual(["f1"]);
  });
});

describe("useHighlightedIcon", () => {
  it("returns the highlighted icon and updates when highlight moves", () => {
    const { result } = renderHook(() => useHighlightedIcon());
    expect(result.current).toBeUndefined();
    act(() => {
      useIconsStore.getState().highlightIcon("d2");
    });
    expect(result.current?.id).toBe("d2");
  });
});
```

- [ ] **Step 2: Rodar e confirmar FAIL.**

- [ ] **Step 3: Implementar**

```ts
// src/hooks/useIconSelectors.ts
"use client";

import { useShallow } from "zustand/react/shallow";
import { useIconsStore } from "@/stores/icons-store";

/** A single icon's slice; re-renders only when that icon's object changes. */
export const useIcon = (id: string) =>
  useIconsStore((s) => s.icons.find((i) => i.id === id));

/** Shallow id list of shown desktop icons (no parentId). */
export const useDesktopIconIds = () =>
  useIconsStore(
    useShallow((s) =>
      s.icons.filter((i) => !i.parentId && i.show).map((i) => i.id),
    ),
  );

/** Shallow id list of the icons belonging to a folder. */
export const useIconIdsByParent = (parentId: string) =>
  useIconsStore(
    useShallow((s) =>
      s.icons.filter((i) => i.parentId === parentId).map((i) => i.id),
    ),
  );

/** The currently highlighted icon (single object; Object.is is enough). */
export const useHighlightedIcon = () =>
  useIconsStore((s) => s.icons.find((i) => i.isHighlighted));

/**
 * The full icon list. Re-renders on any icon change — only use in low-frequency
 * panels (settings, image viewer) that are mounted transiently.
 */
export const useIconList = () => useIconsStore((s) => s.icons);
```

- [ ] **Step 4: Rodar e confirmar PASS.**

---

### Task 3: Early-return em `unhighlightAllIcons`/`unhighlightIcon`

**Files:** Modify `src/stores/icons-store.ts`; Create `src/stores/icons-store.test.ts`.

- [ ] **Step 1: Teste que falha**

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { useIconsStore } from "@/stores/icons-store";
import type { Icon } from "@/stores/icons-store";

function makeIcon(id: string, overrides: Partial<Icon> = {}): Icon {
  return {
    id,
    title: id,
    icon: "",
    isHighlighted: false,
    show: true,
    size: { width: 48, height: 48 },
    ...overrides,
  };
}

beforeEach(() => {
  useIconsStore.setState({ icons: [makeIcon("a"), makeIcon("b")] });
});

describe("unhighlightAllIcons", () => {
  it("is a no-op (same array reference) when nothing is highlighted", () => {
    const before = useIconsStore.getState().icons;
    useIconsStore.getState().unhighlightAllIcons();
    expect(useIconsStore.getState().icons).toBe(before);
  });

  it("clears highlight when an icon is highlighted", () => {
    useIconsStore.getState().highlightIcon("a");
    const highlighted = useIconsStore.getState().icons;
    useIconsStore.getState().unhighlightAllIcons();
    expect(useIconsStore.getState().icons).not.toBe(highlighted);
    expect(useIconsStore.getState().icons.some((i) => i.isHighlighted)).toBe(
      false,
    );
  });
});

describe("unhighlightIcon", () => {
  it("is a no-op (same array reference) when the icon is not highlighted", () => {
    const before = useIconsStore.getState().icons;
    useIconsStore.getState().unhighlightIcon("a");
    expect(useIconsStore.getState().icons).toBe(before);
  });
});
```

- [ ] **Step 2: Rodar e confirmar FAIL** — `npx vitest run src/stores/icons-store.test.ts` (no-op tests fail: array reference changes today).

- [ ] **Step 3: Implementar o early-return**

Em `src/stores/icons-store.ts`, trocar:

```ts
      unhighlightIcon(id: string) {
        get().updateIcon(id, "isHighlighted", false);
      },
```

por:

```ts
      unhighlightIcon(id: string) {
        const icon = get().icons.find((i) => i.id === id);
        if (!icon?.isHighlighted) return;
        get().updateIcon(id, "isHighlighted", false);
      },
```

e trocar:

```ts
      unhighlightAllIcons() {
        get().updateAllIcons("isHighlighted", false);
      },
```

por:

```ts
      unhighlightAllIcons() {
        if (!get().icons.some((i) => i.isHighlighted)) return;
        get().updateAllIcons("isHighlighted", false);
      },
```

- [ ] **Step 4: Rodar e confirmar PASS.**

---

### Task 4: `Icon` id-based

**Files:** Modify `src/components/icon.tsx`.

- [ ] **Step 1: Trocar imports e a fonte de dados**

Trocar `import { useIcons } from "@/hooks/useIcons";` por:

```ts
import { useIconActions } from "@/hooks/useIconActions";
import { useIcon } from "@/hooks/useIconSelectors";
```

- [ ] **Step 2: Mudar props para `{ id, imagePlaceholder }` e ler a fatia**

Trocar a assinatura/props. De:

```ts
type IconProps = IconFromStore & {
  imagePlaceholder?: "blur" | "empty";
};

export const Icon = memo(function Icon({
  id,
  appId,
  title,
  icon,
  size,
  isHighlighted,
  parentId,
  imagePlaceholder,
}: IconProps) {
```

```ts
const { highlightIcon, unhighlightAllIcons } = useIcons();
```

para:

```ts
type IconProps = {
  id: string;
  imagePlaceholder?: "blur" | "empty";
};

export const Icon = memo(function Icon({ id, imagePlaceholder }: IconProps) {
  const iconData = useIcon(id);
  const { highlightIcon, unhighlightAllIcons } = useIconActions();
  const openWindowCentered = useOpenWindow();
  const { theme } = useTheme();

  // Removed by a store update (e.g. hidden) while a parent re-renders — the id
  // has already left the list, so there is nothing to draw. No AnimatePresence
  // wraps the icon grids, so no last-value fallback is needed.
  if (!iconData) return null;
  const { appId, title, icon, size, isHighlighted, parentId } = iconData;
```

> IMPORTANTE: mover a chamada existente de `useOpenWindow()` / `useTheme()` para logo abaixo de `useIconActions()` (todas antes do `if (!iconData) return null`, para não violar Rules of Hooks). Remover as chamadas duplicadas de `useOpenWindow`/`useTheme` que já existiam mais abaixo. O restante do corpo (handlers, JSX) permanece inalterado — segue usando `id`, `appId`, `title`, `icon`, `size`, `isHighlighted`, `parentId`, `imagePlaceholder` como antes.

- [ ] **Step 3: Verificar** — `npx tsc --noEmit`: erros esperados SÓ em `desktop.tsx`/`file-browser.tsx` (ainda passam `{...icon}`), corrigidos nas Tasks 5–6. Nada dentro de `icon.tsx`.

---

### Task 5: `Desktop`

**Files:** Modify `src/components/layout/desktop.tsx`.

- [ ] **Step 1: Trocar import e hooks**

Trocar `import { useIcons } from "@/hooks/useIcons";` por:

```ts
import { useIconActions } from "@/hooks/useIconActions";
import { useDesktopIconIds } from "@/hooks/useIconSelectors";
```

e `const { icons, setIcons, unhighlightAllIcons } = useIcons();` por:

```ts
const iconIds = useDesktopIconIds();
const { setIcons, unhighlightAllIcons } = useIconActions();
```

- [ ] **Step 2: `handleDesktopClick` incondicional**

Trocar:

```ts
function handleDesktopClick() {
  if (icons.some((icon) => icon.isHighlighted)) unhighlightAllIcons();
}
```

por:

```ts
function handleDesktopClick() {
  // unhighlightAllIcons is a no-op when nothing is highlighted (store guard),
  // so we don't need to subscribe to `icons` just to check.
  unhighlightAllIcons();
}
```

- [ ] **Step 3: Grid por ids**

Trocar:

```tsx
{
  icons
    .filter((icon) => !icon.parentId)
    .map((icon) => icon.show && <Icon key={icon.id} {...icon} />);
}
```

por:

```tsx
{
  iconIds.map((id) => <Icon key={id} id={id} />);
}
```

- [ ] **Step 4: Verificar** — `npx tsc --noEmit`: sem erros em `desktop.tsx` nem `icon.tsx` (o seeding em `useEffect` segue usando `setIcons`).

---

### Task 6: `file-browser` (grid + list)

**Files:** Modify `src/components/layout/file-browser.tsx`.

- [ ] **Step 1: Trocar import e hooks do `FileBrowser`**

Trocar `import { useIcons } from "@/hooks/useIcons";` por:

```ts
import { useIconActions } from "@/hooks/useIconActions";
import { useIcon, useIconIdsByParent } from "@/hooks/useIconSelectors";
```

Trocar `const { icons, addIcon, removeIcon, unhighlightAllIcons } = useIcons();` por:

```ts
const { addIcon, removeIcon, unhighlightAllIcons } = useIconActions();
const iconIds = useIconIdsByParent(iconId);
```

Remover o `useMemo` `iconsFromStore` e usar `iconIds` no lugar. Trocar `iconsFromStore.length` por `iconIds.length` (empty state e condições de grid/list).

- [ ] **Step 2: `handleAreaClick` incondicional**

Trocar:

```ts
function handleAreaClick() {
  if (icons.some((icon) => icon.isHighlighted)) unhighlightAllIcons();
}
```

por:

```ts
function handleAreaClick() {
  unhighlightAllIcons();
}
```

- [ ] **Step 3: Grid e list por ids**

Grid:

```tsx
{
  iconIds.map((id) => (
    <RevealItem key={id}>
      <Icon imagePlaceholder="blur" id={id} />
    </RevealItem>
  ));
}
```

List:

```tsx
{
  iconIds.map((id) => <ListRow key={id} id={id} />);
}
```

- [ ] **Step 4: `ListRow` id-based**

Trocar a assinatura e a fonte de dados do `ListRow`. De:

```ts
function ListRow({ icon }: { icon: IconType }) {
  const { highlightIcon, unhighlightAllIcons } = useIcons();
  const openWindowCentered = useOpenWindow();
```

para:

```ts
function ListRow({ id }: { id: string }) {
  const icon = useIcon(id);
  const { highlightIcon, unhighlightAllIcons } = useIconActions();
  const openWindowCentered = useOpenWindow();

  if (!icon) return null;
```

O corpo (handlers, JSX) segue usando `icon.*` como antes. Remover o import de tipo `IconType`/`Icon` se ficar sem uso (o typecheck aponta).

- [ ] **Step 5: Verificar** — `npx tsc --noEmit`: sem erros em `file-browser.tsx`.

---

### Task 7: `TabbedWindow` + `window-header`

**Files:** Modify `src/components/window/index.tsx`, `src/components/window/window-header.tsx`.

- [ ] **Step 1: `TabbedWindow`**

Em `src/components/window/index.tsx`, adicionar import:

```ts
import { useIconActions } from "@/hooks/useIconActions";
import { useHighlightedIcon } from "@/hooks/useIconSelectors";
```

No `TabbedWindow`, trocar:

```ts
const { icons, unhighlightAllIcons } = useIcons();
```

e (logo abaixo) `const highlightedIcon = icons.find((icon) => icon.isHighlighted);` por:

```ts
const { unhighlightAllIcons } = useIconActions();
const highlightedIcon = useHighlightedIcon();
```

Remover o `import { useIcons } from "@/hooks/useIcons";` (confirmar que nenhum outro uso resta no arquivo).

- [ ] **Step 2: `window-header`**

Em `src/components/window/window-header.tsx`, trocar `import { useIcons } from "@/hooks/useIcons";` por:

```ts
import { useIcon } from "@/hooks/useIconSelectors";
```

Trocar `const { icons } = useIcons();` e `const parentIcon = icons.find((icon) => icon.id === window.parentId);` por:

```ts
const parentIcon = useIcon(window.parentId);
```

- [ ] **Step 3: Verificar** — `npx tsc --noEmit`: sem erros nesses arquivos.

---

### Task 8: `image-viewer` + `system-settings` (hook amplo)

**Files:** Modify `src/components/image-viewer.tsx`, `src/components/system-settings.tsx`.

- [ ] **Step 1: `image-viewer`**

Trocar `import { useIcons } from "@/hooks/useIcons";` por `import { useIconList } from "@/hooks/useIconSelectors";` e `const { icons } = useIcons();` por `const icons = useIconList();`.

- [ ] **Step 2: `system-settings`**

Trocar `import { useIcons } from "@/hooks/useIcons";` por:

```ts
import { useIconActions } from "@/hooks/useIconActions";
import { useIconList } from "@/hooks/useIconSelectors";
```

e `const { icons, showIcon, hideIcon } = useIcons();` por:

```ts
const icons = useIconList();
const { showIcon, hideIcon } = useIconActions();
```

- [ ] **Step 3: Verificar** — `npx tsc --noEmit`: sem erros.

---

### Task 9: Remover `useIcons.ts` + suíte completa

**Files:** Delete `src/hooks/useIcons.ts`.

- [ ] **Step 1: Confirmar zero referências** — grep `src/` por `@/hooks/useIcons` e `useIcons(`. Só deve restar (nenhuma). Se algo referenciar, STOP e reportar.
- [ ] **Step 2: Deletar** `src/hooks/useIcons.ts`.
- [ ] **Step 3: Suíte** —
  - `npx tsc --noEmit` → 0 erros.
  - `npm run lint` → só os 10 problemas de baseline (nenhum novo nos arquivos tocados).
  - `npm test` → tudo verde (suíte + novos testes de hook/store).
  - `npx prettier --check` nos arquivos criados/modificados; `--write` nos que acusarem.

---

### Task 10: Verificação antes/depois (react-scan + manual)

Dev server no ar (`npm run dev`). Abrir Desktop + uma janela Files.

- [ ] **Step 1: Clicar ícone do desktop** — no console: `window.__scanReset()`, disparar clique num ícone do desktop, `window.__scanReport()`. Esperado: `Desktop`, `Dock`, `Taskbar` e janelas não relacionadas **ausentes**; só os ícones envolvidos (+ sidebar do Files se aberto).
- [ ] **Step 2: Clicar item no file-explorer** — idem, clicando um arquivo dentro do Files. Esperado: mesmo padrão.
- [ ] **Step 3: Checklist manual** — destacar/deselecionar (desktop e pasta), duplo-clique/Enter abre janela, sidebar do Files reflete o ícone destacado, mostrar/ocultar ícones no system-settings, view grid/list do file-browser.
- [ ] **Step 4:** Deixar tudo no working tree. NÃO commitar. Reportar o antes/depois ao usuário.

---

## Self-Review (autor do plano)

- **Cobertura do spec:** hooks fatiados (Tasks 1–2), early-return no store (Task 3), `Icon` id-based (Task 4), `Desktop` (Task 5), `file-browser` grid+list (Task 6), `TabbedWindow`+`window-header` (Task 7), painéis amplos (Task 8), remoção do `useIcons` (Task 9), verificação (Task 10). ✔
- **Sem placeholders:** todo passo de código traz o código real. ✔
- **Consistência de nomes:** `useIconActions`, `useIcon`, `useDesktopIconIds`, `useIconIdsByParent`, `useHighlightedIcon`, `useIconList` usados igualmente em todas as tarefas; `Icon` e `ListRow` passam a receber `id`. ✔
- **Comportamento preservado:** lógica do store intacta exceto early-return (resultado idêntico); `handleDesktopClick`/`handleAreaClick` incondicionais dependem desse early-return; `Icon`/`ListRow` guardam `if (!icon) return null` após os hooks (sem AnimatePresence nos grids, sem fallback de último valor). ✔
