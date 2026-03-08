import { useMemo } from "react";
import { Phone, MessageSquare, TrendingUp, Clock, RefreshCw } from "lucide-react";
import { PageShell, SectionCard, StatTile } from "@/components/dashboard/DashboardPageKit";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, getStoredAuthToken } from "@/lib/billingApi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AnalyticsPage = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/analytics`, {
        headers: { 'Authorization': `Bearer ${getStoredAuthToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    }
  });

  const metrics = useMemo(() => {
    const rawMetrics = data?.metrics || [
      { label: "Total Calls", value: "0", change: "0%" },
      { label: "Total SMS", value: "0", change: "0%" },
      { label: "Avg Call Duration", value: "0m 0s", change: "0%" },
      { label: "Total Spend", value: "$0.00", change: "0%" },
    ];

    const icons: Record<string, React.ElementType> = {
      "Total Calls": Phone,
      "Total SMS": MessageSquare,
      "Avg Call Duration": Clock,
      "Total Spend": TrendingUp,
    };

    return rawMetrics.map((m: { label: string; value: string; change: string }) => ({
      ...m,
      icon: icons[m.label] || Phone
    }));
  }, [data]);

  const peakHours = data?.peakHours || [];
  const maxCalls = peakHours.length > 0 ? Math.max(...peakHours.map((h: { calls: number }) => h.calls)) : 1;

  return (
    <PageShell
      title="Analytics"
      description="Measure call throughput, messaging volume, and spend patterns."
      actions={
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={cn("w-3.5 h-3.5 mr-2", isLoading && "animate-spin")} /> Refresh
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m: { label: string; value: string; change: string; icon: React.ElementType }) => (
          <StatTile
            key={m.label}
            label={m.label}
            value={m.value}
            hint={`${m.change} vs last month`}
            icon={<m.icon className="h-4 w-4 text-muted-foreground" />}
          />
        ))}
      </div>

      <SectionCard title="Peak Calling Hours" subtitle="Hourly distribution across the workday">
        <div className="flex items-end gap-1 md:gap-3 h-48 overflow-x-auto pb-2">
          {peakHours.map((h: { hour: string; calls: number }) => (
            <div key={h.hour} className="flex-1 min-w-[30px] flex flex-col items-center gap-2">
              <span className="text-[10px] font-mono-dialer text-muted-foreground">{h.calls}</span>
              <div
                className="w-full rounded-t-sm bg-primary text-primary-foreground/75 transition-colors hover:bg-primary text-primary-foreground"
                style={{ height: `${(h.calls / maxCalls) * 100}%`, minHeight: h.calls > 0 ? '4px' : '0' }}
              />
              <span className="text-[8px] md:text-[10px] text-muted-foreground whitespace-nowrap">{h.hour}</span>
            </div>
          ))}
          {peakHours.length === 0 && !isLoading && (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No data available for the current period.
            </div>
          )}
        </div>
      </SectionCard>
    </PageShell>
  );
};

export default AnalyticsPage;
