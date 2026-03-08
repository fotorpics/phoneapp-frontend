import { useState } from "react";
import { ExternalLink, Zap, MessageSquare, Cloud, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell, SectionCard } from "@/components/dashboard/DashboardPageKit";
import { useToast } from "@/components/ui/use-toast";

const integrations = [
  { name: "Zapier", desc: "Connect CallFlow with 5,000+ apps", status: "Available", icon: Zap },
  { name: "Slack", desc: "Get call notifications in Slack channels", status: "Available", icon: MessageSquare },
  { name: "HubSpot", desc: "Sync contacts and log calls automatically", status: "Coming Soon", icon: Puzzle },
  { name: "Salesforce", desc: "CRM integration for enterprise teams", status: "Coming Soon", icon: Cloud },
];

const IntegrationsPage = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");

  return (
    <PageShell
      title="Integrations"
      description="Connect CallFlow with your sales, support, and automation stack."
    >
      <SectionCard
        title="Webhooks"
        subtitle="Trigger external workflows when calls and messages change state."
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Webhook URL</label>
            <input
              placeholder="https://your-server.com/webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-secondary px-3 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
          </div>
          <Button
            size="sm"
            className="rounded-full bg-primary text-primary-foreground hover:bg-[#1e293b]"
            onClick={() =>
              toast({
                title: "Webhook saved",
                description: webhookUrl ? `Events will be sent to ${webhookUrl}` : "Please add a URL first.",
              })
            }
          >
            Save Webhook
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="API Keys" subtitle="Use secure tokens to call CallFlow APIs from your apps.">
        <div className="flex items-center justify-between rounded-xl border border-border bg-secondary p-3">
          <code className="font-mono-dialer text-sm text-muted-foreground">cf_live_••••••••••••••••</code>
          <Button
            variant="outline"
            size="sm"
            className="border-border bg-card"
            onClick={() =>
              toast({
                title: "API key regenerated",
                description: "A new token has been issued for your workspace.",
              })
            }
          >
            Regenerate
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Available Integrations" subtitle="Prebuilt connections with CRM and collaboration tools.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {integrations.map((int) => (
            <div key={int.name} className="rounded-xl border border-border bg-card p-5 flex items-start gap-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-primary/10">
                <int.icon className="h-5 w-5 text-foreground" />
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">{int.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{int.desc}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={int.status === "Coming Soon"}
                className="gap-1.5 shrink-0 border-border bg-card"
                onClick={() =>
                  toast({
                    title: `${int.name} connected`,
                    description: "Integration configuration has been started.",
                  })
                }
              >
                {int.status === "Coming Soon" ? "Soon" : <>Connect <ExternalLink className="w-3 h-3" /></>}
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
};

export default IntegrationsPage;
