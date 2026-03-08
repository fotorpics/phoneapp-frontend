import { LockKeyhole, ShieldCheck, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

const controls = [
  {
    icon: LockKeyhole,
    title: "Encrypted media streams",
    desc: "Signaling and WebRTC media are secured end to end in transit.",
    color: "text-amber-400",
  },
  {
    icon: UserCheck,
    title: "Role-based controls",
    desc: "Granular permission sets keep sensitive customer conversations protected.",
    color: "text-sky-400",
  },
  {
    icon: ShieldCheck,
    title: "Compliance-ready posture",
    desc: "Audit trails, backup policies, and SOC 2-aligned operational controls.",
    color: "text-emerald-400",
  },
];

const SecuritySection = () => {
  return (
    <section id="security" className="relative overflow-hidden py-24 bg-background">
      <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="container relative z-10 mx-auto px-6">
        <div className="text-center mb-16">
          <p className="mb-4 font-mono-dialer text-xs uppercase tracking-[0.24em] text-muted-foreground">Infrastructure</p>
          <h2 className="font-display-landing mx-auto max-w-3xl text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Enterprise-grade protection across every call and message
          </h2>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {controls.map((item, i) => (
              <motion.div 
                key={item.title} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group flex flex-col items-center text-center rounded-3xl border border-border bg-gradient-to-b from-card to-transparent p-8 hover:bg-secondary/50 transition-colors"
              >
                <div className={`mb-6 p-4 rounded-2xl bg-secondary ring-1 ring-border shadow-lg ${item.color}`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 font-display-landing text-xl font-bold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
