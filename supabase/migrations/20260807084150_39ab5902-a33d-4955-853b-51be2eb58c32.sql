CREATE TABLE public.blueprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] NOT NULL DEFAULT '{}',
  accent TEXT NOT NULL DEFAULT 'vivid',
  node_count INTEGER NOT NULL DEFAULT 0,
  edge_count INTEGER NOT NULL DEFAULT 0,
  graph JSONB NOT NULL DEFAULT '{"nodes":[],"edges":[]}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blueprints TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blueprints TO authenticated;
GRANT ALL ON public.blueprints TO service_role;

ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public blueprints are viewable by everyone"
  ON public.blueprints FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view their own blueprints"
  ON public.blueprints FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own blueprints"
  ON public.blueprints FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blueprints"
  ON public.blueprints FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blueprints"
  ON public.blueprints FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER blueprints_updated_at
  BEFORE UPDATE ON public.blueprints
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX blueprints_public_idx ON public.blueprints (is_public, created_at DESC);

INSERT INTO public.blueprints (slug, name, summary, category, tags, accent, node_count, edge_count, graph) VALUES
('mcp-gateway-mesh', 'MCP Gateway Mesh', 'Zentraler MCP-Router mit Tool-Registry, Auth-Proxy und Rate-Limiting für KI-Agenten.', 'mcp', ARRAY['mcp','gateway','agents'], 'vivid', 7, 9,
 '{"nodes":[{"id":"gw","label":"MCP Gateway","x":50,"y":18},{"id":"reg","label":"Tool Registry","x":18,"y":45},{"id":"auth","label":"Auth Proxy","x":82,"y":45},{"id":"agent","label":"AI Agent","x":50,"y":72},{"id":"log","label":"Audit Log","x":18,"y":78},{"id":"rl","label":"Rate Limiter","x":82,"y":78},{"id":"db","label":"Vector DB","x":50,"y":95}],"edges":[["gw","reg"],["gw","auth"],["gw","agent"],["auth","rl"],["agent","db"],["reg","log"]]}'::jsonb),
('docker-edge-stack', 'Docker Edge Stack', 'Traefik, Registry und Compose-Templates für ein sofort lauffähiges Edge-Deployment.', 'infra', ARRAY['docker','traefik','edge'], 'cyber', 6, 7,
 '{"nodes":[{"id":"tr","label":"Traefik","x":50,"y":16},{"id":"reg","label":"Registry","x":20,"y":44},{"id":"api","label":"API Service","x":80,"y":44},{"id":"web","label":"Web App","x":50,"y":68},{"id":"cache","label":"Redis","x":20,"y":86},{"id":"pg","label":"Postgres","x":80,"y":86}],"edges":[["tr","api"],["tr","web"],["reg","api"],["api","pg"],["api","cache"],["web","api"]]}'::jsonb),
('isv-certification-flow', 'ISV Certification Flow', 'Antrag, Compliance-Checks, Review-Gate und automatische Badge-Vergabe in einer Pipeline.', 'partner', ARRAY['isv','compliance','badge'], 'success', 5, 5,
 '{"nodes":[{"id":"app","label":"Antrag","x":50,"y":14},{"id":"scan","label":"Compliance Scan","x":50,"y":38},{"id":"rev","label":"Review Gate","x":50,"y":62},{"id":"badge","label":"Badge Issuer","x":30,"y":88},{"id":"notify","label":"Notify","x":70,"y":88}],"edges":[["app","scan"],["scan","rev"],["rev","badge"],["rev","notify"],["badge","notify"]]}'::jsonb),
('ai-agent-pipeline', 'AI Agent Pipeline', 'Retrieval, Tool-Calling und Guardrails für produktive Agenten-Workloads.', 'ai', ARRAY['ai','rag','guardrails'], 'vivid', 6, 6,
 '{"nodes":[{"id":"in","label":"Prompt Input","x":50,"y":12},{"id":"rag","label":"Retriever","x":22,"y":40},{"id":"llm","label":"LLM Router","x":50,"y":44},{"id":"tools","label":"Tool Calls","x":78,"y":40},{"id":"guard","label":"Guardrails","x":50,"y":72},{"id":"out","label":"Response","x":50,"y":93}],"edges":[["in","llm"],["rag","llm"],["llm","tools"],["llm","guard"],["guard","out"],["tools","guard"]]}'::jsonb),
('zero-trust-api', 'Zero-Trust API Layer', 'Token-Issuer, Policy-Engine und Scope-Enforcement vor jedem Service-Call.', 'security', ARRAY['zero-trust','api','policy'], 'eu', 5, 5,
 '{"nodes":[{"id":"cli","label":"Client","x":50,"y":12},{"id":"tok","label":"Token Issuer","x":22,"y":42},{"id":"pol","label":"Policy Engine","x":78,"y":42},{"id":"gw","label":"API Gateway","x":50,"y":66},{"id":"svc","label":"Services","x":50,"y":92}],"edges":[["cli","tok"],["tok","gw"],["pol","gw"],["gw","svc"],["cli","pol"]]}'::jsonb),
('multi-region-deploy', 'Multi-Region Deploy', 'CI/CD-Runner mit Canary-Rollout über drei Regionen und automatischem Rollback.', 'deploy', ARRAY['ci-cd','canary','rollback'], 'cyber', 6, 7,
 '{"nodes":[{"id":"repo","label":"Repository","x":50,"y":12},{"id":"ci","label":"CI Runner","x":50,"y":36},{"id":"eu","label":"EU Region","x":18,"y":66},{"id":"us","label":"US Region","x":50,"y":66},{"id":"apac","label":"APAC Region","x":82,"y":66},{"id":"rb","label":"Rollback Guard","x":50,"y":92}],"edges":[["repo","ci"],["ci","eu"],["ci","us"],["ci","apac"],["eu","rb"],["us","rb"],["apac","rb"]]}'::jsonb);