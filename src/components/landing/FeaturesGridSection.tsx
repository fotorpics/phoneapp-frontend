import { motion } from "framer-motion";
import { BarChart3, CreditCard, Globe, MessageSquare, Phone, Users, Zap } from "lucide-react";

const featureCards = [
  {
    icon: Phone,
    title: "HD Voice Calls",
    desc: "Crystal-clear WebRTC calling from browser, desktop, and mobile devices.",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
  },
  {
    icon: MessageSquare,
    title: "Business SMS",
    desc: "Run two-way messaging and keep every conversation in one timeline.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    desc: "Track quality, team performance, and conversion moments live.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    desc: "Provision local and toll-free numbers in 100+ countries instantly.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Zap,
    title: "Smart Routing",
    desc: "Use IVR and routing rules to connect callers to the right rep in seconds.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Share inboxes, assign conversations, and monitor rep activity seamlessly.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
  {
    icon: CreditCard,
    title: "Credit Billing",
    desc: "Spend-based pricing that scales linearly with usage, not per-seat count.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
  },
];

const FeaturesGridSection = () => {
  return (
    <section id="features" className="relative overflow-hidden py-32 bg-background">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background to-secondary/20 dark:from-background dark:to-primary/10" />
      <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      <div className="absolute bottom-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/10 to-transparent" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mb-20 text-center">
          <span className="font-mono-dialer text-xs uppercase tracking-[0.2em] text-primary">Core Capabilities</span>
          <h2 className="font-display-landing mt-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Built for teams that move fast
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            All the voice and messaging tools you need inside one highly reliable, globally distributed cloud workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.05, duration: 0.5, ease: "easeOut" }}
              className="group relative rounded-3xl border border-border bg-card/50 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-card hover:shadow-xl hover:shadow-primary/5"
            >
              <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} ring-1 ring-border/50 transition-transform group-hover:scale-110`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <h3 className="mb-3 font-display-landing text-xl font-bold text-foreground">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
          
          {/* Empty spacer card for layout balance if needed, or an extra CTA */}
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.4, duration: 0.5 }}
             className="group relative flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-transparent p-8 text-center transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
          >
            <h3 className="mb-2 font-display-landing text-lg font-bold text-foreground/80">And much more</h3>
            <p className="text-sm text-muted-foreground">Explore the full API documentation.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGridSection;
