import { Link, NavLink, useLocation } from "react-router-dom";
import { ShoppingCart, User, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const baseLinks = [
  { to: "/", label: "Нүүр" },
  { to: "/shop", label: "Дэлгүүр" },
];

const authLinks = [
  { to: "/orders", label: "Захиалга" },
  { to: "/account", label: "Хэрэглэгч" },
];

const adminLinks = [{ to: "/admin", label: "Админ" }];

const Navbar = () => {
  const { items } = useCart();
  const { user, profile, signInWithSteam, signOut } = useAuth();
  const loc = useLocation();

  const links = [
    ...baseLinks,
    ...(user ? authLinks : []),
    ...adminLinks,
  ];

  const handleSteamLogin = async () => {
    try {
      await signInWithSteam();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Алдаа гарлаа");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <span>UB<span className="text-primary">Skins</span></span>
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

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/account" className="hidden items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1.5 sm:flex">
                {profile?.avatar_url && (
                  <img src={profile.avatar_url} alt="" className="h-6 w-6 rounded-full" />
                )}
                <span className="text-xs font-medium">{profile?.display_name ?? "Хэрэглэгч"}</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Гарах">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="steam"
              size="sm"
              className="px-3"
              onClick={handleSteamLogin}
              aria-label="Steam-р нэвтрэх"
            >
              <User className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Steam-р нэвтрэх</span>
            </Button>
          )}
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
