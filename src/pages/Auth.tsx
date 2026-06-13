import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, ShieldCheck, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

export default function Auth() {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/app", { replace: true });
  }, [user, loading, navigate]);

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      toast({
        title: "Sign-in failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-blob" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky/20 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />

      <div className="container pt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-strong rounded-3xl p-8 shadow-elegant" style={{ boxShadow: "var(--shadow-elegant)" }}>
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-forest p-2 shadow-md">
                <img src={logo} alt="PahadiCrop AI" className="h-full w-full" width={56} height={56} />
              </div>
              <h1 className="font-heading text-2xl font-bold mt-5">Welcome to PahadiCrop AI</h1>
              <p className="text-sm text-muted-foreground mt-2">Sign in to start your crop conversation</p>
            </div>

            <Button
              onClick={handleGoogle}
              disabled={loading}
              className="mt-8 w-full h-12 rounded-xl bg-card hover:bg-accent text-foreground border shadow-sm gap-3 text-[15px]"
              variant="outline"
            >
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.48 12c0-.73.13-1.44.36-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
              Continue with Google
            </Button>

            <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> Privacy-first</div>
              <div className="flex items-center gap-1.5"><Globe2 className="h-4 w-4 text-primary" /> Hindi & English</div>
              <div className="flex items-center gap-1.5 col-span-2"><Sparkles className="h-4 w-4 text-primary" /> Specialized for mountain agriculture</div>
            </div>

            <p className="mt-6 text-[11px] text-center text-muted-foreground leading-relaxed">
              By continuing, you agree that AI advice should be verified with a licensed extension officer.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}