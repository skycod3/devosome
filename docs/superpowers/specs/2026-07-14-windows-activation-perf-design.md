# Design — Ativação/foco de janelas cirúrgico (parar de tocar todas as janelas)

**Data:** 2026-07-14
**Escopo:** tornar as actions de ativação/foco do `windows-store` reference-preserving; trocar o zIndex de re-sequenciado para monotônico.
**Fora de escopo:** nada mais — é a última fonte de fan-out da lista.

## Problema

Várias actions do `windows-store` recriam o objeto de **todas** as janelas a cada operação, então cada `useWindow(id)` dispara e **todas** as janelas re-renderizam:

- **`bringToFront(id)`** ([windows-store.ts:549](../../../src/stores/windows-store.ts)) re-sequencia o `zIndex` de todas (para mantê-los compactos: `BASE+1, BASE+2, …`) e reescreve `isActive` de todas.
- **`setActiveWindow(id)`** mapeia todas setando `isActive`, e ainda chama `bringToFront`.
- **`openWindow`** faz `[...windows.map((w) => ({ ...w, isActive: false })), newWindow]` — desativa todas.
- **`restoreWindow(id)`** faz `if (window.id !== id) return { ...window, isActive: false }` — recria todas as outras.
- **`deactivateAllWindows`** mapeia todas.

Medição (react-scan): abrir/focar uma janela re-renderiza **todas** as abertas (`Window: N`).

Já são cirúrgicos (preservam referências das não afetadas): `minimizeWindow`, `maximizeWindow`, `closeWindow`, `setWindowPosition/Size`, `snapWindow`, `setWindowActiveTab`, `updateWindowTitle`.

A store **não é persistida** (só `devtools`), então o `zIndex` reseta a cada reload.

## Objetivos

- Focar uma janela re-renderiza **só 2** janelas (a que ganha e a que perde foco).
- Abrir uma janela re-renderiza **só** a nova + a ativa-anterior.
- **Comportamento observável inalterado**: qual janela fica ativa, ordem de empilhamento relativa (z), restore/minimize/maximize, reativação ao fechar.

### Não-objetivos

- Manter o `zIndex` compacto/contíguo (não há dependência disso no código; snap-preview usa `highestZIndex - 1`, que segue funcionando).

## Design

### 1. zIndex monotônico

`highestZIndex` passa a ser um **contador monotônico**: só aumenta em `bringToFront`/`openWindow`; volta a `BASE_Z_INDEX` apenas quando não há janelas. `closeWindow` deixa de recalculá-lo a partir da contagem.

Crescimento ilimitado por sessão é seguro: sem persistência (reseta no reload) e o teto do CSS (`2147483647`) exigiria ~2 bilhões de focos.

### 2. `bringToFront(id)` cirúrgico

```ts
bringToFront(id) {
  const { windows, highestZIndex } = get();
  if (!windows.some((w) => w.id === id)) return;
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
}
```

Toca só a janela focada + a que estava ativa. Usa `w.isActive` (não `activeWindowId`) para achar a que desativar — robusto mesmo se houver múltiplas marcadas.

### 3. As outras actions

- **`openWindow`**: a nova janela recebe `zIndex: highestZIndex + 1` (em vez de `BASE + windows.length + 1`); desativa só a ativa anterior:

  ```ts
  windows: [
    ...state.windows.map((w) => (w.isActive ? { ...w, isActive: false } : w)),
    newWindow, // zIndex = newZ
  ],
  highestZIndex: newZ,
  ```

  (Ambos os ramos de `openWindow` — janela tabbed e regular — usam o mesmo padrão.)

- **`setActiveWindow(id)`**: vira wrapper fino — `get().bringToFront(id);` (hoje faz um `map` completo redundante antes de chamar `bringToFront`). Comportamento idêntico (ativa + traz à frente).

- **`restoreWindow(id)`**: o `map` toca **só a janela-alvo** (flags/geometria de restore); `if (window.id !== id) return window;` (preserva as demais). Remove o `isActive` do update do alvo — a ativação/front fica com o `get().bringToFront(id)` já chamado no fim.

- **`deactivateAllWindows`**: `windows.map((w) => (w.isActive ? { ...w, isActive: false } : w))` + `activeWindowId: null`.

- **`closeWindow`**: remover a linha que seta `highestZIndex: BASE + newWindows.length`; manter o contador monotônico, resetando a `BASE_Z_INDEX` **só** quando `newWindows.length === 0`. O resto (filtrar a fechada; reativar a de maior z com `map` que preserva as outras) já é cirúrgico e fica igual.

- **`minimizeWindow`/`maximizeWindow`**: já cirúrgicos — inalterados.

## Comportamento esperado após a correção

- **Focar** (clique/`bringToFront`) → 2 janelas re-renderizam; z relativo preservado (a focada vai ao topo).
- **Abrir** → nova + ativa-anterior; demais intocadas.
- **Restaurar/minimizar/maximizar/fechar** → só as janelas envolvidas (como já era em minimize/maximize).

## Verificação

- **`windows-store.test.ts` existente verde** — comportamento observável inalterado (ativo correto, ordem de z, restore/minimize/maximize, reativação ao fechar).
- **Testes novos de preservação de referência** (mesmo padrão do fix de `unhighlightAllIcons`):
  - `bringToFront`: focar A→B mantém a referência das janelas não envolvidas; A e B trocam.
  - `openWindow`: abrir mantém a referência das já-inativas; só a ativa-anterior troca.
  - `restoreWindow`/`deactivateAllWindows`: idem.
  - zIndex monotônico: `bringToFront` seguido de `bringToFront` gera z crescente; a focada tem o maior z.
- **react-scan**: focar entre 3+ janelas → `Window: 2`; abrir com N abertas → só a nova + a ativa-anterior.

## Riscos

- **Ordem de empilhamento**: como z vira monotônico, a janela focada sempre tem o maior z — igual ao efeito do re-sequenciamento atual. `closeWindow` reativa a de maior z (a mais recentemente focada), que continua correto. Cobrir com os testes existentes + manual (focar várias, conferir empilhamento e a reativação ao fechar a ativa).
- **`snap-preview`** usa `highestZIndex - 1` para ficar logo abaixo do topo — segue válido com o contador monotônico.
- **`setActiveWindow` como wrapper**: confirmar no plano que todos os callers querem "ativar + trazer à frente" (é o que já acontece hoje, pois ele chama `bringToFront`).
