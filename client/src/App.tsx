import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import Chores from "@/pages/chores";
import Calendar from "@/pages/calendar";
import FoodOrders from "@/pages/food-orders";
import AdminEvents from "@/pages/admin-events";
import Landing from "@/pages/landing";
import SimpleLogin from "@/pages/simple-login";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/simple-login" component={SimpleLogin} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/chores" component={Chores} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/food-orders" component={FoodOrders} />
          <Route path="/admin-events" component={AdminEvents} />
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
