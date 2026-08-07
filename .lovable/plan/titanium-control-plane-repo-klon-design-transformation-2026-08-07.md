# Titanium Control Plane — Repo-Klon + Design-Transformation

Ziel: Das GitHub-Projekt `unified-dev-hub-edb9c236` 1:1 in dieses Projekt übernehmen und die Startseite/Shell auf das Design aus dem Screenshot umbauen (dunkles Cyberpunk-Titan-Glas, Magenta-Akzent, Glow- und Lichteffekte).

## 1. Repo 1:1 übernehmen

Der Quell-Repo ist bereits ein TanStack-Start-Projekt derselben Bauart wie dieses hier, also wird der Code direkt übernommen:

- `src/components/portal/*` (Blueprint-Background, Node-Canvas, Top-Bar, Code-Block, Context-Sidebar, Timeline-Engine, Nav-Config)
- `src/components/ui/*` (shadcn-Set)
- `src/routes/*`: `index`, `auth`, `entdecken`, `start` und der geschützte Bereich `_authenticated/` (canvas, developer, partner, deploy)
- `src/hooks/*`, `src/lib/*` (portal.functions, timeline), `src/styles.css` (Titanium Design System), `src/start.ts`, `src/server.ts`, `vite.config.ts`, `components.json`
- Fehlende Pakete aus der Repo-`package.json` werden nachinstalliert.

Nicht übernommen: `.git`, `.env`, `.lovable/*`, Lockfiles des Fremdprojekts — die Zugangsdaten des Ursprungsprojekts funktionieren hier nicht.

## 2. Backend aktivieren

Die geschützten Routen und der Login laufen über Login/Datenbank. Dafür wird Lovable Cloud in diesem Projekt aktiviert und der Auth-Teil (Registrierung, Login, geschützter Bereich) frisch verdrahtet. Das Repo bringt keine Datenbank-Migrationen mit; benötigte Tabellen (Profile/Rollen) werden neu angelegt, sobald sie eine Seite tatsächlich braucht.

## 3. Design-Transformation nach Screenshot

Composition und Effekte der Startseite werden auf das Bild gezogen:

- **Top-Bar**: Logo-Kachel „1C“ mit Glow, Wortmarke ONECLICK / TITANIUM CONTROL PLANE, zentrale Suchleiste mit ⌘K-Chip, rechts Motion-Level-Umschalter und Magenta-„Anmelden“-Button.
- **Zweite Navigationszeile**: sieben Einträge mit Icons (Discover & Research, Infinite Canvas, Get Started, Developer Hub, ISV & Partner, Code & Deploy).
- **Hero**: zentriert statt linksbündig. Zweizeilige Headline „Der gesamte Lifecycle. In einer Oberfläche.“, darunter die Gradient-Zeile „Von der Recherche bis zum Deployment.“ (Blau → Magenta). Verdichtete Subline. Zwei CTAs: „In 30 Sekunden starten →“ (Magenta) und „Ökosystem entdecken“ (Glas-Outline).
- **Terminal-Karte**: Glas-Panel mit Kopfzeile „ONE-CLICK BOOTSTRAP“, Live-Status rechts („Ready · MCP synced“), Zeilennummern, Magenta-Highlight für `--with-mcp` / `--with-docker`, Copy-Button, Fußzeile „Self-hosted · MCP ready · Docker ready“, deutlicher Abstand zum CTA.
- **Status-Nodes**: schwebende Glas-Kacheln links/rechts (API Gateway, MCP Server, Vector DB, K8S Cluster, AI Agent, Deployment) mit Status-Punkt, verbunden durch das animierte Leitungs-Raster im Hintergrund.
- **Sektions-Leiste unten**: horizontale Kachelreihe mit Icons und aktiver, blau leuchtender Kachel.

## 4. Effekte / Design-Tokens

Alle Werte als Tokens in `src/styles.css`, keine hartkodierten Farben in Komponenten:

- Tiefdunkler Blau-Schwarz-Verlauf als Grund, feines Blueprint-Raster mit animierten Leitungspfaden und wandernden Impulsen.
- Titan-Glas: Backdrop-Blur, Prismenkante, Specular-Sweep über die Panels.
- Magenta/Cyan-Glows für Buttons, Badges, aktive Zustände; Hover mit leichtem 3D-Tilt und Neon-Trace.
- Motion-Level-Umschalter (Vol0–Vol2) respektiert `prefers-reduced-motion`.

## 5. Technisches

- Routen bleiben TanStack-Datei-Routen; `src/routes/index.tsx` ist die Startseite.
- Head-Metadaten pro Route (Titel, Description, OG/Twitter).
- Nach dem Umbau: Build/Typecheck und ein visueller Check der Startseite gegen den Screenshot.
