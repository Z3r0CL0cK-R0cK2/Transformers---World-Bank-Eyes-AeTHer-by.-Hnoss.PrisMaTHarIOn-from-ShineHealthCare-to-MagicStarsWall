CREATE TYPE public.app_role AS ENUM ('user','partner','admin');

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  display_name TEXT,
  company TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- catalog_items (public)
CREATE TABLE public.catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  vendor TEXT,
  docs_url TEXT,
  install_command TEXT,
  docker_compose TEXT,
  mcp_config JSONB,
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.catalog_items TO anon;
GRANT SELECT ON public.catalog_items TO authenticated;
GRANT ALL ON public.catalog_items TO service_role;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Catalog is public" ON public.catalog_items FOR SELECT TO anon, authenticated USING (true);

-- canvas_nodes
CREATE TABLE public.canvas_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  node_type TEXT NOT NULL DEFAULT 'service',
  status TEXT NOT NULL DEFAULT 'idle',
  tier TEXT NOT NULL DEFAULT 'core',
  note TEXT NOT NULL DEFAULT '',
  links TEXT[] NOT NULL DEFAULT '{}',
  pos_x DOUBLE PRECISION NOT NULL DEFAULT 0,
  pos_y DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.canvas_nodes TO authenticated;
GRANT ALL ON public.canvas_nodes TO service_role;
ALTER TABLE public.canvas_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own nodes" ON public.canvas_nodes FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER canvas_nodes_updated_at BEFORE UPDATE ON public.canvas_nodes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- api_keys
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  revoked BOOLEAN NOT NULL DEFAULT false,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_keys TO authenticated;
GRANT ALL ON public.api_keys TO service_role;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own api keys" ON public.api_keys FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- repositories
CREATE TABLE public.repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  provider TEXT NOT NULL DEFAULT 'github',
  full_name TEXT NOT NULL,
  url TEXT NOT NULL,
  default_branch TEXT NOT NULL DEFAULT 'main',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repositories TO authenticated;
GRANT ALL ON public.repositories TO service_role;
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own repositories" ON public.repositories FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- deployments
CREATE TABLE public.deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  repository_id UUID REFERENCES public.repositories(id) ON DELETE SET NULL,
  environment TEXT NOT NULL DEFAULT 'staging',
  status TEXT NOT NULL DEFAULT 'queued',
  commit_sha TEXT,
  log TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deployments TO authenticated;
GRANT ALL ON public.deployments TO service_role;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own deployments" ON public.deployments FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- partner_applications
CREATE TABLE public.partner_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  website TEXT NOT NULL,
  solution_name TEXT NOT NULL,
  solution_description TEXT NOT NULL,
  repo_url TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  score INTEGER NOT NULL DEFAULT 0,
  checks JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_applications TO authenticated;
GRANT ALL ON public.partner_applications TO service_role;
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own applications" ON public.partner_applications FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER partner_applications_updated_at BEFORE UPDATE ON public.partner_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- badges
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  application_id UUID REFERENCES public.partner_applications(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  label TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.badges TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.badges TO authenticated;
GRANT ALL ON public.badges TO service_role;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges are publicly viewable" ON public.badges FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users insert own badges" ON public.badges FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own badges" ON public.badges FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own badges" ON public.badges FOR DELETE TO authenticated USING (user_id = auth.uid());

-- timeline_events
CREATE TABLE public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  label TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  phase TEXT NOT NULL DEFAULT 'discover',
  severity TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timeline_events TO authenticated;
GRANT ALL ON public.timeline_events TO service_role;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own timeline" ON public.timeline_events FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_canvas_nodes_user ON public.canvas_nodes(user_id);
CREATE INDEX idx_timeline_user ON public.timeline_events(user_id, created_at DESC);
CREATE INDEX idx_deployments_user ON public.deployments(user_id, created_at DESC);

INSERT INTO public.catalog_items (slug, name, kind, category, description, vendor, docs_url, install_command, tech_stack, verified) VALUES
('postgres-mcp','Postgres MCP Server','mcp','data','MCP-Server für direkten, richtliniengesteuerten Zugriff auf Postgres-Datenbanken durch KI-Agenten.','Community','https://modelcontextprotocol.io','npx -y @modelcontextprotocol/server-postgres','{"typescript","postgres","mcp"}',true),
('filesystem-mcp','Filesystem MCP Server','mcp','tooling','Kontrollierter Dateisystem-Zugriff für Agenten mit Sandbox-Pfaden und Read/Write-Scopes.','Community','https://modelcontextprotocol.io','npx -y @modelcontextprotocol/server-filesystem','{"typescript","mcp"}',true),
('stripe-sdk','Stripe SDK','sdk','payments','Offizielles SDK für Zahlungen, Abos und Auszahlungen mit typisierten Clients.','Stripe','https://stripe.com/docs/api','npm i stripe','{"typescript","node","payments"}',true),
('supabase-js','Supabase JS Client','sdk','data','Client für Datenbank, Auth, Storage und Realtime über eine typsichere API.','Supabase','https://supabase.com/docs','npm i @supabase/supabase-js','{"typescript","postgres","realtime"}',true),
('traefik','Traefik Proxy','docker','infrastructure','Cloud-nativer Reverse Proxy mit automatischem TLS und Service Discovery.','Traefik Labs','https://doc.traefik.io/traefik/','docker pull traefik:v3','{"docker","proxy","tls"}',true),
('qdrant','Qdrant Vector DB','docker','data','Vektordatenbank für Embeddings, Retrieval und semantische Suche.','Qdrant','https://qdrant.tech/documentation/','docker pull qdrant/qdrant','{"docker","vector","search"}',true),
('grafana','Grafana','docker','observability','Dashboards und Alerting für Metriken, Logs und Traces.','Grafana Labs','https://grafana.com/docs/','docker pull grafana/grafana','{"docker","observability"}',true),
('keycloak','Keycloak','docker','identity','Identity- und Access-Management mit OIDC, SAML und Federation.','Red Hat','https://www.keycloak.org/documentation','docker pull quay.io/keycloak/keycloak','{"docker","oidc","saml"}',true),
('openapi-gateway','OpenAPI Gateway','api','integration','Deklaratives API-Gateway mit Rate-Limits, Auth-Policies und Observability.','oneclick','https://spec.openapis.org/','npm i @oneclick/gateway','{"typescript","api","gateway"}',false),
('temporal','Temporal','docker','orchestration','Durable Workflows für langlaufende, fehlertolerante Prozesse.','Temporal','https://docs.temporal.io/','docker pull temporalio/auto-setup','{"docker","workflow"}',true),
('minio','MinIO','docker','storage','S3-kompatibler Objektspeicher für selbstgehostete Deployments.','MinIO','https://min.io/docs/','docker pull minio/minio','{"docker","s3","storage"}',true),
('langfuse','Langfuse','docker','observability','Tracing, Evaluation und Kostenkontrolle für LLM-Anwendungen.','Langfuse','https://langfuse.com/docs','docker pull langfuse/langfuse','{"docker","llm","tracing"}',true);