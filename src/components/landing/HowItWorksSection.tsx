import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Pick numbers instantly",
    desc: "Provision local and toll-free numbers and assign them to reps in seconds.",
  },
  {
    step: "02",
    title: "Route with smart rules",
    desc: "Set IVR menus, ring groups, and call logic that adapts to team schedules.",
  },
  {
    step: "03",
    title: "Track performance live",
    desc: "Monitor calls, costs, and outcomes so managers can improve quality daily.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="relative overflow-hidden py-32 bg-background">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 dark:opacity-10 mix-blend-overlay pointer-events-none" />
      <div className="container relative z-10 mx-auto px-6">
        <div className="rounded-[2.5rem] border border-border bg-card/30 backdrop-blur-3xl p-10 md:p-16 relative overflow-hidden shadow-2xl">
          {/* Subtle inner glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 rounded-[100%] blur-[80px] pointer-events-none" />

          <div className="mb-16 text-center relative z-10">
            <span className="font-mono-dialer text-xs uppercase tracking-[0.2em] text-primary">Deployment</span>
            <h2 className="font-display-landing mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
              Launch in minutes.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Skip the telecom bureaucracy. Build your communication stack instantly.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3 relative z-10">
            {steps.map((item, idx) => (
              <motion.div 
                key={item.step} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="relative rounded-3xl border border-border bg-background/50 p-8 overflow-hidden group hover:border-primary/30 transition-colors"
              >
                <div className="absolute top-0 right-0 p-8 text-7xl font-extrabold text-foreground/5 group-hover:text-foreground/10 transition-colors pointer-events-none select-none">
                  {item.step}
                </div>
                <div className="mb-6 inline-flex h-8 items-center rounded-full bg-primary/10 px-3 py-1 font-mono-dialer text-xs font-bold tracking-widest text-primary">
                  STEP {item.step}
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

export default HowItWorksSection;
