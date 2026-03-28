import { Link, useLocation } from "react-router-dom";
import { Leaf, Home, PlusCircle, Users, Zap } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/donate", label: "Donate Food", icon: PlusCircle },
  { to: "/ngos", label: "NGOs", icon: Users },
  { to: "/matches", label: "Matches", icon: Zap },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold text-foreground">
            SmartSurplus <span className="text-primary">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
