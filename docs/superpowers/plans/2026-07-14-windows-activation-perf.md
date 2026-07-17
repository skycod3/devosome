# Windows Activation Perf Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar as actions de ativação/foco do `windows-store` reference-preserving (só tocam as janelas realmente afetadas), trocando o zIndex de re-sequenciado para um contador monotônico — para que focar/abrir uma janela pare de re-renderizar todas.

**Architecture:** `highestZIndex` vira contador monotônico. `bringToFront` passa a bumpar só a janela focada e desativar só a que estava ativa; `openWindow`, `setActiveWindow`, `restoreWindow` e `deactivateAllWindows` seguem o mesmo princípio (preservar a referência das janelas não afetadas). Comportamento observável inalterado.

**Tech Stack:** Zustand 5, Vitest 4.

---

## ⚠️ Convenções deste plano

- **SEM commits.** Nada é commitado — tudo fica no working tree. Cada tarefa fecha em verificação (`vitest`/`tsc`/`eslint`).
- Branch `master`. PowerShell (Windows). Testes: `npx vitest run src/stores/windows-store.test.ts` (suíte completa: `npm test`). Typecheck: `npx tsc --noEmit`. Lint: `npm run lint` (baseline: 10 problemas pré-existentes — não adicionar novos).
- **TDD**: em cada tarefa, escreva o teste, veja falhar, implemente, veja passar.
- Os testes novos vão no arquivo **existente** `src/stores/windows-store.test.ts`, que já tem: o mock de `@/constants/applications` (apps `files` [tabbed, tabs: recent/pictures/documents], `pictures`, `documents`, `about`, `contact`), o helper `reset` (roda em `beforeEach`), o helper `open(iconId, title?)` → retorna o id da janela, e o import de `BASE_Z_INDEX`.
- Janelas independentes nos testes: use `open("about")`, `open("contact")` e `open("files")` (as três criam janelas distintas; `pictures`/`documents` são **abas** do `files` e não criam janela própria).

## File Structure

**Modificar:** `src/stores/windows-store.ts` (as 5 actions de ativação + o contador), `src/stores/windows-store.test.ts` (testes novos, apensados).

Nenhum arquivo novo. Nenhum componente muda — a mudança é interna ao store.

---

### Task 1: `bringToFront` cirúrgico + zIndex monotônico

**Files:**

- Modify: `src/stores/windows-store.ts` (action `bringToFront`)
- Test: `src/stores/windows-store.test.ts`

- [ ] **Step 1: Escrever os testes que falham** (apender ao final do arquivo de teste)

```ts
describe("bringToFront (surgical)", () => {
  it("only touches the focused window and the previously active one", () => {
    const a = open("about");
    const b = open("contact");
    const c = open("files"); // c is active

    const bBefore = useWindowsStore.getState().windows.find((w) => w.id === b)!;

    useWindowsStore.getState().bringToFront(a);

    const s = useWindowsStore.getState();
    // b was neither focused nor previously active — same object identity
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
```

- [ ] **Step 2: Rodar e confirmar FAIL**

Run: `npx vitest run src/stores/windows-store.test.ts`
Expected: FAIL — o `bringToFront` atual re-sequencia todas as janelas (b troca de referência) e recalcula `highestZIndex` a partir da contagem.

- [ ] **Step 3: Implementar** — substituir a action `bringToFront` inteira por:

```ts
      bringToFront(id) {
        const { windows, highestZIndex } = get();
        if (!windows.some((w) => w.id === id)) return;

        // Monotonic zIndex: only the focused window moves. Re-sequencing every
        // window (the previous behaviour) recreated every window object, so a
        // single focus re-rendered every open window.
        const newZ = highestZIndex + 1;

        set({
          windows: windows.map((w) =>
            w.id === id
              ? { ...w, zIndex: newZ, isActive: true }
              : w.isActive
                ? { ...w, isActive: false }
                : w,
          ),
          activeWindowId: id,
          highestZIndex: newZ,
        });
      },
```

- [ ] **Step 4: Rodar e confirmar PASS**

Run: `npx vitest run src/stores/windows-store.test.ts`
Expected: PASS (os novos + os pré-existentes).

---

### Task 2: `openWindow` cirúrgico

**Files:**

- Modify: `src/stores/windows-store.ts` (action `openWindow` — **os dois ramos**: tabbed e regular)
- Test: `src/stores/windows-store.test.ts`

- [ ] **Step 1: Escrever os testes que falham**

