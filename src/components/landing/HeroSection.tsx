import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Phone, MessageSquare, Shield, Globe } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pb-32 pt-40 md:pt-48 bg-background">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.2)_0%,hsl(var(--background))_70%)]" />
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 mix-blend-overlay pointer-events-none" />
      
      {/* Glowing Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-48 -right-24 w-96 h-96 bg-accent/5 dark:bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6">
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-border bg-background/50 px-5 py-2 text-sm font-medium text-muted-foreground backdrop-blur-md shadow-lg shadow-black/[0.03]">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-foreground font-semibold">New:</span> Global Twilio Integration Live
          </div>
        </motion.div>

        <motion.h1
          className="mx-auto mb-8 max-w-5xl text-center text-6xl font-extrabold tracking-tighter text-foreground md:text-8xl lg:text-[7.5rem] leading-[0.95]"
          initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Speak to the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60">whole world.</span>
        </motion.h1>

        <motion.p
          className="mx-auto mb-12 max-w-2xl text-center text-lg text-muted-foreground md:text-xl font-light tracking-wide leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Instant phone numbers. Crystal clear WebRTC voice. Global SMS delivery. 
          A single API for your entire communication stack.
        </motion.p>

        <motion.div
          className="mb-24 flex flex-col items-center justify-center gap-5 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link to="/login">
            <Button
              size="lg"
              className="h-14 gap-3 rounded-full bg-primary px-8 text-base font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90"
            >
              Start for free <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="h-14 gap-3 rounded-full border-border bg-background/50 px-8 text-base font-semibold text-foreground backdrop-blur-md hover:bg-secondary"
          >
            <Play className="h-5 w-5 text-primary" /> View documentation
          </Button>
        </motion.div>

        {/* Abstract Abstract UI Visualization */}
        <motion.div
          className="relative mx-auto w-full max-w-5xl aspect-[21/9]"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-0 rounded-[2rem] border border-border bg-gradient-to-b from-card to-background/50 backdrop-blur-xl shadow-2xl overflow-hidden flex items-center justify-center">
            
            {/* Grid background inside */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

            {/* Central Node */}
            <div className="relative z-20 flex flex-col items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/80 shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)]">
                <Globe className="h-10 w-10 text-primary-foreground" />
              </div>
              
              {/* Connecting Lines */}
              <div className="absolute top-1/2 left-1/2 -translate-y-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[1px] h-[300px] bg-gradient-to-b from-transparent via-primary/30 to-transparent" />

              {/* Orbiting Elements */}
              <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-dashed border-primary/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-lg">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div className="absolute top-1/2 -right-4 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-lg">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-lg">
                  <Shield className="h-4 w-4 text-accent" />
                </div>
              </motion.div>
            </div>

            {/* Floating UI Cards */}
            <motion.div 
              className="absolute left-10 top-10 rounded-xl border border-border bg-card/80 backdrop-blur-md p-4 shadow-xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span className="font-mono-dialer text-xs text-foreground">Call active: 04:21</span>
              </div>
            </motion.div>

            <motion.div 
              className="absolute right-10 bottom-10 rounded-xl border border-border bg-card/80 backdrop-blur-md p-4 shadow-xl"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="font-mono-dialer text-xs text-foreground">SMS delivered</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-px bg-border/20 border border-border rounded-3xl overflow-hidden md:grid-cols-4">
          {[
            { label: "Uptime SLA", value: "99.99%" },
            { label: "Global Reach", value: "100+ countries" },
            { label: "Voice Latency", value: "<250ms" },
            { label: "API Uptime", value: "100%" },
          ].map((stat, i) => (
            <div key={i} className="bg-secondary/50 p-8 text-center">
              <p className="font-display-landing text-3xl font-bold text-foreground mb-2">{stat.value}</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
