import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  Sparkles, ArrowRight, MessageSquare, ShieldCheck, Languages, History,
  Bug, Leaf, Sun, Microscope, Sprout, CheckCircle2, Quote, BrainCircuit, Cpu, Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import hero from "@/assets/hero-mountains.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1600;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />

      {/* HERO */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute inset-0 grid-pattern opacity-50 pointer-events-none" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-blob pointer-events-none" />
        <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-sky/20 blur-3xl animate-blob pointer-events-none" style={{ animationDelay: "4s" }} />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-lime/20 blur-3xl animate-blob pointer-events-none" style={{ animationDelay: "8s" }} />

        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <motion.div initial="hidden" animate="show" variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Built for Uttarakhand mountain agriculture
              </div>
              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
                AI Crop Advisory<br />
                for <span className="gradient-text">Uttarakhand</span><br />
                Farmers
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                Get instant guidance on crop diseases, pest control, irrigation, soil health, and post-harvest handling
                — from an AI trained for mountain agriculture.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() => navigate("/app")}
                  className="h-12 px-6 rounded-2xl text-base bg-gradient-to-br from-primary to-forest hover:opacity-95 shadow-elegant"
                  style={{ boxShadow: "var(--shadow-elegant)" }}
                >
                  <Sparkles className="h-5 w-5" />
                  Start Chatting
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6 rounded-2xl text-base">
                  <a href="#features">Learn More</a>
                </Button>
              </div>

              <div className="mt-10 flex items-center gap-5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Multilingual</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> 24/7 support</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Responsible AI</div>
              </div>
            </motion.div>

            {/* Chat mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="absolute -inset-6 bg-gradient-to-tr from-primary/30 via-sky/20 to-lime/30 rounded-[2rem] blur-2xl opacity-60" />
              <div className="relative glass-strong rounded-3xl p-5 shadow-elegant" style={{ boxShadow: "var(--shadow-elegant)" }}>
                {/* chat header */}
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-forest flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">AgriAdvisor AI</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Online · Hindi & English
                    </div>
                  </div>
                </div>

                <div className="space-y-3 py-5 max-h-[360px] overflow-hidden">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-br from-primary to-forest text-primary-foreground px-4 py-2.5 text-sm shadow-md">
                      My beans have yellow spots on the leaves.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-1">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-card border px-4 py-3 text-sm shadow-sm">
                      <p className="font-medium mb-1.5">Likely <span className="text-primary">bean rust</span> (Uromyces appendiculatus).</p>
                      <ul className="text-[13px] text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Remove affected leaves immediately</li>
                        <li>Spray neem oil 3%, every 7 days</li>
                        <li>Avoid overhead irrigation in evenings</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-1.5 pl-9">
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "120ms" }} />
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "240ms" }} />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t">
                  <div className="flex-1 h-10 rounded-xl bg-muted px-3 flex items-center text-xs text-muted-foreground">Ask about your crop…</div>
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-forest flex items-center justify-center shadow-md">
                    <ArrowRight className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              {[
                { icon: Microscope, label: "Disease Detection", cls: "-top-4 -left-6 animate-float", delay: "0s" },
                { icon: Bug, label: "Pest Management", cls: "top-1/3 -right-6 animate-float-slow", delay: "1s" },
                { icon: Sprout, label: "Organic Tips", cls: "-bottom-3 left-4 animate-float", delay: "2s" },
                { icon: Sun, label: "Weather Aware", cls: "bottom-1/3 -right-10 animate-float-slow", delay: "3s" },
              ].map((f, i) => (
                <div key={i} className={`hidden md:flex absolute glass-strong rounded-xl px-3 py-2 items-center gap-2 shadow-md ${f.cls}`} style={{ animationDelay: f.delay }}>
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary/20 to-sky/20 flex items-center justify-center">
                    <f.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-xs font-medium whitespace-nowrap">{f.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 relative">
        <div className="container">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="max-w-2xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-4">
              <BrainCircuit className="h-3.5 w-3.5" /> Features
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight">
              Everything a hill farmer needs<br />
              <span className="gradient-text-fresh">in one assistant</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Built specifically for the climate, crops, and terrain of Uttarakhand.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Microscope, title: "AI Crop Disease Diagnosis", desc: "Describe symptoms and get a likely diagnosis with confidence cues." },
              { icon: Bug, title: "Pest Management", desc: "Integrated, organic, and chemical recommendations tuned for hill crops." },
              { icon: Sprout, title: "Post-Harvest Guidance", desc: "Storage, drying, grading, and transport advice for mountain logistics." },
              { icon: Languages, title: "Hindi & English", desc: "Ask in either language — replies match the language you used." },
              { icon: History, title: "Chat History", desc: "Every conversation saved, searchable, and resumable across devices." },
              { icon: ShieldCheck, title: "Responsible AI", desc: "Scope-limited, with clear disclaimers and verification reminders." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group relative rounded-2xl p-6 bg-card border hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-elegant"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-sky/0 group-hover:from-primary/5 group-hover:to-sky/5 transition-colors pointer-events-none" />
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/15 to-sky/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-1.5">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 bg-gradient-to-b from-background via-accent/20 to-background">
        <div className="container">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="max-w-2xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-4">
              <Workflow className="h-3.5 w-3.5" /> How it works
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight">Three steps to better yield</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            {[
              { n: "01", icon: MessageSquare, title: "Describe the problem", desc: "Type or speak your crop issue — symptoms, location, weather context." },
              { n: "02", icon: Cpu, title: "AI analyzes symptoms", desc: "Our model checks against thousands of hill-agriculture scenarios." },
              { n: "03", icon: CheckCircle2, title: "Receive recommendations", desc: "Practical, prioritized steps you can act on the same day." },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative text-center"
              >
                <div className="relative mx-auto h-24 w-24 rounded-3xl bg-gradient-to-br from-primary to-forest flex items-center justify-center shadow-elegant" style={{ boxShadow: "var(--shadow-elegant)" }}>
                  <s.icon className="h-9 w-9 text-primary-foreground" />
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-xl bg-card border flex items-center justify-center text-xs font-bold">{s.n}</div>
                </div>
                <h3 className="font-heading text-xl font-semibold mt-6 mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20">
        <div className="container">
          <div className="rounded-3xl p-10 md:p-14 bg-gradient-to-br from-primary via-forest to-primary text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 grid-pattern opacity-10" />
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: 10000, suffix: "+", label: "Farmers assisted" },
                { value: 95, suffix: "%", label: "Faster advisory access" },
                { value: 24, suffix: "/7", label: "Availability" },
                { value: 100, suffix: "%", label: "AI-powered support" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-heading text-4xl md:text-5xl font-bold tracking-tight">
                    <Counter to={s.value} suffix={s.suffix} />
                  </div>
                  <div className="mt-2 text-sm opacity-80">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24">
        <div className="container grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-sky/20 rounded-3xl blur-2xl" />
            <img src={hero} alt="Terraced fields in Uttarakhand" className="relative rounded-3xl shadow-elegant object-cover aspect-[4/3] w-full" width={1600} height={1200} loading="lazy" style={{ boxShadow: "var(--shadow-elegant)" }} />
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-4">
              <Leaf className="h-3.5 w-3.5" /> Our Mission
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight">Empowering hill farmers with AI they can trust</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Field supervisors in Uttarakhand cover huge distances and serve thousands of farmers. PahadiCrop AI puts a
              specialized advisor in their pocket — one that understands terraced fields, monsoon-prone slopes, and the
              real crops grown across Pahadi villages.
            </p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {[
                { title: "Practical advice", desc: "Always actionable, never generic." },
                { title: "Scope-limited", desc: "Crop topics only, by design." },
                { title: "Privacy-first", desc: "Your chats are yours alone." },
                { title: "Always free for farmers", desc: "Built as a public good." },
              ].map((c) => (
                <div key={c.title} className="rounded-xl p-4 bg-card border">
                  <div className="font-semibold text-sm">{c.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{c.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-gradient-to-b from-background to-accent/20">
        <div className="container">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight">Trusted by field supervisors</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Rajesh Bisht", role: "Field Supervisor, Almora", quote: "I cover 14 villages. Now I confirm diagnoses in seconds instead of waiting for the next visit." },
              { name: "Kamla Rawat", role: "Farmer, Chamoli", quote: "I asked about my potato leaves turning brown — the answer in Hindi was clear and saved my crop." },
              { name: "Anand Negi", role: "Extension Officer, Pithoragarh", quote: "The disclaimers and scope limits make this safe to recommend to farmers across our block." },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl p-6 bg-card border"
              >
                <Quote className="h-6 w-6 text-primary/40 mb-3" />
                <p className="text-sm leading-relaxed">"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-forest flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="rounded-3xl p-10 md:p-16 text-center bg-gradient-to-br from-accent via-card to-accent border relative overflow-hidden">
            <div className="absolute inset-0 grid-pattern opacity-50" />
            <div className="relative">
              <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">Ready to talk to your crop advisor?</h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Sign in with Google and ask your first question in under 10 seconds.</p>
              <Button size="lg" onClick={() => navigate("/auth")} className="mt-8 h-12 px-7 rounded-2xl text-base bg-gradient-to-br from-primary to-forest shadow-elegant" style={{ boxShadow: "var(--shadow-elegant)" }}>
                <Sparkles className="h-5 w-5" /> Get started free <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}