```ts
describe("openWindow (surgical)", () => {
  it("preserves the identity of already-inactive windows", () => {
    const a = open("about");
    const b = open("contact"); // b active, a inactive

    const aBefore = useWindowsStore.getState().windows.find((w) => w.id === a)!;

    open("files"); // a third window

    const s = useWindowsStore.getState();
    expect(s.windows.find((w) => w.id === a)).toBe(aBefore); // untouched
    expect(s.windows.find((w) => w.id === b)!.isActive).toBe(false); // deactivated
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
```

- [ ] **Step 2: Rodar e confirmar FAIL**

Run: `npx vitest run src/stores/windows-store.test.ts`
Expected: FAIL — o `openWindow` atual faz `windows.map((w) => ({ ...w, isActive: false }))` (recria todas) e usa `BASE_Z_INDEX + windows.length + 1`.

- [ ] **Step 3: Implementar** — três edições em `openWindow`:

**(a)** No topo da action, destruturar também `highestZIndex`. Trocar:

```ts
const { windows } = get();
```

por:

```ts
const { windows, highestZIndex } = get();
```

**(b)** Nos **dois** ramos, trocar o cálculo do zIndex. Cada ramo tem uma linha:

```ts
const newZIndex = BASE_Z_INDEX + windows.length + 1;
```

(no ramo tabbed) e

```ts
const newZIndex = BASE_Z_INDEX + windows.length + 1;
```

(no ramo regular). Trocar **ambas** por (respeitando a indentação de cada uma):

```ts
const newZIndex = highestZIndex + 1;
```

```ts
const newZIndex = highestZIndex + 1;
```

**(c)** Nos **dois** ramos, trocar o `set` que desativa todas. Cada ramo tem:

```ts
set((state) => ({
  windows: [
    ...state.windows.map((w) => ({ ...w, isActive: false })),
    newWindow,
  ],
  activeWindowId: newWindowId,
  highestZIndex: newZIndex,
}));
```

por (só a janela ativa é desativada; as já-inativas mantêm identidade):

```ts
set((state) => ({
  windows: [
    ...state.windows.map((w) => (w.isActive ? { ...w, isActive: false } : w)),
    newWindow,
  ],
  activeWindowId: newWindowId,
  highestZIndex: newZIndex,
}));
```

(o ramo regular é idêntico, com dois níveis a menos de indentação).

> `BASE_Z_INDEX` continua sendo usado (valor inicial de `highestZIndex` e o reset em `closeAllWindows`/`closeWindow`), então **não** remova o import.

- [ ] **Step 4: Rodar e confirmar PASS**

Run: `npx vitest run src/stores/windows-store.test.ts`
Expected: PASS.

---

### Task 3: `setActiveWindow` + `deactivateAllWindows`

**Files:**

- Modify: `src/stores/windows-store.ts` (actions `setActiveWindow`, `deactivateAllWindows`)
- Test: `src/stores/windows-store.test.ts`

- [ ] **Step 1: Escrever os testes que falham**

```ts
describe("setActiveWindow (surgical)", () => {
  it("activates + fronts, touching only the two involved windows", () => {
    const a = open("about");
    const b = open("contact");
    const c = open("files"); // c active

    const bBefore = useWindowsStore.getState().windows.find((w) => w.id === b)!;

    useWindowsStore.getState().setActiveWindow(a);

    const s = useWindowsStore.getState();
    expect(s.windows.find((w) => w.id === b)).toBe(bBefore); // untouched
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
    expect(s.windows.find((w) => w.id === a)).toBe(aBefore); // untouched
    expect(s.windows.find((w) => w.id === b)!.isActive).toBe(false);
    expect(s.activeWindowId).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar e confirmar FAIL**

Run: `npx vitest run src/stores/windows-store.test.ts`
Expected: FAIL — ambas mapeiam todas as janelas recriando os objetos.

- [ ] **Step 3: Implementar** — substituir as duas actions:

```ts
      setActiveWindow(id) {
        // Activating always brings the window to front, and bringToFront does
        // both surgically (only the focused + previously active window change).
        get().bringToFront(id);
      },

      deactivateAllWindows() {
        set((state) => ({
          windows: state.windows.map((w) =>
            w.isActive ? { ...w, isActive: false } : w,
          ),
          activeWindowId: null,
        }));
      },
