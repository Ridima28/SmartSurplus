import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, LogIn, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";

const links = [
  { to: "#features", label: "Features" },
  { to: "#how", label: "How It Works" },
  { to: "#about", label: "About" },
  { to: "#contact", label: "Contact" },
];

export default function SiteNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="container">
        <div
          className={`glass-strong rounded-2xl px-4 md:px-6 flex items-center justify-between transition-all duration-300 ${
            scrolled ? "h-14" : "h-16"
          }`}
        >
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative h-9 w-9 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-forest shadow-md">
              <img src={logo} alt="PahadiCrop AI" className="h-full w-full object-contain p-1" width={36} height={36} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-heading text-base font-bold tracking-tight">
                PahadiCrop <span className="gradient-text">AI</span>
              </span>
              <span className="text-[10px] text-muted-foreground hidden sm:block">Mountain agriculture, intelligent</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.to}
                href={l.to}
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent/60 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <Button onClick={() => navigate("/app")} className="rounded-xl shadow-md bg-gradient-to-br from-primary to-forest hover:opacity-95">
                <Sparkles className="h-4 w-4" /> Open Chat
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")} className="rounded-xl">
                  <LogIn className="h-4 w-4" /> Login
                </Button>
                <Button onClick={() => navigate("/auth")} className="rounded-xl shadow-md bg-gradient-to-br from-primary to-forest hover:opacity-95">
                  Get Started
                </Button>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-accent" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden mt-2 glass-strong rounded-2xl p-4 space-y-1">
            {links.map((l) => (
              <a key={l.to} href={l.to} onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-accent text-sm font-medium">
                {l.label}
              </a>
            ))}
            <div className="pt-2 border-t flex flex-col gap-2">
              {user ? (
                <Button onClick={() => { setOpen(false); navigate("/app"); }} className="w-full">Open Chat</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => { setOpen(false); navigate("/auth"); }}>Login</Button>
                  <Button onClick={() => { setOpen(false); navigate("/auth"); }}>Get Started</Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
}