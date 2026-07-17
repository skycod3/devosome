# Design — Decompor o `Desktop` (god component) para cortar cascateamento de re-render

**Data:** 2026-07-09
**Escopo:** quebrar `src/components/layout/desktop.tsx` em componentes focados; `Desktop` vira uma casca de layout sem estado/subscription.
**Fora de escopo:** `WindowsDropdown` fix e zIndex do `bringToFront` (rodada futura).

## Problema

`Desktop` é um god component: assina 8 fontes (`useDesktopIconIds`, `useWindowIds`, `useIsMobile`, `useSettings` → wallpaper/iconVisibility, `useReducedMotion`, estado `spotlightOpen`, estado `desktopRect`) **e** renderiza a casca inteira (Wallpaper/shader, Taskbar, grid de ícones, Dock, SnapPreview, janelas, Spotlight). Qualquer uma dessas mudanças re-renderiza o `Desktop` e cascateia para todo filho não-memoizado.

Observado (react-scan, live): abrir qualquer janela, mudar configurações (wallpaper) e abrir o Spotlight re-renderizam `Dock` e `Taskbar`. Memoizar `Window` e `Icon` cortou parte, mas `Dock`/`Taskbar`/`SnapPreview` seguem cascateando.

Memoizar filho por filho trata o sintoma e é frágil. A correção de raiz é o mesmo princípio das stores (subscription estreita) aplicado à árvore: cada região da casca assina só o que precisa e re-renderiza sozinha.

## Objetivos

- `Desktop` sem estado (exceto um `ref`) nem subscription → **nunca re-renderiza depois do mount**.
- Abrir/fechar janela re-renderiza só o `WindowLayer` (+ a janela nova); mudar wallpaper só o `Wallpaper`; Ctrl+K só o `SpotlightLauncher`; destacar ícone só os 2 ícones (+ sidebar, já feito).
- Comportamento 100% preservado (drag/snap, drag constraints via `desktopRect`, deselect por clique no fundo, Ctrl+K, som de clique, notificações welcome/tips, foco retornando ao `.desktop-area` ao fechar janela).
- Não memoizar `Dock`/`Taskbar` — a decomposição os torna desnecessários.

### Não-objetivos

- Remover os memos de `Window`/`Icon` — eles guardam re-render de **container de lista** (WindowLayer/IconGrid re-renderizam ao mudar a lista) e permanecem corretos.

## Design

### 1. Fronteiras — 5 componentes novos + casca fina

| Componente          | Arquivo                                        | Assina / possui                                                                                      | Renderiza                                                                            |
| ------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `Wallpaper`         | `src/components/layout/wallpaper.tsx`          | `useSettings().wallpaper`, `useIsMobile`, `useReducedMotion`, `useIconActions().unhighlightAllIcons` | fundo (`bg-cover bg-top` + backgroundImage) + overlay de deselect + `GridDistortion` |
| `IconGrid`          | `src/components/layout/icon-grid.tsx`          | `useDesktopIconIds`, `useIconActions().setIcons`, `useSettings().iconVisibility`                     | grid `iconIds.map(<Icon id>)` + effect de seed (mount-only)                          |
| `WindowLayer`       | `src/components/window/window-layer.tsx`       | `useWindowIds`, estado `desktopRect` + `ResizeObserver`                                              | `<AnimatePresence>{windowIds.map(<Window id desktopRect>)}</AnimatePresence>`        |
| `SpotlightLauncher` | `src/components/layout/spotlight-launcher.tsx` | estado `spotlightOpen` + effect Ctrl+K                                                               | `{spotlightOpen && <Spotlight onClose/>}`                                            |
| `DesktopEffects`    | `src/components/layout/desktop-effects.tsx`    | `useSounds`, `useNotify`, `useIsMobile`                                                              | `null` (só effects mount-only: som de clique + notificações welcome/tips)            |

`Desktop` fino:

