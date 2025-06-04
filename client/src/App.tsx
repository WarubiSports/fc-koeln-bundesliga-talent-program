import { useState, useEffect } from "react";
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
import HouseOrders from "@/pages/house-orders";
import AdminEvents from "@/pages/admin-events";
import Communications from "@/pages/communications";
import Landing from "@/pages/landing";
import SimpleLogin from "@/pages/simple-login";
import LoginForm from "@/pages/login-form";
import CompleteProfile from "@/pages/complete-profile";
import WaitingApproval from "@/pages/waiting-approval";
import Logout from "@/pages/logout";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, hasCompletedProfile, needsApproval, isAdmin } = useAuth();

  // Skip loading state for development
  if (isLoading) {
    return (
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/players" component={Players} />
        <Route path="/chores" component={Chores} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/food-orders" component={FoodOrders} />
        <Route path="/house-orders" component={HouseOrders} />
        <Route path="/admin-events" component={AdminEvents} />
        <Route path="/communications" component={Communications} />
        <Route component={Dashboard} />
      </Switch>
    );
  }

  // Show authenticated routes for all users in development
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={LoginForm} />
        <Route path="/simple-login" component={SimpleLogin} />
        <Route path="/logout" component={Logout} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // Always allow logout route
  if (window.location.pathname === '/logout') {
    return <Logout />;
  }

  // Redirect to profile completion if needed (non-admin users only)
  if (!hasCompletedProfile && !isAdmin) {
    return (
      <Switch>
        <Route path="/complete-profile" component={CompleteProfile} />
        <Route path="/logout" component={Logout} />
        <Route component={() => {
          window.location.href = "/complete-profile";
          return null;
        }} />
      </Switch>
    );
  }

  // Show waiting approval page for users who need approval
  if (needsApproval && !isAdmin) {
    return (
      <Switch>
        <Route path="/waiting-approval" component={WaitingApproval} />
        <Route path="/logout" component={Logout} />
        <Route component={() => {
          window.location.href = "/waiting-approval";
          return null;
        }} />
      </Switch>
    );
  }

  // Show main application for authenticated users
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/players" component={Players} />
      <Route path="/chores" component={Chores} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/food-orders" component={FoodOrders} />
      {isAdmin && <Route path="/house-orders" component={HouseOrders} />}
      <Route path="/communications" component={Communications} />
      {isAdmin && <Route path="/admin-events" component={AdminEvents} />}
      <Route path="/complete-profile" component={CompleteProfile} />
      <Route path="/waiting-approval" component={WaitingApproval} />
      <Route path="/logout" component={Logout} />
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
