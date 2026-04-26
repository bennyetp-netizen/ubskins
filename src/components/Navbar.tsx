import { Link, NavLink, useLocation } from "react-router-dom";
import { ShoppingCart, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";

const links = [
  { to: "/", label: "Нүүр" },
  { to: "/shop", label: "Дэлгүүр" },
  { to: "/account", label: "Хэрэглэгч" },
  { to: "/admin", label: "Админ" },
];

const Navbar = () => {
  const { items } = useCart();
  const loc = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <span>SkinHub<span className="text-primary">.MN</span></span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative" aria-label="Сагс">
              <ShoppingCart className="h-5 w-5" />
              {items.length > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-primary p-0 text-[10px] text-primary-foreground">
                  {items.length}
                </Badge>
              )}
            </Button>
          </Link>
          <Button variant="steam" size="sm" className="hidden sm:inline-flex">
            <User className="mr-1.5 h-4 w-4" />
            Steam-р нэвтрэх
          </Button>
        </div>
      </nav>
      {/* mobile */}
      <div className="container flex gap-1 overflow-x-auto pb-2 md:hidden">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              loc.pathname === l.to ? "bg-secondary" : "text-muted-foreground"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
};

export default Navbar;
