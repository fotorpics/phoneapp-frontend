import { Button } from "@/components/ui/button";
import { Check, Coins, ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter Pack",
    price: "$10",
    desc: "Perfect for testing and small volumes.",
    credits: "100 credits",
    features: ["1 phone number included", "HD voice calls ($0.05/min)", "SMS messaging ($0.01/msg)", "Basic analytics", "Standard support"],
    cta: "Buy Starter Pack",
    popular: false,
    icon: Sparkles,
    color: "from-amber-200/60 to-orange-100/30",
  },
  {
    name: "Growth Pack",
    price: "$25",
    desc: "For active teams handling more calls.",
    credits: "250 credits",
    features: ["5 phone numbers included", "Call recording", "Advanced analytics", "Team features", "Priority support"],
    cta: "Buy Growth Pack",
    popular: true,
    icon: ArrowUpRight,
    color: "from-cyan-200/60 to-sky-100/30",
  },
  {
    name: "Scale Pack",
    price: "$50",
    desc: "Maximum value for high-volume users.",
    credits: "500 credits",
    features: ["Unlimited numbers", "Custom integrations", "Volume discounts", "Dedicated account manager", "24/7 phone support"],
    cta: "Buy Scale Pack",
    popular: false,
    icon: Coins,
    color: "from-emerald-200/60 to-teal-100/30",
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="relative overflow-hidden py-32 bg-background">
      <div className="pointer-events-none absolute inset-0 opacity-10 dark:opacity-20 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.2)_0%,transparent_70%)]" />
      <div className="container relative z-10 mx-auto px-6">
        <div className="mb-20 text-center">
          <span className="font-mono-dialer text-xs uppercase tracking-[0.2em] text-primary">Simple Economics</span>
          <h2 className="font-display-landing mt-4 text-4xl font-extrabold tracking-tight text-foreground md:text-6xl">
            Pay-as-you-go pricing.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            No subscriptions. No hidden fees. Add credits when you need them and only pay for the exact minutes and messages you use.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-2 ${
                plan.popular 
                ? "bg-gradient-to-b from-primary/5 to-primary/10 dark:from-primary/10 dark:to-background shadow-2xl shadow-primary/5 ring-1 ring-primary/20" 
                : "bg-card ring-1 ring-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground tracking-widest uppercase shadow-lg shadow-primary/25">
                  Best Value
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${plan.color}`}>
                  <plan.icon className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h3 className="font-display-landing text-xl font-bold text-foreground">{plan.name}</h3>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground min-h-[40px]">{plan.desc}</p>
              
              <div className="my-8 flex items-baseline gap-2">
                <span className="font-display-landing text-5xl font-extrabold tracking-tight text-foreground">{plan.price}</span>
                <span className="text-muted-foreground font-medium">/ one-time</span>
              </div>
              
              <div className="mb-8 rounded-xl bg-secondary p-4 border border-border">
                <p className="font-mono-dialer text-center text-lg font-bold text-primary">{plan.credits}</p>
              </div>
              
              <ul className="mb-10 flex-1 space-y-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.popular ? "text-primary" : "text-emerald-500"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/login">
                <Button
                  className={`w-full h-12 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                      : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
