import { Link } from "wouter";
import { Globe, Mail, Twitter, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
                <Globe className="h-4 w-4" />
              </div>
              <span className="font-semibold">Carta Travel</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your trusted source for visa requirements and travel regulations worldwide.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" data-testid="link-twitter">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="link-github">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="link-email">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/destinations" className="hover-elevate rounded px-1 -mx-1 py-0.5" data-testid="link-footer-destinations">
                  All Destinations
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover-elevate rounded px-1 -mx-1 py-0.5" data-testid="link-footer-search">
                  Search Countries
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="text-muted-foreground/60">
                  About Us
                </span>
              </li>
              <li>
                <span className="text-muted-foreground/60">
                  Contact
                </span>
              </li>
              <li>
                <span className="text-muted-foreground/60">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get the latest travel requirement updates delivered to your inbox.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
                data-testid="input-newsletter-email"
              />
              <Button type="submit" data-testid="button-newsletter-subscribe">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            Data sourced from official government websites. Last updated: January 2026.
          </p>
          <p className="mt-2">
            2026 Carta Travel Requirements. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
