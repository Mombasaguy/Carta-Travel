import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Plane, FileCheck, ShieldCheck, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const springTransition = { type: "spring", stiffness: 280, damping: 30 };

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4" data-testid="text-hero-title">
            Travel Requirements
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Check visa and entry requirements for your next business trip. Get Carta policy guidance and generate invitation letters.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.1 }}
        >
          <Card className="overflow-visible bg-surface border-border/40 rounded-2xl shadow-soft mb-8">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Plane className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Check Trip Requirements</CardTitle>
              <CardDescription className="mt-2">
                Enter your citizenship, destination, and travel dates to see what you need.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <div className="flex justify-center">
                <Link href="/assess">
                  <Button size="lg" className="gap-2" data-testid="button-start-assessment">
                    Start Assessment <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <Card className="overflow-visible bg-surface border-border/40 rounded-xl">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="mx-auto w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center mb-3">
                <FileCheck className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-sm mb-1">Visa Requirements</h3>
              <p className="text-xs text-muted-foreground">Entry authorization and documentation</p>
            </CardContent>
          </Card>

          <Card className="overflow-visible bg-surface border-border/40 rounded-xl">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="mx-auto w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center mb-3">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-sm mb-1">Carta Policy</h3>
              <p className="text-xs text-muted-foreground">Corporate travel guidelines</p>
            </CardContent>
          </Card>

          <Card className="overflow-visible bg-surface border-border/40 rounded-xl">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="mx-auto w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center mb-3">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-sm mb-1">Invitation Letters</h3>
              <p className="text-xs text-muted-foreground">Official business documentation</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...springTransition, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-muted-foreground">
            Requirements are verified against official sources. Last updated January 2026.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
