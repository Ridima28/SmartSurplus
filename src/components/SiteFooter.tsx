import { Twitter as TwitterIcon, Github as GithubIcon, Linkedin as LinkedinIcon, Mail, Leaf } from "lucide-react";
import logo from "@/assets/logo.png";

export default function SiteFooter() {
  return (
    <footer id="contact" className="border-t bg-gradient-to-b from-background to-accent/30">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-forest p-1 shadow-md">
                <img src={logo} alt="PahadiCrop AI" className="h-full w-full" width={36} height={36} loading="lazy" />
              </div>
              <span className="font-heading text-lg font-bold">PahadiCrop <span className="gradient-text">AI</span></span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              AI-powered crop advisory built for the field supervisors and farmers of Uttarakhand's mountain regions.
            </p>
            <div className="flex gap-2">
              {[TwitterIcon, LinkedinIcon, GithubIcon, Mail].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-lg border bg-card flex items-center justify-center hover:bg-accent transition-colors" aria-label="social">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: "Product", items: ["Features", "How it works", "Pricing", "Roadmap"] },
            { title: "Resources", items: ["Crop guides", "Disease library", "FAQ", "Changelog"] },
            { title: "Company", items: ["About", "Mission", "Press", "Contact"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.items.map((i) => (
                  <li key={i}><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{i}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} PahadiCrop AI. Built for mountain farmers.</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5 text-primary" />
            Responsible AI — Advice is AI-generated and should be verified with a licensed extension officer.
          </p>
        </div>
      </div>
    </footer>
  );
}