```

- [ ] **Step 4: Rodar e confirmar PASS**

Run: `npx vitest run src/stores/windows-store.test.ts`
Expected: PASS.

---

### Task 4: `restoreWindow` cirúrgico

**Files:**

- Modify: `src/stores/windows-store.ts` (action `restoreWindow`)
- Test: `src/stores/windows-store.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
describe("restoreWindow (surgical)", () => {
  it("only touches the restored window and the previously active one", () => {
    const a = open("about");
    const b = open("contact");
    const c = open("files"); // c active

    useWindowsStore.getState().minimizeWindow(a);

    const bBefore = useWindowsStore.getState().windows.find((w) => w.id === b)!;

    useWindowsStore.getState().restoreWindow(a);

    const s = useWindowsStore.getState();
    expect(s.windows.find((w) => w.id === b)).toBe(bBefore); // untouched
    const wa = s.windows.find((w) => w.id === a)!;
    expect(wa.isMinimized).toBe(false);
    expect(wa.isActive).toBe(true);
    expect(wa.zIndex).toBe(s.highestZIndex); // brought to front
    expect(s.windows.find((w) => w.id === c)!.isActive).toBe(false);
    expect(s.activeWindowId).toBe(a);
  });
});
```

- [ ] **Step 2: Rodar e confirmar FAIL**

Run: `npx vitest run src/stores/windows-store.test.ts`
Expected: FAIL — o `restoreWindow` atual faz `if (window.id !== id) return { ...window, isActive: false };`, recriando todas as outras janelas.

- [ ] **Step 3: Implementar** — substituir a action `restoreWindow` inteira por (as janelas não-alvo mantêm identidade; a ativação/front fica com o `bringToFront` do fim):

```ts
      restoreWindow(id) {
        set((state) => ({
          windows: state.windows.map((window) => {
            // Untouched windows keep their identity. Activation/z is handled by
            // bringToFront below, which only touches the focused + previously
            // active window.
            if (window.id !== id) return window;

            // Restore from minimized state
            if (window.isMinimized) {
              // Restore to the state before minimization (normal or maximized)
              if (window.lastState === "maximized") {
                return {
                  ...window,
                  isMinimized: false,
                  isMaximized: true,
                  lastState: "minimized", // Track that previous state was minimized
                };
              }
              // Restore to normal state
              return {
                ...window,
                isMinimized: false,
                isMaximized: false,
                lastState: "minimized", // Track that previous state was minimized
              };
            }

            // Restore from maximized state
            if (
              window.isMaximized &&
              window.restorePosition &&
              window.restoreSize
            ) {
              const snap = window.snapRect;
              const reSnap = !!(window.restoreSnapped && snap);

              return {
                ...window,
                isMinimized: false,
                isMaximized: false,
                // A window that was snapped before maximizing comes back snapped
                // at full work-area height (an unsnapped restore would be clipped
                // by the 90dvh max-height).
                isSnapped: reSnap,
                lastState: "maximized", // Track that previous state was maximized
                position:
                  reSnap && snap
                    ? { x: snap.x, y: snap.y }
                    : window.restorePosition,
                size:
                  reSnap && snap
                    ? { width: snap.width, height: snap.height }
                    : window.restoreSize,
                // Re-snap keeps the pre-snap floating geometry so a later drag can
                // un-snap to it; a normal restore consumes and clears it.
                restorePosition: reSnap ? window.restorePosition : undefined,
                restoreSize: reSnap ? window.restoreSize : undefined,
                restoreSnapped: undefined,
                snapRect: reSnap ? window.snapRect : undefined,
              };
            }

            // Already in normal state, nothing to restore
            return window;
          }),
        }));

        // Brings it to front AND sets isActive / activeWindowId (surgically).
        get().bringToFront(id);
      },
