import { Link, useLocation } from "wouter";
import { Menu, X, Home, ClipboardCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBell } from "./notification-bell";
import { useState } from "react";
import cartaLogo from "@assets/image_1767488150902.png";

interface HeaderProps {
  variant?: "default" | "floating";
}

export function Header({ variant = "default" }: HeaderProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/assess", label: "Requirements", icon: ClipboardCheck },
    { href: "/advisories", label: "Advisories", icon: AlertTriangle },
  ];

  if (variant === "floating") {
    return null;
  }

  return (
    <header className="sticky top-0 z-[100] w-full glass-bento border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 spring-transition hover:opacity-80">
            <img 
              src={cartaLogo} 
              alt="Carta" 
              className="h-8 w-auto object-contain"
              data-testid="img-carta-logo"
            />
            <span className="font-semibold text-lg hidden sm:inline-block" data-testid="text-logo">
              Travel
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    className={`gap-2 spring-transition ${
                      isActive 
                        ? "bg-white/10 dark:bg-white/5" 
                        : ""
                    }`}
                    data-testid={`link-nav-${link.label.toLowerCase().replace(" ", "-")}`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 glass-bento">
          <nav className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-2 ${location === link.href ? "bg-white/10" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`link-mobile-nav-${link.label.toLowerCase().replace(" ", "-")}`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

export function FloatingDock() {
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/assess", label: "Requirements", icon: ClipboardCheck },
    { href: "/advisories", label: "Advisories", icon: AlertTriangle },
  ];

  return (
    <nav className="glass-dock rounded-full px-3 py-2 flex items-center gap-1">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = location === link.href || (link.href === "/" && location === "/map");
        return (
          <Link key={link.href} href={link.href}>
            <button
              className={`flex items-center gap-2.5 px-4 py-2 rounded-full spring-transition ${
                isActive 
                  ? "bg-white/15 dark:bg-white/10 text-foreground" 
                  : "text-bento-secondary hover:text-foreground hover:bg-white/8 dark:hover:bg-white/5"
              }`}
              data-testid={`link-nav-${link.label.toLowerCase().replace(" ", "-")}`}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span className="hidden sm:inline text-sm font-medium">{link.label}</span>
            </button>
          </Link>
        );
      })}
    </nav>
  );
}

export function FloatingLogo() {
  return (
    <Link href="/" className="glass-bento rounded-xl px-3 py-2 flex items-center gap-2 spring-transition">
      <img 
        src={cartaLogo} 
        alt="Carta" 
        className="h-6 w-auto object-contain"
        data-testid="img-carta-logo"
      />
      <span className="text-bento-primary text-sm font-medium hidden sm:inline" data-testid="text-logo">
        Travel
      </span>
    </Link>
  );
}

export function FloatingActions() {
  return (
    <div className="glass-bento rounded-xl px-2 py-1.5 flex items-center gap-1">
      <NotificationBell />
      <ThemeToggle />
    </div>
  );
}
