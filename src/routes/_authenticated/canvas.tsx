import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/portal-shell";
import { NodeCanvas } from "@/components/portal/node-canvas";

export const Route = createFileRoute("/_authenticated/canvas")({
  head: () => ({
    meta: [
      { title: "Infinite Node Canvas — oneclick.platform" },
      {
        name: "description",
        content:
          "Unendliche Node-Fläche mit Titan-Glas-Modulen: Partner, SDKs, Docker-Templates und MCP-Connectoren räumlich verdrahten, synchronisieren und protokollieren.",
      },
      { property: "og:title", content: "Infinite Node Canvas — oneclick.platform" },
      {
        property: "og:description",
        content:
          "Pan, Zoom, magnetisches Snapping und Energie-Fluss-Verbindungen zwischen allen Portalen und Connectoren.",
      },
    ],
  }),
  component: CanvasPage,
});

function CanvasPage() {
  return (
    <PortalShell fullBleed>
      <div className="border-b border-border px-4 py-3 lg:px-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
          Control Plane · Infinite Engine
        </p>
        <h1 className="text-alloy mt-0.5 text-lg font-semibold tracking-tight">
          Infinite Node Canvas
        </h1>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Ziehe Nodes am Kopf, schiebe die Fläche mit der Maus, zoome mit dem Rad oder per Pinch.
          Ein Node auswählen und bei einem zweiten „Verbinden“ klicken erzeugt eine
          Energiefluss-Verbindung. Jede Aktion landet als Marker in der Zeitleiste.
        </p>
      </div>
      <NodeCanvas />
    </PortalShell>
  );
}