```tsx
export function Desktop() {
  const desktopRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={desktopRef}
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

Sem estado (só o `ref`, que não causa re-render) nem subscription → `Desktop` não re-renderiza depois do mount, então Taskbar/Dock/IconGrid/Wallpaper não cascateiam.

### 2. Detalhes de fluxo

- **`desktopRect`:** medido do root (`.desktop-area`, viewport inteiro); as janelas são `position:absolute` dentro dele. O `Desktop` cria `desktopRef`, coloca no root e passa `containerRef={desktopRef}` para o `WindowLayer`, que roda o `ResizeObserver` em `containerRef.current` e guarda o `desktopRect` no próprio estado. **Resize re-renderiza só o `WindowLayer`.** O `AnimatePresence` não adiciona nó DOM, então as janelas continuam posicionadas relativas ao root (`relative`).
- **Wallpaper / layering:** a `backgroundImage` sai do root e vai para um `<div className="absolute inset-0 bg-cover bg-top" style={{ backgroundImage }} />` dentro do `Wallpaper` (atrás de tudo), junto do overlay de deselect (`!isMobile && <div className="absolute inset-0" onClick={unhighlightAllIcons}>`) e do shader (`!prefersReducedMotion`). O `.desktop-area` / `tabIndex` / `outline-none` ficam no root.
- **Deselect:** preservado — clicar no vazio bate no overlay do `Wallpaper`; clicar num ícone é barrado pelo `stopPropagation` do `Icon`.
- **Seed de ícones:** o effect mount-only vai para o `IconGrid` (lê `iconVisibility` no seed; depois disso, mudanças de visibilidade refletem via `useDesktopIconIds`).
- **`DesktopEffects`:** concentra os effects mount-only (listeners de som em `document`; notificações welcome/tips com o gate `isMobile` para o tips). Retorna `null`. Mantê-los fora do `Desktop` evita que ele assine `useSounds`/`useNotify`/`useIsMobile`.

### 3. Ordem de menor risco (para o plano)

1. `SpotlightLauncher` (isola `spotlightOpen` — mudança pequena e independente).
2. `DesktopEffects` (move effects mount-only — sem render).
3. `Wallpaper` (move background/overlay/shader).
4. `IconGrid` (move grid + seed).
5. `WindowLayer` (move janelas + `desktopRect`/ResizeObserver — o mais delicado, por causa do drag constraints).
6. `Desktop` vira a casca fina; remover imports/hooks órfãos.

Cada passo mantém o app compilando e funcional; o `Desktop` encolhe gradualmente.

## Verificação

- **react-scan (gate), com 2+ janelas abertas:**
  - Abrir janela → `WindowLayer` + a nova janela; `Taskbar` só pela contagem `Windows (N)`; `Dock`/`IconGrid`/`Wallpaper`/janelas existentes: **0**.
  - Mudar wallpaper → só `Wallpaper`.
  - Ctrl+K → só `SpotlightLauncher`.
  - Destacar ícone → só os 2 ícones (+ sidebar), como já está.
  - Em todas: `Desktop` **ausente** do relatório.
- **Testes:** suíte existente verde (mudança é de composição/subscription). Testes unitários novos só se algum componente ganhar lógica isolável testável.
- **Manual:** abrir/fechar/arrastar/snap/maximizar/minimizar janela, drag constraints corretos, deselect por clique no fundo, Ctrl+K, troca de wallpaper, mostrar/ocultar ícones (system-settings), som de clique, notificações welcome/tips, foco retornando ao desktop ao fechar janela, mobile (sem shader).

## Riscos

- **`WindowLayer` + `desktopRect`:** o `ResizeObserver` precisa medir o root via `containerRef` passado pelo `Desktop`. Se o ref não estiver conectado no primeiro effect, medir no mount cobre (igual ao código atual). Verificar drag constraints após a mudança.
- **Layering do `Wallpaper`:** o overlay de deselect e o shader precisam ficar atrás dos ícones (`z-1`) e das janelas (z alto), como hoje. Conferir que o fundo não captura cliques destinados a ícones/janelas (o `stopPropagation` do `Icon` cobre os ícones; janelas têm z maior).
- **Effects mount-only movidos:** garantir que rodam uma vez (deps vazias preservadas) e que o gate `isMobile` do tips continua.
