/**
 * Validiertes Ecosystem-Netzwerk.
 *
 * Alle Einträge sind gegen die offiziellen Unternehmens-Domains geprüft
 * (Firmenname -> echte Primärdomain). Falsche/abweichende Schreibweisen
 * werden über `aliases` abgefangen und auf den kanonischen Eintrag gemappt.
 */

export type PartnerKind =
  | "isv"
  | "technology"
  | "channel"
  | "corporate"
  | "innovation"
  | "mvp"
  | "opensource";

export type EcosystemEntry = {
  slug: string;
  name: string;
  aliases: string[];
  url: string;
  category: string;
  partner: PartnerKind[];
  certified: boolean;
  docs?: string;
  api?: string;
  sdk?: string;
  github?: string;
  mcp?: string;
  docker?: string;
  appimage?: string;
  install?: string;
  partnerPortal?: string;
  contact?: string;
};

export const ecosystem: EcosystemEntry[] = [
  {
    slug: "docker",
    name: "Docker, Inc.",
    aliases: ["docker", "docker inc", "dockerhub"],
    url: "https://www.docker.com",
    category: "Container & Runtime",
    partner: ["technology", "isv", "channel"],
    certified: true,
    docs: "https://docs.docker.com",
    api: "https://docs.docker.com/reference/api/engine/",
    github: "https://github.com/docker",
    mcp: "https://github.com/docker/mcp-gateway",
    docker: "docker pull docker/welcome-to-docker:latest",
    install: "curl -fsSL https://get.docker.com | sh",
    partnerPortal: "https://www.docker.com/partners/",
    contact: "partners@docker.com",
  },
  {
    slug: "github",
    name: "GitHub, Inc.",
    aliases: ["github", "github inc"],
    url: "https://github.com",
    category: "SCM & CI/CD",
    partner: ["technology", "isv", "corporate"],
    certified: true,
    docs: "https://docs.github.com",
    api: "https://docs.github.com/rest",
    sdk: "https://github.com/octokit",
    github: "https://github.com/github",
    mcp: "https://github.com/github/github-mcp-server",
    docker: "docker pull ghcr.io/github/github-mcp-server:latest",
    install: "brew install gh",
    partnerPortal: "https://partner.github.com/",
    contact: "partnerships@github.com",
  },
  {
    slug: "gitlab",
    name: "GitLab Inc.",
    aliases: ["gitlab", "gitlab inc"],
    url: "https://about.gitlab.com",
    category: "SCM & CI/CD",
    partner: ["technology", "channel", "isv"],
    certified: true,
    docs: "https://docs.gitlab.com",
    api: "https://docs.gitlab.com/api/rest/",
    github: "https://github.com/gitlabhq/gitlabhq",
    docker: "docker pull gitlab/gitlab-ee:latest",
    install: "curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ee/script.deb.sh | sudo bash",
    partnerPortal: "https://partners.gitlab.com/",
    contact: "partners@gitlab.com",
  },
  {
    slug: "hashicorp",
    name: "HashiCorp (IBM)",
    aliases: ["hashicorp", "vault", "terraform", "consul", "nomad"],
    url: "https://www.hashicorp.com",
    category: "Secrets & Infrastructure",
    partner: ["technology", "isv"],
    certified: true,
    docs: "https://developer.hashicorp.com",
    api: "https://developer.hashicorp.com/vault/api-docs",
    github: "https://github.com/hashicorp",
    docker: "docker pull hashicorp/vault:latest",
    install: "brew tap hashicorp/tap && brew install hashicorp/tap/vault",
    partnerPortal: "https://www.hashicorp.com/partners",
    contact: "partners@hashicorp.com",
  },
  {
    slug: "cloudflare",
    name: "Cloudflare, Inc.",
    aliases: ["cloudflare", "cf tunnels"],
    url: "https://www.cloudflare.com",
    category: "Edge & Zero Trust",
    partner: ["technology", "channel", "corporate"],
    certified: true,
    docs: "https://developers.cloudflare.com",
    api: "https://developers.cloudflare.com/api/",
    sdk: "https://github.com/cloudflare/cloudflare-typescript",
    github: "https://github.com/cloudflare",
    mcp: "https://github.com/cloudflare/mcp-server-cloudflare",
    docker: "docker pull cloudflare/cloudflared:latest",
    install: "npm i -g wrangler",
    partnerPortal: "https://www.cloudflare.com/partners/",
    contact: "partners@cloudflare.com",
  },
  {
    slug: "supabase",
    name: "Supabase Inc.",
    aliases: ["supabase", "postgres backend"],
    url: "https://supabase.com",
    category: "Datenbank & Auth",
    partner: ["technology", "isv", "innovation"],
    certified: true,
    docs: "https://supabase.com/docs",
    api: "https://supabase.com/docs/guides/api",
    sdk: "https://github.com/supabase/supabase-js",
    github: "https://github.com/supabase",
    mcp: "https://github.com/supabase-community/supabase-mcp",
    docker: "docker pull supabase/postgres:latest",
    install: "npx supabase init",
    partnerPortal: "https://supabase.com/partners",
    contact: "support@supabase.com",
  },
  {
    slug: "grafana",
    name: "Grafana Labs",
    aliases: ["grafana", "grafana labs", "loki", "tempo"],
    url: "https://grafana.com",
    category: "Observability",
    partner: ["technology", "channel"],
    certified: true,
    docs: "https://grafana.com/docs/",
    api: "https://grafana.com/docs/grafana/latest/developers/http_api/",
    github: "https://github.com/grafana",
    mcp: "https://github.com/grafana/mcp-grafana",
    docker: "docker pull grafana/grafana:latest",
    install: "helm repo add grafana https://grafana.github.io/helm-charts",
    partnerPortal: "https://grafana.com/partners/",
    contact: "partners@grafana.com",
  },
  {
    slug: "prometheus",
    name: "Prometheus (CNCF)",
    aliases: ["prometheus", "prom"],
    url: "https://prometheus.io",
    category: "Metrics & Alerting",
    partner: ["opensource", "technology"],
    certified: true,
    docs: "https://prometheus.io/docs/",
    api: "https://prometheus.io/docs/prometheus/latest/querying/api/",
    github: "https://github.com/prometheus/prometheus",
    docker: "docker pull prom/prometheus:latest",
    install: "helm repo add prometheus-community https://prometheus-community.github.io/helm-charts",
    contact: "prometheus-users@googlegroups.com",
  },
  {
    slug: "opentelemetry",
    name: "OpenTelemetry (CNCF)",
    aliases: ["opentelemetry", "otel"],
    url: "https://opentelemetry.io",
    category: "Telemetry Standard",
    partner: ["opensource", "technology"],
    certified: true,
    docs: "https://opentelemetry.io/docs/",
    sdk: "https://github.com/open-telemetry/opentelemetry-js",
    github: "https://github.com/open-telemetry",
    docker: "docker pull otel/opentelemetry-collector-contrib:latest",
    install: "npm i @opentelemetry/sdk-node",
    contact: "cncf-opentelemetry-community@lists.cncf.io",
  },
  {
    slug: "qdrant",
    name: "Qdrant",
    aliases: ["qdrant", "vector db"],
    url: "https://qdrant.tech",
    category: "Vector Database",
    partner: ["technology", "innovation", "isv"],
    certified: true,
    docs: "https://qdrant.tech/documentation/",
    api: "https://api.qdrant.tech/",
    sdk: "https://github.com/qdrant/qdrant-js",
    github: "https://github.com/qdrant/qdrant",
    mcp: "https://github.com/qdrant/mcp-server-qdrant",
    docker: "docker pull qdrant/qdrant:latest",
    install: "pip install qdrant-client",
    partnerPortal: "https://qdrant.tech/partners/",
    contact: "info@qdrant.com",
  },
  {
    slug: "huggingface",
    name: "Hugging Face",
    aliases: ["hugging face", "huggingface", "hf hub"],
    url: "https://huggingface.co",
    category: "AI Models & Hub",
    partner: ["technology", "innovation", "mvp"],
    certified: true,
    docs: "https://huggingface.co/docs",
    api: "https://huggingface.co/docs/api-inference",
    sdk: "https://github.com/huggingface/huggingface.js",
    github: "https://github.com/huggingface",
    mcp: "https://github.com/evalstate/hf-mcp-server",
    docker: "docker pull huggingface/transformers-pytorch-gpu:latest",
    install: "pip install huggingface_hub",
    contact: "partnerships@huggingface.co",
  },
  {
    slug: "traefik",
    name: "Traefik Labs",
    aliases: ["traefik", "traefik labs", "traefik proxy"],
    url: "https://traefik.io",
    category: "Edge Router",
    partner: ["technology", "isv"],
    certified: true,
    docs: "https://doc.traefik.io/traefik/",
    api: "https://doc.traefik.io/traefik/operations/api/",
    github: "https://github.com/traefik/traefik",
    docker: "docker pull traefik:v3.3",
    install: "helm repo add traefik https://traefik.github.io/charts",
    partnerPortal: "https://traefik.io/partners/",
    contact: "partners@traefik.io",
  },
  {
    slug: "elastic",
    name: "Elastic N.V.",
    aliases: ["elastic", "elasticsearch", "elastic nv"],
    url: "https://www.elastic.co",
    category: "Search & Log Analytics",
    partner: ["technology", "channel", "corporate"],
    certified: true,
    docs: "https://www.elastic.co/docs",
    api: "https://www.elastic.co/docs/api/",
    github: "https://github.com/elastic",
    mcp: "https://github.com/elastic/mcp-server-elasticsearch",
    docker: "docker pull docker.elastic.co/elasticsearch/elasticsearch:8.17.0",
    install: "helm repo add elastic https://helm.elastic.co",
    partnerPortal: "https://www.elastic.co/partners",
    contact: "partners@elastic.co",
  },
  {
    slug: "sentry",
    name: "Sentry (Functional Software, Inc.)",
    aliases: ["sentry", "getsentry"],
    url: "https://sentry.io",
    category: "Error Tracking",
    partner: ["technology", "isv"],
    certified: true,
    docs: "https://docs.sentry.io",
    api: "https://docs.sentry.io/api/",
    sdk: "https://github.com/getsentry/sentry-javascript",
    github: "https://github.com/getsentry",
    mcp: "https://github.com/getsentry/sentry-mcp",
    docker: "docker pull getsentry/sentry:latest",
    install: "npm i @sentry/node",
    partnerPortal: "https://sentry.io/partners/",
    contact: "partners@sentry.io",
  },
  {
    slug: "auth0",
    name: "Auth0 by Okta",
    aliases: ["auth0", "okta", "auth zero"],
    url: "https://auth0.com",
    category: "Identity & Access",
    partner: ["technology", "isv", "corporate"],
    certified: true,
    docs: "https://auth0.com/docs",
    api: "https://auth0.com/docs/api/management/v2",
    sdk: "https://github.com/auth0/node-auth0",
    github: "https://github.com/auth0",
    docker: "docker pull auth0/auth0-cli:latest",
    install: "npm i auth0",
    partnerPortal: "https://auth0.com/partners",
    contact: "partners@auth0.com",
  },
  {
    slug: "keycloak",
    name: "Keycloak (CNCF / Red Hat)",
    aliases: ["keycloak", "red hat sso"],
    url: "https://www.keycloak.org",
    category: "Open Source IAM",
    partner: ["opensource", "technology"],
    certified: true,
    docs: "https://www.keycloak.org/documentation",
    api: "https://www.keycloak.org/docs-api/latest/rest-api/",
    github: "https://github.com/keycloak/keycloak",
    docker: "docker pull quay.io/keycloak/keycloak:latest",
    install: "helm repo add codecentric https://codecentric.github.io/helm-charts",
    contact: "keycloak-user@lists.jboss.org",
  },
  {
    slug: "argo-cd",
    name: "Argo CD (CNCF)",
    aliases: ["argo", "argocd", "argo cd", "argoproj"],
    url: "https://argo-cd.readthedocs.io",
    category: "GitOps Delivery",
    partner: ["opensource", "technology"],
    certified: true,
    docs: "https://argo-cd.readthedocs.io",
    github: "https://github.com/argoproj/argo-cd",
    docker: "docker pull quay.io/argoproj/argocd:latest",
    install:
      "kubectl create ns argocd && kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml",
    contact: "cncf-argo-maintainers@lists.cncf.io",
  },
  {
    slug: "minio",
    name: "MinIO, Inc.",
    aliases: ["minio", "min.io"],
    url: "https://min.io",
    category: "Object Storage",
    partner: ["technology", "isv", "channel"],
    certified: true,
    docs: "https://min.io/docs/minio/linux/index.html",
    sdk: "https://github.com/minio/minio-js",
    github: "https://github.com/minio/minio",
    docker: "docker pull quay.io/minio/minio:latest",
    install: "curl -O https://dl.min.io/client/mc/release/linux-amd64/mc && chmod +x mc",
    partnerPortal: "https://min.io/partners",
    contact: "hello@min.io",
  },
  {
    slug: "appimage",
    name: "AppImage Project",
    aliases: ["appimage", "appimagekit"],
    url: "https://appimage.org",
    category: "Portable Packaging",
    partner: ["opensource"],
    certified: true,
    docs: "https://docs.appimage.org",
    github: "https://github.com/AppImage",
    appimage:
      "chmod +x App-x86_64.AppImage && ./App-x86_64.AppImage --appimage-extract-and-run",
    install: "wget -c https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-x86_64.AppImage",
    contact: "info@appimage.org",
  },
  {
    slug: "anthropic-mcp",
    name: "Model Context Protocol (Anthropic)",
    aliases: ["mcp", "model context protocol", "anthropic mcp"],
    url: "https://modelcontextprotocol.io",
    category: "MCP Standard",
    partner: ["opensource", "technology", "innovation"],
    certified: true,
    docs: "https://modelcontextprotocol.io/docs",
    sdk: "https://github.com/modelcontextprotocol/typescript-sdk",
    github: "https://github.com/modelcontextprotocol",
    mcp: "https://github.com/modelcontextprotocol/servers",
    install: "npx -y @modelcontextprotocol/server-filesystem /workspace",
    contact: "support@anthropic.com",
  },
];

export const partnerLabels: Record<PartnerKind, string> = {
  isv: "ISV Partner",
  technology: "Technology Partner",
  channel: "Channel Partner",
  corporate: "Corporate Partner",
  innovation: "Innovation Partner",
  mvp: "MVP Partner",
  opensource: "Open Source Foundation",
};

/** Kanonischen Eintrag zu einem (evtl. falsch geschriebenen) Namen oder einer URL finden. */
export function resolveEntry(input: string): EcosystemEntry | null {
  const q = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "");
  if (!q) return null;
  return (
    ecosystem.find(
      (e) =>
        e.slug === q ||
        e.name.toLowerCase() === q ||
        e.url.toLowerCase().includes(q) ||
        e.aliases.some((a) => a === q),
    ) ??
    ecosystem.find(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.aliases.some((a) => a.includes(q) || q.includes(a)),
    ) ??
    null
  );
}

export const allContacts = ecosystem
  .map((e) => e.contact)
  .filter((c): c is string => Boolean(c));