```

> Mudanças em relação ao original: o ramo `window.id !== id` devolve `window` (em vez de recriar com `isActive: false`); os ramos de restore **não** setam mais `isActive: true`; o `set` **não** seta mais `activeWindowId` — tudo isso passa a ser feito pelo `bringToFront(id)` chamado logo depois.

- [ ] **Step 4: Rodar e confirmar PASS**

Run: `npx vitest run src/stores/windows-store.test.ts`
Expected: PASS.

---

### Task 5: `closeWindow` — `highestZIndex` monotônico

**Files:**

- Modify: `src/stores/windows-store.ts` (action `closeWindow`)
- Test: `src/stores/windows-store.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
describe("closeWindow (monotonic zIndex)", () => {
  it("does not lower highestZIndex, and resets it only when empty", () => {
    const a = open("about");
    const b = open("contact");

    const zBefore = useWindowsStore.getState().highestZIndex;

    useWindowsStore.getState().closeWindow(b);
    expect(useWindowsStore.getState().highestZIndex).toBe(zBefore); // not lowered

    useWindowsStore.getState().closeWindow(a);
    expect(useWindowsStore.getState().highestZIndex).toBe(BASE_Z_INDEX); // reset
  });
});
```

- [ ] **Step 2: Rodar e confirmar FAIL**

Run: `npx vitest run src/stores/windows-store.test.ts`
Expected: FAIL — o `closeWindow` atual seta `highestZIndex: BASE_Z_INDEX + newWindows.length`, o que **abaixa** o contador.

- [ ] **Step 3: Implementar** — duas edições em `closeWindow`:

**(a)** Destruturar `highestZIndex`. Trocar:

```ts
const { windows, activeWindowId } = get();
```

por:

```ts
const { windows, activeWindowId, highestZIndex } = get();
```

**(b)** Trocar o `set` final:

```ts
set({
  windows: newWindows,
  activeWindowId: newActiveId,
  highestZIndex:
    newWindows.length > 0 ? BASE_Z_INDEX + newWindows.length : BASE_Z_INDEX,
});
```

por:

```ts
set({
  windows: newWindows,
  activeWindowId: newActiveId,
  // Keep the counter monotonic — lowering it could hand a newly focused
  // window a zIndex below an existing one. Reset only when empty.
  highestZIndex: newWindows.length > 0 ? highestZIndex : BASE_Z_INDEX,
});
```

> O resto de `closeWindow` fica igual: ele já filtra a janela fechada e, ao reativar, usa um `map` que preserva a identidade das demais.

- [ ] **Step 4: Rodar e confirmar PASS**

Run: `npx vitest run src/stores/windows-store.test.ts`
Expected: PASS.

---

### Task 6: Suíte completa

- [ ] **Step 1: Testes** — `npm test` → tudo verde (a suíte pré-existente do `windows-store.test.ts` cobre o comportamento observável: quem fica ativo, ordem de z, restore/minimize/maximize, reativação ao fechar; ela **não pode** ter regressões).
- [ ] **Step 2: Estática** — `npx tsc --noEmit` (0 erros); `npm run lint` (só os 10 problemas de baseline); `npx prettier --check src/stores/windows-store.ts src/stores/windows-store.test.ts` (rodar `--write` se acusar).
- [ ] **Step 3: Confirmar callers de `setActiveWindow`** — buscar por `setActiveWindow` em `src/` e confirmar que todos os usos querem "ativar + trazer à frente" (é o comportamento de hoje, já que a versão antiga chamava `bringToFront` no fim). Reportar se algum caller esperar algo diferente.

---

### Task 7: Verificação antes/depois (react-scan + manual)

Dev server no ar (`npm run dev`), com 3+ janelas abertas.

- [ ] **Step 1: Focar** — `window.__scanReset()`, clicar numa janela inativa, `window.__scanReport()`. Esperado: **`Window: 2`** (a que ganha e a que perde foco) — era `N`.
- [ ] **Step 2: Abrir** — reset, abrir uma app nova, report. Esperado: só a janela nova + a ativa-anterior; as demais em 0.
- [ ] **Step 3: Checklist manual** — focar entre várias janelas (empilhamento correto: a focada por cima), minimizar/restaurar pela taskbar, maximizar/restaurar, snap, fechar a janela ativa (a mais recentemente focada deve reativar), abrir app já aberta (deve focar a existente), e o snap-preview aparecendo logo abaixo da janela do topo.
- [ ] **Step 4:** Deixar no working tree. NÃO commitar. Reportar antes/depois.

---

## Self-Review (autor do plano)

- **Cobertura do spec:** `bringToFront` + monotônico (Task 1), `openWindow` nos dois ramos (Task 2), `setActiveWindow`/`deactivateAllWindows` (Task 3), `restoreWindow` (Task 4), `closeWindow`/contador (Task 5), suíte + callers (Task 6), react-scan/manual (Task 7). `minimizeWindow`/`maximizeWindow` são não-objetivo (já cirúrgicos) — não tocados. ✔
- **Sem placeholders:** todo passo traz teste e código reais. ✔
- **Consistência:** `highestZIndex` é o único contador; `bringToFront` é a única action que seta `isActive: true` + z do foco; `restoreWindow`/`setActiveWindow` delegam a ele. `BASE_Z_INDEX` segue importado (valor inicial + resets). ✔
- **Comportamento preservado:** empilhamento relativo (focada sempre no maior z), reativação ao fechar (maior z = mais recentemente focada), restore/minimize/maximize inalterados na semântica. ✔
