import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Plus, MessageSquare, Trash2, LogOut, Search, Sparkles, ArrowUp, Loader2,
  Mic, Download, Sun, Moon, Languages, PanelLeftClose, PanelLeftOpen,
  Microscope, Bug, Sprout, Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

interface Thread { id: string; title: string; updated_at: string; }

const SUGGESTED = [
  { icon: Microscope, text: "My beans have yellow spots on the leaves." },
  { icon: Sprout, text: "Potato leaves are turning brown — what should I do?" },
  { icon: Bug, text: "Aphids on my tomato plants in a hill garden." },
  { icon: Leaf, text: "Organic pest control methods for cabbage." },
];

function ChatBubble({ m }: { m: UIMessage }) {
  const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
  const isUser = m.role === "user";
  if (!text) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? "justify-end" : ""}`}
    >
      {!isUser && (
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-forest flex items-center justify-center shrink-0 mt-1 shadow-sm">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
      <div className={isUser
        ? "max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-br from-primary to-forest text-primary-foreground px-4 py-2.5 shadow-md"
        : "max-w-[85%] rounded-2xl rounded-tl-md bg-card border px-4 py-3 shadow-sm"
      }>
        {isUser ? (
          <p className="text-[15px] whitespace-pre-wrap">{text}</p>
        ) : (
          <div className="prose-chat"><ReactMarkdown>{text}</ReactMarkdown></div>
        )}
      </div>
    </motion.div>
  );
}

export default function AppChat() {
  const { threadId } = useParams<{ threadId?: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [input, setInput] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Auth gate
  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  // Theme toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Load threads
  const loadThreads = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("threads")
      .select("id,title,updated_at")
      .order("updated_at", { ascending: false });
    setThreads(data ?? []);
    return data ?? [];
  };

  useEffect(() => { if (user) loadThreads(); /* eslint-disable-line */ }, [user]);

  // Auto-route: /app -> most recent thread or create one
  useEffect(() => {
    if (!user || threadId) return;
    (async () => {
      const list = await loadThreads();
      if (list && list.length > 0) {
        navigate(`/app/${list[0].id}`, { replace: true });
      } else {
        const { data, error } = await supabase
          .from("threads")
          .insert({ user_id: user.id, title: "New chat" })
          .select("id").single();
        if (data) navigate(`/app/${data.id}`, { replace: true });
        if (error) toast({ title: "Could not create chat", description: error.message, variant: "destructive" });
      }
    })();
  }, [user, threadId, navigate]);

  // Load messages for active thread
  useEffect(() => {
    if (!threadId || !user) return;
    setInitialMessages(null);
    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("id,role,parts,ai_message_id,created_at")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      const ui: UIMessage[] = (data ?? []).map((r) => ({
        id: r.ai_message_id ?? r.id,
        role: r.role as UIMessage["role"],
        parts: r.parts as UIMessage["parts"],
      }));
      setInitialMessages(ui);
    })();
  }, [threadId, user]);

  const session = useMemo(
    () => ({ id: threadId ?? "new", messages: initialMessages ?? [] }),
    [threadId, initialMessages],
  );

  const transport = useMemo(() => new DefaultChatTransport({
    api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
    headers: () => {
      const token = (window as unknown as { __supaToken?: string }).__supaToken;
      return {
        Authorization: `Bearer ${token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      };
    },
    body: () => ({ threadId }),
  }), [threadId]);

  // Keep latest access token available
  useEffect(() => {
    const sync = async () => {
      const { data } = await supabase.auth.getSession();
      (window as unknown as { __supaToken?: string }).__supaToken = data.session?.access_token;
    };
    sync();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      (window as unknown as { __supaToken?: string }).__supaToken = s?.access_token;
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const { messages, sendMessage, status, error, regenerate } = useChat({
    id: session.id,
    messages: session.messages,
    transport,
    onError: (err) =>
      toast({
        title: "AI service error",
        description: err?.message?.includes("402")
          ? "AI credits exhausted. Please add credits to continue."
          : err?.message?.includes("429")
          ? "Rate limit reached. Please wait a moment and try again."
          : "Unable to connect to AI service. Please try again.",
        variant: "destructive",
      }),
    onFinish: () => { loadThreads(); taRef.current?.focus(); },
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Focus textarea on thread change & mount
  useEffect(() => { taRef.current?.focus(); }, [threadId]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading || !threadId) return;
    setInput("");
    await sendMessage({ text });
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const newChat = async () => {
    if (!user) return;
    const { data } = await supabase.from("threads").insert({ user_id: user.id, title: "New chat" }).select("id").single();
    if (data) {
      await loadThreads();
      navigate(`/app/${data.id}`);
    }
  };

  const deleteThread = async (id: string) => {
    await supabase.from("threads").delete().eq("id", id);
    const list = await loadThreads();
    if (id === threadId) {
      if (list && list.length > 0) navigate(`/app/${list[0].id}`);
      else navigate("/app");
    }
  };

  const exportPdf = () => {
    const html = `<!doctype html><html><head><title>Chat export</title><style>
      body{font-family:Inter,system-ui;padding:32px;max-width:760px;margin:auto;color:#0f172a}
      h1{color:#10B981;margin-bottom:24px}
      .m{margin:14px 0;padding:12px 16px;border-radius:12px;border:1px solid #e2e8f0}
      .u{background:#10B981;color:#fff;border-color:#10B981}
      .a{background:#f8fafc}
    </style></head><body><h1>PahadiCrop AI — Conversation</h1>${
      messages.map((m) => {
        const t = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
        return `<div class="m ${m.role === "user" ? "u" : "a"}"><b>${m.role === "user" ? "You" : "AgriAdvisor"}</b><br/>${t.replace(/\n/g, "<br/>")}</div>`;
      }).join("")
    }</body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  };

  const handleVoice = () => {
    const SR = (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition; SpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition
           || (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition;
    if (!SR) return toast({ title: "Voice not supported", description: "Your browser doesn't support speech input." });
    const rec = new SR();
    rec.lang = lang === "hi" ? "hi-IN" : "en-IN";
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const t = e.results[0][0].transcript;
      setInput((p) => (p ? p + " " : "") + t);
      taRef.current?.focus();
    };
    rec.start();
  };

  const filteredThreads = threads.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
  const showEmpty = (initialMessages?.length ?? 0) === 0 && messages.length === 0;

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* SIDEBAR */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="border-r bg-sidebar overflow-hidden shrink-0"
          >
            <div className="w-72 h-full flex flex-col">
              <div className="p-4 flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-forest p-1 shadow-md">
                  <img src={logo} alt="" className="h-full w-full" width={36} height={36} />
                </div>
                <div className="leading-none">
                  <div className="font-heading font-bold text-sm">PahadiCrop <span className="gradient-text">AI</span></div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Crop advisor</div>
                </div>
              </div>

              <div className="px-3">
                <Button onClick={newChat} className="w-full justify-start gap-2 rounded-xl bg-gradient-to-br from-primary to-forest hover:opacity-95 shadow-md">
                  <Plus className="h-4 w-4" /> New chat
                </Button>
              </div>

              <div className="px-3 mt-3 relative">
                <Search className="h-3.5 w-3.5 absolute left-5 top-2.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search chats"
                  className="w-full h-8 pl-7 pr-2 rounded-lg bg-card border text-xs focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>

              <div className="flex-1 overflow-y-auto px-2 mt-3 space-y-0.5">
                <div className="px-2 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Recent</div>
                {filteredThreads.length === 0 && (
                  <div className="px-3 py-6 text-xs text-muted-foreground text-center">No chats yet</div>
                )}
                {filteredThreads.map((t) => (
                  <div
                    key={t.id}
                    className={`group rounded-lg px-2 py-1.5 flex items-center gap-2 cursor-pointer transition-colors ${
                      t.id === threadId ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60"
                    }`}
                  >
                    <button onClick={() => navigate(`/app/${t.id}`)} className="flex-1 flex items-center gap-2 text-left min-w-0">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                      <span className="text-xs truncate">{t.title}</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteThread(t.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-opacity"
                      aria-label="Delete chat"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t space-y-1">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-xs flex items-center gap-2"><Languages className="h-3.5 w-3.5" /> Language</span>
                  <button onClick={() => setLang(lang === "en" ? "hi" : "en")} className="text-xs font-medium px-2 py-0.5 rounded-md bg-accent hover:bg-accent/70">
                    {lang === "en" ? "EN" : "हिं"}
                  </button>
                </div>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-xs flex items-center gap-2">{dark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />} Theme</span>
                  <button onClick={() => setDark(!dark)} className="text-xs font-medium px-2 py-0.5 rounded-md bg-accent hover:bg-accent/70">
                    {dark ? "Dark" : "Light"}
                  </button>
                </div>
                {user && (
                  <div className="flex items-center gap-2 px-2 pt-2 mt-1 border-t">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-forest text-primary-foreground text-[11px] font-semibold flex items-center justify-center">
                      {(user.user_metadata?.name ?? user.email ?? "U").toString()[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{user.user_metadata?.name ?? user.email}</div>
                    </div>
                    <button onClick={signOut} aria-label="Sign out" className="p-1.5 rounded-md hover:bg-accent">
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* topbar */}
        <header className="h-14 border-b flex items-center justify-between px-4 bg-background/60 backdrop-blur">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-accent" aria-label="Toggle sidebar">
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
            <div className="text-sm font-medium truncate max-w-[60vw]">
              {threads.find((t) => t.id === threadId)?.title ?? "PahadiCrop AI"}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={exportPdf} disabled={messages.length === 0}>
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </header>

        {/* messages */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
            {showEmpty && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-12 pb-6">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-forest p-2 shadow-md">
                  <img src={logo} alt="" className="h-full w-full" width={56} height={56} />
                </div>
                <h1 className="font-heading text-3xl font-bold mt-5 tracking-tight">
                  How can I help your <span className="gradient-text">crop</span> today?
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Describe a symptom, pest, or post-harvest question. I'm tuned for Uttarakhand mountain agriculture.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mt-8 text-left">
                  {SUGGESTED.map((s) => (
                    <button
                      key={s.text}
                      onClick={() => sendMessage({ text: s.text })}
                      className="group rounded-xl border bg-card p-4 hover:border-primary/40 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/15 to-sky/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <s.icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm">{s.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {!showEmpty && initialMessages === null && (
              <div className="space-y-3 pt-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            )}

            <AnimatePresence>
              {messages.map((m) => <ChatBubble key={m.id} m={m} />)}
            </AnimatePresence>

            {status === "submitted" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-forest flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="rounded-2xl rounded-tl-md bg-card border px-4 py-3 shadow-sm flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking…</span>
                </div>
              </motion.div>
            )}

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <p className="font-medium text-destructive">Something went wrong</p>
                <p className="text-muted-foreground mt-1">Unable to connect to AI service. Please try again.</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => regenerate()}>Retry</Button>
              </div>
            )}
          </div>
        </main>

        {/* composer */}
        <div className="border-t bg-background/80 backdrop-blur">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <form onSubmit={handleSubmit} className="relative">
              <div className="rounded-2xl border bg-card shadow-sm focus-within:border-primary/50 focus-within:shadow-md transition-all">
                <textarea
                  ref={taRef}
                  rows={1}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = Math.min(el.scrollHeight, 200) + "px";
                  }}
                  onKeyDown={handleKey}
                  placeholder={lang === "hi" ? "अपनी फसल के बारे में पूछें…" : "Ask about your crop…"}
                  disabled={!threadId}
                  className="w-full resize-none bg-transparent px-4 pt-3 pb-2 text-[15px] focus:outline-none placeholder:text-muted-foreground/70"
                  style={{ minHeight: 44 }}
                />
                <div className="flex items-center justify-between px-2 pb-2">
                  <button type="button" onClick={handleVoice} className="p-2 rounded-lg hover:bg-accent text-muted-foreground" aria-label="Voice">
                    <Mic className="h-4 w-4" />
                  </button>
                  <Button
                    type="submit"
                    size="icon-sm"
                    disabled={!input.trim() || isLoading || !threadId}
                    className="rounded-lg bg-gradient-to-br from-primary to-forest hover:opacity-95 disabled:opacity-40"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </form>
            <p className="text-[11px] text-center text-muted-foreground mt-2">
              AI-generated. Verify with a licensed agricultural extension officer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}