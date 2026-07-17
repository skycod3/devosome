# Design — Corrigir fan-out de re-render do icons-store

**Data:** 2026-07-09
**Escopo:** fatiar o acesso ao `icons-store` (espelhando o refactor já feito no `windows-store`).
**Fora de escopo:** resíduos do windows (fix do `WindowsDropdown`, `memo` no `Window`) — ficam para rodada futura.

## Problema

O `icons-store` tem o **mesmo padrão grosseiro** que o `windows-store` tinha antes do refactor:

- [`useIcons()`](../../../src/hooks/useIcons.ts) assina o **array `icons` inteiro** — inclusive para quem só quer actions (o `Icon` pede só `highlightIcon`/`unhighlightAllIcons`, mas o hook já assina `icons`).
- `highlightIcon`/`unhighlightAllIcons` → `updateIcon`/`updateAllIcons` fazem `icons.map(...)`, **trocando o array todo** ([icons-store.ts](../../../src/stores/icons-store.ts)).

Então clicar/destacar um ícone (que chama `highlightIcon` + `unhighlightAllIcons`) troca o array e:

- **`Desktop`** (usa `{ icons }`) re-renderiza → cascateia para **Taskbar, Dock, grid de ícones, todas as Windows, Spotlight** (filhos, nenhum memoizado exceto `Icon`).
- **6 consumidores** assinam `icons` direto e re-renderizam sozinhos: `window-header`, o `TabbedWindow` do Files (`icons.find(isHighlighted)`), `file-browser`, `image-viewer`, `system-settings`, e o próprio `Icon`.

Medição observada (react-scan, live): clicar um ícone re-renderiza DockIcons, elementos da Taskbar e, dentro do Files, praticamente toda a subárvore.

Nota: o `<Icon>` (desktop) é renderizado em exatamente 2 lugares — o grid do `Desktop` e o grid do `file-browser` — e **ambos são store-backed** (o file-browser injeta os arquivos da pasta no store via `addIcon` e lê filtrando por `parentId`). O `<Icon>` de `battery.tsx` é outro componente (lucide) e não conta.

## Objetivos

- Clicar/destacar um ícone deve re-renderizar **apenas os ícones envolvidos** (o que ganha e o que perde destaque) e o sidebar do Files (se aberto).
- `Desktop`, `Dock`, `Taskbar` e janelas não relacionadas **não** re-renderizam em highlight.
- Comportamento inalterado (destacar/deselecionar, abrir por duplo-clique/Enter, sidebar refletindo o destaque, visibilidade de ícones).
- Lógica do store preservada, exceto um early-return de otimização em `unhighlightAllIcons`/`unhighlightIcon` (sem mudança observável).

### Não-objetivos

- `WindowsDropdown` e `memo` no `Window` (resíduos do windows) — rodada futura.
- Narrowizar os painéis de baixa frequência ao máximo — eles usam um hook amplo (decisão do usuário).

## Design

### 1. Fatiar o acesso ao icons-store

Substituir o `useIcons()` monolítico por hooks focados (deletando `useIcons()` após migrar todos):

- **`useIconActions()`** — só actions (`setIcons`, `addIcon`, `removeIcon`, `showIcon`, `hideIcon`, `showAllIcons`, `hideAllIcons`, `highlightIcon`, `unhighlightIcon`, `highlightAllIcons`, `unhighlightAllIcons`). Refs estáveis, sem assinar `icons`.
- **`useIcon(id)`** — a fatia de um ícone: `useIconsStore((s) => s.icons.find((i) => i.id === id))`.
- **`useDesktopIconIds()`** — `useShallow` dos ids de ícones de desktop visíveis: `s.icons.filter((i) => !i.parentId && i.show).map((i) => i.id)`.
- **`useIconIdsByParent(parentId)`** — `useShallow` dos ids de uma pasta: `s.icons.filter((i) => i.parentId === parentId).map((i) => i.id)`.
- **`useHighlightedIcon()`** — `s.icons.find((i) => i.isHighlighted)` (objeto único; `Object.is` basta, sem `useShallow`).
- **`useIconList()`** — array completo `s.icons` (amplo), só para os painéis de baixa frequência.

Arquivos: criar `src/hooks/useIconActions.ts` e `src/hooks/useIconSelectors.ts` (com `useIcon`, `useDesktopIconIds`, `useIconIdsByParent`, `useHighlightedIcon`, `useIconList`), mais testes. Remover `src/hooks/useIcons.ts`.

### 2. Ajuste no store

`unhighlightAllIcons` e `unhighlightIcon` passam a fazer **early-return quando nada muda** (nenhum ícone destacado / o ícone alvo já não está destacado), evitando a troca desnecessária do array.

