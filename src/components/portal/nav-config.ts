import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  Compass,
  GitBranch,
  Rocket,
  ShieldCheck,
  Terminal,
  KeyRound,
  BookOpen,
  Cpu,
  Award,
  ClipboardCheck,
  Container,
  Server,
  Zap,
  Layers,
  Network,
} from "lucide-react";

export type NavSection = {
  to: string;
  label: string;
  icon: LucideIcon;
  focus: string;
  sub: { label: string; icon: LucideIcon; hash?: string; description: string }[];
};

export const navSections: NavSection[] = [
  {
    to: "/entdecken",
    label: "Discover & Research",
    icon: Compass,
    focus: "Verifizierte Tools, SDKs, Frameworks und Out-of-the-Box-Lösungen durchsuchen.",
    sub: [
      { label: "Kategorien", icon: Layers, hash: "kategorien", description: "Nach Bereich filtern" },
      { label: "Ecosystem Directory", icon: Boxes, hash: "verzeichnis", description: "Alle Einträge" },
      { label: "Tech-Stack-Suche", icon: Terminal, hash: "suche", description: "Nach Stack filtern" },
    ],
  },
  {
    to: "/canvas",
    label: "Infinite Canvas",
    icon: Network,
    focus: "Unendliche Node-Fläche: Partner, Connectoren und Pipelines räumlich verdrahten.",
    sub: [
      { label: "Node-Feld", icon: Network, hash: "feld", description: "Pan, Zoom, Snap" },
      { label: "Verbindungen", icon: GitBranch, hash: "links", description: "Energie-Fluss" },
      { label: "Timeline", icon: Zap, hash: "timeline", description: "Event-Marker" },
    ],
  },
  {
    to: "/start",
    label: "Get Started",
    icon: Zap,
    focus: "Sofortiger Start via OAuth/Passkeys, fertige curl- und docker-compose-Skripte.",
    sub: [
      { label: "One-Click Registrierung", icon: KeyRound, hash: "registrierung", description: "OAuth & Passkeys" },
      { label: "Quick-Install Skripte", icon: Terminal, hash: "skripte", description: "curl | sh" },
      { label: "Docker Templates", icon: Container, hash: "docker", description: "compose.yml" },
    ],
  },
  {
    to: "/developer",
    label: "Developer Hub",
    icon: Cpu,
    focus: "API-Schlüssel, OpenAPI-Referenz und nativer MCP-Support.",
    sub: [
      { label: "API-Schlüssel", icon: KeyRound, hash: "keys", description: "Zero-Trust Token" },
      { label: "SDKs & Frameworks", icon: Boxes, hash: "sdks", description: "Sprachen & Templates" },
      { label: "API-Referenz", icon: BookOpen, hash: "api", description: "Endpunkte & Beispiele" },
      { label: "MCP Tools", icon: Server, hash: "mcp", description: "Kontext-Server" },
    ],
  },
  {
    to: "/partner",
    label: "ISV & Partner",
    icon: ShieldCheck,
    focus: "Partner-Registrierung, Zertifizierung und Badge-Vergabe.",
    sub: [
      { label: "Partner Program", icon: ShieldCheck, hash: "programm", description: "Antrag stellen" },
      { label: "Verification Suite", icon: ClipboardCheck, hash: "verification", description: "Compliance-Checks" },
      { label: "Badge Center", icon: Award, hash: "badges", description: "SVG einbetten" },
    ],
  },
  {
    to: "/deploy",
    label: "Code & Deploy",
    icon: Rocket,
    focus: "Repository-Import, CI/CD-Runner und One-Click Deploy.",
    sub: [
      { label: "Repositories", icon: GitBranch, hash: "repos", description: "GitHub / GitLab" },
      { label: "CI/CD Runner", icon: Server, hash: "runner", description: "Runner-Status" },
      { label: "One-Click Deploy", icon: Rocket, hash: "deploy", description: "Rollout starten" },
    ],
  },
];

export const bootstrapperScript = `curl -fsSL https://get.your-platform.io/install.sh | bash -s -- --with-mcp --with-docker`;
