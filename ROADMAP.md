# devosome — Feature Roadmap

Recursos planejados para o projeto, organizados por categoria e status.

---

## Legenda de status

- ✅ Implementado
- 🚧 Em progresso
- 📋 Planejado
- 💡 Ideia / A avaliar

---

## System Tray & Taskbar

| Recurso | Status | Descrição |
|---|---|---|
| Relógio | ✅ | Exibe dia da semana + hora em tempo real na taskbar |
| Calendário | ✅ | Popover com calendário ao clicar no relógio |
| Clima (Weather) | ✅ | Widget com dados reais via WeatherAPI + geolocalização |
| Tema (Light/Dark/Auto) | ✅ | Seletor de tema no system tray |
| Bateria / Status de Rede | ✅ | `navigator.getBattery()` e `navigator.onLine` — ícones com tooltip no system tray; ocultos se API indisponível |

---

## Janelas / Aplicativos

| Recurso | Status | Descrição |
|---|---|---|
| About Me | ✅ | Bio pessoal |
| Skills | ✅ | Conjunto de habilidades técnicas |
| Portfolio | ✅ | Vitrine de projetos |
| Contact | ✅ | Formulário de contato via Resend |
| Files (Docs, Imagens, Música, Vídeos) | ✅ | Explorador de arquivos simulado com abas |
| Terminal simulado | ✅ | App "Terminal" com comandos (`whoami`, `skills`, `ls projects`, `open <app>`, etc.) integrado ao windows store |
| Clipboard History | ✅ | Janela com links/contatos pré-definidos (email, GitHub, LinkedIn) — clicar copia para o clipboard real via `navigator.clipboard.writeText` |
| Monitor de Sistema | ✅ | Janela mostrando dados reais do browser: memória JS heap (`performance.memory`), uptime da sessão, janelas abertas |
| Configurações do Sistema | ✅ | Centralizar tema, idioma, wallpaper, tamanho de ícones em uma janela "Settings" |
| Gerenciador de Arquivos aprimorado | 📋 | Navegação por pastas, breadcrumb, visualização em grid/lista na janela Files |

---

## Experiência / UX

| Recurso | Status | Descrição |
|---|---|---|
| Notification Center | 📋 | Central de notificações persistente (Zustand store). Cada `toast()` também dispara `addNotification()`. Painel deslizante listando notificações da sessão |
| Barra de Pesquisa (Spotlight) | 📋 | Modal de busca global via atalho (`Ctrl+K` / `Cmd+Space`). Pesquisa entre apps, projetos e skills. `@tanstack/react-hotkeys` já instalado |
| Boot / Login Screen | 📋 | Tela animada de "login" ao carregar a página pela primeira vez antes de revelar o desktop |
| Screen Saver | 📋 | Ativado após X minutos de inatividade (`idle detection`). Usar Three.js (já instalado) para o efeito visual |

---

## Notas de implementação

- **Notification Center:** usar Zustand (`notifications.store.ts`) como fonte de verdade. Não requer localStorage nem React Query. Notificações persistem na sessão (memória).
- **Clipboard History:** não é um clipboard real do sistema (impossível via browser por segurança). É uma lista curada de links/contatos do portfolio.
- **Terminal simulado:** comandos fictícios com respostas pré-definidas, sem execução real. Alto impacto para público dev.
- **Screen Saver:** Three.js já está instalado no projeto — reaproveitar para o efeito.