Isso habilita `Desktop.handleDesktopClick` e `FileBrowser.handleAreaClick` a chamarem `unhighlightAllIcons()` **incondicionalmente** — sem ler `icons.some((i) => i.isHighlighted)`. Consequência: o `Desktop` deixa de assinar o array `icons` (passa a assinar só `useDesktopIconIds()`), então **não re-renderiza em highlight** — matando o cascateamento para Taskbar/Dock/Windows.

### 3. Migração dos componentes

| Componente                                                                              | Antes                                                                                    | Depois                                                                                                                   |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Icon` ([icon.tsx](../../../src/components/icon.tsx))                                   | recebe `{...icon}` (spread) + `useIcons()` p/ actions                                    | recebe `{ id, imagePlaceholder? }`; lê `useIcon(id)`; actions via `useIconActions()`; mantém `memo`                      |
| `Desktop` ([desktop.tsx](../../../src/components/layout/desktop.tsx))                   | `{ icons, setIcons, unhighlightAllIcons }` + `<Icon {...icon}/>` + `some(isHighlighted)` | `useDesktopIconIds()` → `<Icon id={id}/>`; `useIconActions()`; `handleDesktopClick` chama `unhighlightAllIcons()` direto |
| `file-browser` ([file-browser.tsx](../../../src/components/layout/file-browser.tsx))    | `{ icons, addIcon, removeIcon, unhighlightAllIcons }` + filter parentId                  | `useIconIdsByParent(iconId)` → `<Icon id={id}/>`; `useIconActions()`; `handleAreaClick` direto                           |
| `TabbedWindow` ([window/index.tsx](../../../src/components/window/index.tsx))           | `icons.find(isHighlighted)`                                                              | `useHighlightedIcon()` + `useIconActions().unhighlightAllIcons`                                                          |
| `window-header` ([window-header.tsx](../../../src/components/window/window-header.tsx)) | `icons.find((i) => i.id === parentId)`                                                   | `useIcon(window.parentId)`                                                                                               |
| `image-viewer` ([image-viewer.tsx](../../../src/components/image-viewer.tsx))           | `{ icons }` (sibling filter)                                                             | `useIconList()` (amplo)                                                                                                  |
| `system-settings` ([system-settings.tsx](../../../src/components/system-settings.tsx))  | `{ icons, showIcon, hideIcon }`                                                          | `useIconList()` + `useIconActions()`                                                                                     |

**Detalhe a verificar no plano:** se o grid do file-browser estiver dentro de `AnimatePresence` (exit animation ao remover ícone), o `Icon` precisa do mesmo fallback de "último valor" (`useState` no corpo do render) do `Window`. O grid do desktop é um `div` simples (sem AnimatePresence). Verificar o file-browser; se não houver exit animation, o `Icon` dispensa fallback.

**`Icon` com `id`:** o `Desktop`/`file-browser` só montam `<Icon id>` para ids presentes no store (vindos de `useDesktopIconIds`/`useIconIdsByParent`, mesmo snapshot), então `useIcon(id)` está sempre definido no primeiro render — igual ao `Window`.

## Comportamento esperado após a correção

- **Clicar ícone (desktop/pasta)** → re-renderiza só os 2 ícones (destaca + desdestaca) e o sidebar do Files se aberto. Desktop/Dock/Taskbar/outras janelas quietos.
- **Deselecionar (clicar no fundo)** → `unhighlightAllIcons()` (no-op se nada destacado).
- **Abrir/visibilidade/registro de arquivos** → inalterados.

## Verificação

- **react-scan (gate):** clicar ícone do desktop e do file-explorer. Alvo: `Desktop`, `Dock`, `Taskbar` e janelas não relacionadas **somem** do relatório; sobram os 2 ícones (+ sidebar do Files).
- **Testes:** novos hooks com teste de render-count (padrão do windows) + suíte existente verde; se `unhighlightAllIcons` mudar, cobrir o early-return.
- **Manual:** destacar/deselecionar (desktop e pasta), abrir por duplo-clique/Enter, sidebar do Files refletindo o destaque, mostrar/ocultar ícones no system-settings.

## Riscos

- **`Icon` id-based** sem fallback quebra a exit animation **se** o file-browser usar `AnimatePresence` — mitigado verificando no plano e aplicando o fallback do `Window` se necessário.
- **`useHighlightedIcon`** retornando novo objeto quebraria a estabilidade — mas `find` retorna a referência do próprio ícone (estável via `Object.is`), sem `useShallow`.
- **Seletores filtrados** (`useDesktopIconIds`, `useIconIdsByParent`) devem usar `useShallow` (retornam array novo) — senão reintroduzem re-render/loop.
- **Early-return no store** deve preservar o resultado idêntico (todos desdestacados) — só pula a troca de array quando nada muda.
