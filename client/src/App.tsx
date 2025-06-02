import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import Players from "@/pages/players";
import Chores from "@/pages/chores";
import Calendar from "@/pages/calendar";
import FoodOrders from "@/pages/food-orders";
import AdminEvents from "@/pages/admin-events";
import Communications from "@/pages/communications";
import Landing from "@/pages/landing";
import SimpleLogin from "@/pages/simple-login";
import LoginForm from "@/pages/login-form";
import CompleteProfile from "@/pages/complete-profile";
import WaitingApproval from "@/pages/waiting-approval";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={LoginForm} />
          <Route path="/simple-login" component={SimpleLogin} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/players" component={Players} />
          <Route path="/chores" component={Chores} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/food-orders" component={FoodOrders} />
          <Route path="/admin-events" component={AdminEvents} />
          <Route path="/communications" component={Communications} />
          <Route path="/complete-profile" component={CompleteProfile} />
          <Route path="/waiting-approval" component={WaitingApproval} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
