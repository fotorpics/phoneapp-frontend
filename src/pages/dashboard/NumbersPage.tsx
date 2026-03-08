import { useState, useCallback, memo } from "react";
import { Plus, ArrowRightLeft, Trash2, UserPlus, RefreshCw, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell, TableShell } from "@/components/dashboard/DashboardPageKit";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, getStoredAuthToken, searchNumbers, provisionNumber } from "@/lib/billingApi";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const NumbersPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [areaCode, setAreaCode] = useState("");
  const [searchResults, setSearchResults] = useState<{phoneNumber: string, locality: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: numbers = [], isLoading, refetch } = useQuery({
    queryKey: ['my-numbers'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/numbers`, {
        headers: { 'Authorization': `Bearer ${getStoredAuthToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch numbers');
      return res.json();
    }
  });

  const searchMutation = useMutation({
    mutationFn: (code: string) => searchNumbers(code),
    onSuccess: (data) => {
      setSearchResults(data);
      setIsSearching(false);
    },
    onError: (err: Error) => {
      toast({ title: "Search failed", description: err.message, variant: "destructive" });
      setIsSearching(false);
    }
  });

  const buyMutation = useMutation({
    mutationFn: (number: string) => provisionNumber(number),
    onSuccess: () => {
      toast({ title: "Success", description: "Number purchased successfully!" });
      queryClient.invalidateQueries({ queryKey: ["my-numbers"] });
      setIsBuyModalOpen(false);
      setSearchResults([]);
      setAreaCode("");
    },
    onError: (err: Error) => {
      toast({ title: "Purchase failed", description: err.message, variant: "destructive" });
    }
  });

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    searchMutation.mutate(areaCode);
  }, [areaCode, searchMutation]);

  return (
    <PageShell
      title="Phone Numbers"
      description="Manage all local, toll-free, and international lines in one place."
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border bg-card"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>

          <Dialog open={isBuyModalOpen} onOpenChange={setIsBuyModalOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-[#1e293b]"
              >
                <Plus className="w-3.5 h-3.5" /> Buy Number
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Buy a New Number</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSearch} className="flex gap-2 py-4">
                <Input
                  placeholder="Area Code (e.g. 212)"
                  value={areaCode}
                  onChange={(e) => setAreaCode(e.target.value)}
                  maxLength={3}
                  className="bg-card"
                />
                <Button type="submit" disabled={isSearching} className="bg-primary text-primary-foreground">
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </form>
              
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                {searchResults.map((n) => (
                  <div key={n.phoneNumber} className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary transition-colors bg-card">
                    <div>
                      <div className="font-mono-dialer font-medium text-foreground">{n.phoneNumber}</div>
                      <div className="text-xs text-muted-foreground">{n.locality || "US Local"}</div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => buyMutation.mutate(n.phoneNumber)}
                      disabled={buyMutation.isPending}
                      className="bg-primary text-primary-foreground"
                    >
                      {buyMutation.isPending ? "Buying..." : "Buy (1 Credit)"}
                    </Button>
                  </div>
                ))}
                {!isSearching && searchResults.length === 0 && areaCode && (
                  <div className="text-center py-8 text-muted-foreground text-sm">No numbers found. Try another area code.</div>
                )}
                {!isSearching && searchResults.length === 0 && !areaCode && (
                  <div className="text-center py-8 text-muted-foreground text-sm italic">Enter an area code to search for numbers.</div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      }
    >
      <TableShell className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Number</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Assigned At</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Recycle In</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {numbers.map((n: {number: string, type: string, assignedAt?: string, lastUsedAt?: string}, i: number) => {
              const RECYCLE_DAYS = 7;
              const baseDate = n.lastUsedAt ? new Date(n.lastUsedAt) : n.assignedAt ? new Date(n.assignedAt) : new Date();
              const recycleDate = new Date(baseDate.getTime() + RECYCLE_DAYS * 24 * 60 * 60 * 1000);
              const now = new Date();
              const diff = recycleDate.getTime() - now.getTime();
              const daysLeft = Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)));
              const hoursLeft = Math.max(0, Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)));

              return (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/70 transition-colors">
                  <td className="px-4 py-3 font-mono-dialer text-sm font-medium">{n.number}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">{n.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />Active
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {n.assignedAt ? new Date(n.assignedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {n.type === 'TEMPORARY' ? (
                      <span className={cn("font-medium", daysLeft < 2 ? "text-destructive" : "text-amber-600")}>
                        {daysLeft}d {hoursLeft}h
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => toast({ title: "Remove number", description: "Feature coming soon" })}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {numbers.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  You don't have any phone numbers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableShell>
    </PageShell>
  );
};

export default memo(NumbersPage);
