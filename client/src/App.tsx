import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import CountryDetailPage from "@/pages/country-detail";
import SearchPage from "@/pages/search";
import DestinationsPage from "@/pages/destinations";
import TripFlowPage from "@/pages/trip-flow";
import AssessPage from "@/pages/assess";
import MapPage from "@/pages/map";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/trip" component={TripFlowPage} />
      <Route path="/assess" component={AssessPage} />
      <Route path="/map" component={MapPage} />
      <Route path="/country/:id" component={CountryDetailPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/destinations" component={DestinationsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
