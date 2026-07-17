# Design — Corrigir fan-out de re-render do windows-store

**Data:** 2026-07-08
**Escopo desta rodada:** fatiar o acesso ao `windows-store` + `React.memo` no `Icon`.
**Fora de escopo (rodada futura):** repensar o `ContextMenu` por ícone (montagem sob demanda).

## Problema

`useWindows()` assina o **array `windows` inteiro** ([src/hooks/useWindows.ts:40](../../../src/hooks/useWindows.ts)) e 19 componentes usam esse hook. As actions do store reescrevem o array com objetos novos a cada mutação
(`bringToFront`/`setActiveWindow`/`setWindowActiveTab`/`setWindowPosition` fazem `windows.map(w => ({ ...w }))`).
Logo, **qualquer** mudança de estado de **uma** janela muda a referência do array e re-renderiza todos os consumidores.

O epicentro é o `Desktop` ([src/components/layout/desktop.tsx:38](../../../src/components/layout/desktop.tsx)): ele faz `const { windows } = useWindows()`
mas só usa `windows` no `.map` final. Como assina o array inteiro, cada mudança de janela re-renderiza o `Desktop` e, com ele,
**Taskbar, todos os `Icon`, `Dock`, `SnapPreview`, todas as `Window` e o `Spotlight`**. Os ícones re-renderizam por serem filhos do
`Desktop`, não por assinarem `windows`.

### Medições (react-scan, baseline)

| Interação                 | Janelas abertas | Renders | Componentes | Observação                                            |
| ------------------------- | --------------: | ------: | ----------: | ----------------------------------------------------- |
| Ocioso (4s)               |               1 |       0 |           0 | Limpo — sem desperdício de fundo                      |
| Abrir System Settings     |             0→1 |    ~366 |          88 | UI monta 1×; resto é fan-out do desktop               |
| Trocar foco entre janelas |               2 |    ~771 |         141 | Reordenar z-index repinta tudo                        |
| Trocar aba (Files)        |               3 |    ~945 |         168 | 61% em maquinário de menu/ícone sem relação com a aba |
| Drag + soltar (completo)  |               2 |    ~419 |          97 | Movimento barato (MotionValue); release = 1 fan-out   |

O drag confirma que o caminho de **alta frequência** (mover o ponteiro) já é otimizado com `useMotionValue`; só o **commit final**
(`setWindowPosition`) paga o imposto do fan-out.

## Objetivos

- Uma mudança de estado de uma janela deve re-renderizar **apenas as subárvores que dependem daquele estado**.
- Trocar foco/aba/soltar drag **não** deve re-renderizar `Desktop`, `Icon`, `Taskbar`, `Dock`.
- Nenhuma regressão de comportamento (drag, edge-snap, maximize, minimizar/restaurar, foco, abas, abrir/fechar).
- Lógica do store **inalterada** — muda apenas a **forma de assinar**.

### Não-objetivos

- Não alterar o algoritmo de zIndex do `bringToFront` (re-sequenciar N janelas ao focar é aceitável: o zIndex realmente muda).
- Não mexer no `ContextMenu` por ícone nesta rodada.

## Design

### 1. Três padrões de acesso ao store

Substituir o `useWindows()` único por:

- **`useWindowActions()`** — retorna **apenas as actions** do store. Actions no zustand têm referência estável, então selecioná-las
  **não cria subscription** a `windows`. Um componente que só despacha nunca re-renderiza por mudança de janela.
- **`useWindow(id)`** — assina a fatia de uma janela: `useWindowsStore(s => s.windows.find(w => w.id === id))`.
  O `Window` usa isso e só re-renderiza quando o objeto dele muda.
- **`useWindowIds()`** — assina só a lista de ids com `useShallow` (`windows.map(w => w.id)`). Retorna igual-raso enquanto nenhuma
  janela é aberta/fechada/reordenada. É o que o `Desktop` usa no `.map`.

`openWindowCentered` sai para **`useOpenWindow()`**, que lê `windows.length` via `useWindowsStore.getState().windows.length`
no momento da chamada (sem assinar) e o viewport via `useViewport`. Assim os componentes que **abrem** janelas não assinam `windows`
(re-renderizam só em resize de viewport, que é raro).

O `useWindows()` atual é **removido** após migrar todos os consumidores — sem alias legado, para não deixar a porta do fan-out aberta.

### 2. Migração dos componentes

| Componente      | Antes                              | Depois                                                                                 |
| --------------- | ---------------------------------- | -------------------------------------------------------------------------------------- |
| `Desktop`       | `const { windows } = useWindows()` | `useWindowIds()` → `<Window id={id} … />`                                              |
| `Window`        | recebe objeto `window` via prop    | recebe `id`; lê `useWindow(id)` (+ fallback de exit, ver abaixo)                       |
| `Icon`          | sem memo                           | `React.memo` + props estáveis vindas do `Desktop`                                      |
| Só-despacho¹    | `useWindows()`                     | `useWindowActions()` / `useOpenWindow()`                                               |
| Listam janelas² | `useWindows()` (array inteiro)     | seletor projetado estreito com `useShallow` (ex.: `[{id,title,isMinimized,isActive}]`) |

¹ icon, dock, spotlight, window-content, resize-handles, file-browser, image-viewer, portfolio, about-me, system-monitor, terminal, window-header.
² taskbar `windows.dropdown`, `start-dropdown`, taskbar/index.

### 3. Casos de borda

- **Exit animation:** ao fechar, a entrada some do store mas o `AnimatePresence` ainda anima a saída. O `Window` guarda o último valor
  num `useRef` como fallback, para `useWindow(id)` retornar `undefined` sem quebrar a animação de saída.
- **`bringToFront` re-sequencia zIndex de todas as janelas:** com `useWindow(id)` por janela, todas as `Window` re-renderizam ao focar
  (o zIndex delas mudou de fato). Isso é aceitável e **muito** menor que o baseline — Desktop/ícones/taskbar deixam de re-renderizar.
  O id-list do `Desktop` não muda (ordem do array preservada), então o `Desktop` não re-renderiza.

## Comportamento esperado após a correção

- **Trocar aba** → só `setWindowActiveTab` muda uma janela → re-renderiza **só a janela Files**.
- **Trocar foco** → re-renderiza **as N janelas** (zIndex mudou), **não** Desktop/ícones/taskbar.
- **Drag-end** → só a janela movida.
- **Abrir/fechar** → id-list muda → `Desktop` re-renderiza (necessário) + `AnimatePresence`; `Icon` memoizado não re-renderiza (props estáveis).
- **Ocioso** → 0 (mantido).

## Verificação

- **react-scan (gate numérico):** re-medir _trocar foco_, _trocar aba_, _drag_, _abrir_ com o mesmo roteiro do baseline.
  Alvo: em foco/aba, `Desktop`, `Icon`, `ContextMenu`, `Popper` **somem do relatório**; sobra só a(s) janela(s) afetada(s).
- **Testes:** `windows-store.test.ts` verde (lógica do store inalterada).
- **Manual:** drag, edge-snap, maximize, minimizar/restaurar, foco, troca de aba, abrir/fechar tudo funcionando.
- Instrumentação do react-scan mantida durante o trabalho; remoção decidida ao final.

## Riscos

- **Props do `Icon` não estáveis** anulam o `memo` — validar que o `Desktop` não recria callbacks/objetos por ícone a cada render.
- **Seletores projetados** que retornam novo array sem `useShallow` reintroduzem re-render — cada um deve usar `useShallow`.
- **Fallback de exit** mal feito pode manter janela "fantasma" — cobrir com verificação manual de fechar durante a animação.
