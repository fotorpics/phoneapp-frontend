import { useMemo, memo } from "react";
import { useLocation } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  PhoneCall,
  CheckCircle2,
  Coins,
  CreditCard,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession, fetchBillingSummary, getOrCreateUserId } from "@/lib/billingApi";
import { useAuth } from "@/hooks/useAuth";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const CREDIT_PACKS = [
  { label: "Starter", amountUSD: 10, productId: "pdt_0NZDLiDjrSA2Q0SkwU6Vg", accent: "from-amber-100 to-orange-50 dark:from-amber-950/80 dark:to-slate-900", icon: Sparkles },
  { label: "Growth", amountUSD: 25, productId: "pdt_0NZDLw3jYM9uQzW8m3EiW", accent: "from-cyan-100 to-sky-50 dark:from-cyan-950/80 dark:to-slate-900", icon: ArrowUpRight },
  { label: "Scale", amountUSD: 50, productId: "pdt_0NZDM2MWFzemu7DHjBBqB", accent: "from-emerald-100 to-teal-50 dark:from-emerald-950/80 dark:to-slate-900", icon: Coins },
];

const BillingPage = () => {
  const location = useLocation();
  const { user: authUser } = useAuth();

  const userIdQuery = useQuery({
    queryKey: ["billing-user-id"],
    queryFn: getOrCreateUserId,
    staleTime: Infinity,
  });

  const summaryQuery = useQuery({
    queryKey: ["billing-summary", userIdQuery.data],
    queryFn: () => fetchBillingSummary(userIdQuery.data!),
    enabled: !!userIdQuery.data,
    refetchInterval: 8000,
  });

  const checkoutMutation = useMutation({
    mutationFn: async ({ amountUSD, productId }: { amountUSD: number; productId: string }) => {
      const userId = userIdQuery.data;
      if (!userId) {
        throw new Error("User profile not initialized yet.");
      }

      const origin = window.location.origin;
      const response = await createCheckoutSession({
        userId,
        amountUSD,
        productId,
        successUrl: `${origin}/dashboard/billing?checkout=success`,
        cancelUrl: `${origin}/dashboard/billing?checkout=cancel`,
      });

      if (!response.checkoutUrl) {
        throw new Error("Checkout URL not returned by server.");
      }

      window.location.href = response.checkoutUrl;
    },
  });

  const statusTag = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const checkoutStatus = params.get("checkout");
    if (checkoutStatus === "success") {
      return { text: "Payment completed. Credits will appear shortly.", tone: "text-emerald-700 bg-emerald-500/10 border-emerald-500/30" };
    }
    if (checkoutStatus === "cancel") {
      return { text: "Checkout canceled. No credits were charged.", tone: "text-amber-700 bg-amber-500/10 border-amber-500/30" };
    }
    return null;
  }, [location.search]);

  const summary = summaryQuery.data;
  const transactions = summary?.transactions ?? [];
  const callCost = summary?.monthlyUsage.callCost ?? 0;
  const smsCost = summary?.monthlyUsage.smsCost ?? 0;

  return (
    <div className="space-y-6 p-6">
      <div className="overflow-hidden rounded-3xl border border-border bg-primary p-7 text-primary-foreground shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono-dialer text-xs tracking-[0.22em] text-primary-foreground/70">BILLING CONTROL</p>
            <h1 className="font-display-landing mt-2 text-3xl font-bold">Credits & Payments</h1>
            <p className="mt-2 text-sm text-primary-foreground/80">
              Live Dodo Payments integration with credit wallet top-ups and backend transaction history.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => summaryQuery.refetch()}
            disabled={summaryQuery.isFetching}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${summaryQuery.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {statusTag && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${statusTag.tone}`}>
          {statusTag.text}
        </div>
      )}

      {summaryQuery.error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load billing data. Ensure backend is running and Dodo Payments env vars are configured.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="app-panel p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Credit Balance</p>
          <p className="mt-2 font-mono-dialer text-3xl font-bold">
            {summary ? summary.user.creditBalance.toFixed(2) : "--"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Approx {money.format((summary?.user.creditBalance ?? 0) / 10)} remaining value</p>
        </div>
        <div className="app-panel p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">This Month Spend</p>
          <p className="mt-2 font-mono-dialer text-3xl font-bold">{money.format(summary?.thisMonthSpend ?? 0)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Voice + SMS combined usage</p>
        </div>
        <div className="app-panel p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Account</p>
          <p className="mt-2 truncate text-sm font-semibold text-foreground">{summary?.user.email ?? "Initializing..."}</p>
          <p className="mt-2 text-xs text-muted-foreground">Demo user auto-created for this workspace session</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {CREDIT_PACKS.map((pack) => (
          <button
            key={pack.label}
            className="group app-panel relative overflow-hidden p-6 text-left transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98]"
            onClick={() => checkoutMutation.mutate({ amountUSD: pack.amountUSD, productId: pack.productId })}
            disabled={checkoutMutation.isPending || userIdQuery.isLoading}
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${pack.accent} opacity-100 transition-opacity group-hover:opacity-90`} />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-4 inline-flex w-fit rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-sm p-3 shadow-sm">
                <pack.icon className="h-5 w-5 text-slate-900 dark:text-white" />
              </div>
              
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-600/80 dark:text-slate-400">{pack.label} Pack</p>
                <p className="mt-2 font-display-landing text-4xl font-black text-slate-900 dark:text-white leading-none">{money.format(pack.amountUSD)}</p>
                <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{pack.amountUSD * 10} credits</p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Buy credits</span>
                <div className="rounded-full bg-slate-900 dark:bg-white p-1.5 text-white dark:text-slate-900 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 shadow-md">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="app-panel p-5">
          <p className="mb-3 text-sm font-semibold text-foreground">Usage Breakdown</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-border bg-card/70 px-4 py-3">
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <PhoneCall className="h-4 w-4 text-amber-600" /> Voice calls
              </span>
              <span className="font-mono-dialer text-sm font-semibold">{money.format(callCost)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-card/70 px-4 py-3">
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4 text-sky-600" /> SMS messages
              </span>
              <span className="font-mono-dialer text-sm font-semibold">{money.format(smsCost)}</span>
            </div>
          </div>
        </div>
        <div className="app-panel p-5">
          <p className="mb-3 text-sm font-semibold text-foreground">Dodo Payments Status</p>
          <div className="rounded-xl border border-success/30 bg-success/10 p-4">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-success">
              <CheckCircle2 className="h-4 w-4" /> Connected through backend webhook fulfillment
            </p>
            <p className="mt-2 text-xs leading-relaxed text-success/80">
              Top-ups create Dodo Checkout sessions. Completed payments credit your backend wallet and write transactions atomically.
            </p>
          </div>
        </div>
      </div>

      <div className="app-panel overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display-landing text-xl font-semibold text-foreground">Transaction History</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Credits</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No transactions yet. Use a credit pack above to create your first Dodo payment.
                </td>
              </tr>
            )}
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-700">
                    {tx.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-foreground">+{tx.creditsAdded.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-mono-dialer text-sm font-semibold text-foreground">
                  {money.format(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default memo(BillingPage);
