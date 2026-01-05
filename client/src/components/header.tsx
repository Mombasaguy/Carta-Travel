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
    { href: "/assess", label: "Check Requirements", icon: ClipboardCheck },
    { href: "/advisories", label: "Advisories", icon: AlertTriangle },
  ];

  // Floating dock variant for map/home page
  if (variant === "floating") {
    return (
      <>
        {/* Floating Navigation Dock - Top Center */}
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] glass-dock rounded-full px-2 py-1.5 flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-full gap-2 transition-all ${
                    isActive 
                      ? "bg-white/20 dark:bg-white/10 text-foreground" 
                      : "text-bento-secondary hover:text-foreground"
                  }`}
                  data-testid={`link-nav-${link.label.toLowerCase().replace(" ", "-")}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">{link.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Floating Logo - Top Left */}
        <Link href="/" className="fixed top-4 left-4 z-[100] glass-bento rounded-xl px-3 py-2 flex items-center gap-2">
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

        {/* Floating Actions - Top Right */}
        <div className="fixed top-4 right-4 z-[100] glass-bento rounded-xl px-2 py-1.5 flex items-center gap-1">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </>
    );
  }

  // Default header for other pages
  return (
    <header className="sticky top-0 z-[100] w-full border-b border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
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
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className={location === link.href ? "bg-accent" : ""}
                  data-testid={`link-nav-${link.label.toLowerCase().replace(" ", "-")}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
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
        <div className="md:hidden border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-2xl">
          <nav className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${location === link.href ? "bg-accent" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`link-mobile-nav-${link.label.toLowerCase().replace(" ", "-")}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
