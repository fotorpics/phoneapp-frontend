import { useState, useEffect, useMemo, memo } from "react";
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { socket } from "@/lib/socket";
import { PageShell, SearchField, TableShell } from "@/components/dashboard/DashboardPageKit";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, getStoredAuthToken } from "@/lib/billingApi";

const typeIcon = {
  incoming: PhoneIncoming,
  outgoing: PhoneOutgoing,
  missed: PhoneMissed,
};

const typeColor = {
  incoming: "text-success",
  outgoing: "text-primary",
  missed: "text-destructive",
};

type IncomingCallEvent = {
  from: string;
  contactName?: string;
};

const CallLogsPage = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: calls = [], isLoading, refetch } = useQuery({
    queryKey: ['call-logs'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/voice/logs`, {
        headers: { 'Authorization': `Bearer ${getStoredAuthToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch call logs');
      return res.json();
    }
  });

  const filteredCalls = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return calls;
    return calls.filter((call: { toPhoneNumber: string; direction: string; status: string }) =>
      `${call.toPhoneNumber} ${call.direction} ${call.status}`.toLowerCase().includes(q)
    );
  }, [calls, debouncedSearch]);

  useEffect(() => {
    socket.on("new_call", (call: IncomingCallEvent) => {
      refetch();
    });

    return () => {
      socket.off("new_call");
    };
  }, [refetch]);

  return (
    <PageShell
      title="Call Logs"
      description="Monitor call outcomes, costs, and inbound activity in real time."
      actions={
        <>
          <SearchField
            placeholder="Search calls..."
            className="w-full min-w-[220px] md:w-72"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border bg-card"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </>
      }
    >
      <TableShell className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Number</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date & Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Duration</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Cost</th>
            </tr>
          </thead>
          <tbody>
            {filteredCalls.map((call: { direction: string; toPhoneNumber: string; createdAt: string; durationSeconds: number; status: string; creditCost: number }, i: number) => {
              const type = call.direction.toLowerCase() === 'incoming' ? 'incoming' : 'outgoing';
              const Icon = typeIcon[type as keyof typeof typeIcon];
              return (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/70 transition-colors">
                  <td className="px-4 py-3">
                    <Icon className={cn("w-4 h-4", typeColor[type as keyof typeof typeColor])} />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{call.toPhoneNumber}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(call.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono-dialer text-muted-foreground">
                    {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
                  </td>
                  <td className="px-4 py-3">
                     <span className="text-xs font-medium uppercase">{call.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono-dialer">${call.creditCost.toFixed(2)}</td>
                </tr>
              );
            })}
            {filteredCalls.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No calls found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableShell>
    </PageShell>
  );
};

export default memo(CallLogsPage);
