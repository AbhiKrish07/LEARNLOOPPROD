import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DarwinityStoreProvider } from "./contexts/DarwinityStoreContext";
import { CompanionProvider } from "./contexts/CompanionContext";
import { AppLayout } from "./components/AppLayout";
import { useAuth } from "./_core/hooks/useAuth";

// Core LearnLoop Pages
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { VerifyEmailView } from "./pages/learnloop/VerifyEmailView";
import { OnboardingView } from "./pages/learnloop/OnboardingView";
import { LoadingView } from "./pages/learnloop/LoadingView";
import { CalibrationView } from "./pages/learnloop/CalibrationView";

import Library from "./pages/Library";
import { SearchView } from "./pages/learnloop/SearchView";
import { AgentsView } from "./pages/learnloop/AgentsView";
import { GrowthView } from "./pages/learnloop/GrowthView";
import { PathView } from "./pages/learnloop/PathView";

import { CheckMyWorkView } from "./pages/learnloop/CheckMyWorkView";
import { WhereItBreaksView } from "./pages/learnloop/WhereItBreaksView";
import { CourseMakerView } from "./pages/learnloop/CourseMakerView";
import { SimulationLabView } from "./pages/learnloop/SimulationLabView";
import { YourBrainView } from "./pages/learnloop/YourBrainView";
import { StudySessionView } from "./pages/learnloop/StudySessionView";
import { SettingsView } from "./pages/learnloop/SettingsView";
import { TypedDocumentView } from "./pages/learnloop/TypedDocumentView";
import { InfiniteCanvasView } from "./pages/learnloop/InfiniteCanvasView";

// Notebook View (Full-Bleed Canvas)
import { NotebookView } from "./pages/learnloop/NotebookView";
import NotFound from "./pages/NotFound";

function AuthenticatedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function RootRoute() {
  return <LandingPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRoute} />
      <Route path="/landing" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signin" component={LoginPage} />
      <Route path="/auth" component={LoginPage} />
      <Route path="/verify-email" component={VerifyEmailView} />
      <Route path="/onboarding" component={OnboardingView} />
      <Route path="/loading" component={LoadingView} />
      <Route path="/calibration" component={CalibrationView} />
      
      {/* Ecosystem Routes in Tano Light Layout */}
      <Route path="/dashboard">{() => <AuthenticatedRoute component={Library} />}</Route>
      <Route path="/library">{() => <AuthenticatedRoute component={Library} />}</Route>
      <Route path="/notebooks">{() => <AuthenticatedRoute component={Library} />}</Route>
      <Route path="/favorites">{() => <AuthenticatedRoute component={Library} />}</Route>
      <Route path="/search">{() => <AuthenticatedRoute component={SearchView} />}</Route>
      <Route path="/agents">{() => <AuthenticatedRoute component={AgentsView} />}</Route>
      <Route path="/growth">{() => <AuthenticatedRoute component={GrowthView} />}</Route>
      <Route path="/path">{() => <AuthenticatedRoute component={PathView} />}</Route>
      
      {/* Learning Tools */}
      <Route path="/check">{() => <AuthenticatedRoute component={CheckMyWorkView} />}</Route>
      <Route path="/where-it-breaks">{() => <AuthenticatedRoute component={WhereItBreaksView} />}</Route>
      <Route path="/retest">{() => <AuthenticatedRoute component={WhereItBreaksView} />}</Route>
      <Route path="/course-maker">{() => <AuthenticatedRoute component={CourseMakerView} />}</Route>
      <Route path="/simulation-lab">{() => <AuthenticatedRoute component={SimulationLabView} />}</Route>
      <Route path="/brain">{() => <AuthenticatedRoute component={YourBrainView} />}</Route>
      <Route path="/session">{() => <AuthenticatedRoute component={StudySessionView} />}</Route>
      <Route path="/settings">{() => <AuthenticatedRoute component={SettingsView} />}</Route>
      <Route path="/typed">{() => <AuthenticatedRoute component={TypedDocumentView} />}</Route>

      {/* Infinite Canvas */}
      <Route path="/canvas" component={InfiniteCanvasView} />

      {/* Full-Screen Goodnotes Digital Notebook Canvas */}
      <Route path="/notebook" component={NotebookView} />
      <Route path="/notebook/:id" component={NotebookView} />

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <DarwinityStoreProvider>
        <CompanionProvider>
          <ThemeProvider defaultTheme="light" switchable={false}>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </ThemeProvider>
        </CompanionProvider>
      </DarwinityStoreProvider>
    </ErrorBoundary>
  );
}
