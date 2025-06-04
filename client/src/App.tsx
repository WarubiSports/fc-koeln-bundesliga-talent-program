import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/header";
import SectionOverview from "@/components/section-overview";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import Players from "@/pages/players";
import Chores from "@/pages/chores";
import Calendar from "@/pages/calendar-fixed";
import FoodOrders from "@/pages/food-orders";
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pb-20">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/players" component={Players} />
          <Route path="/chores" component={Chores} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/food-orders" component={FoodOrders} />
          <Route path="/communications" component={Communications} />
          <Route path="/complete-profile" component={CompleteProfile} />
          <Route path="/waiting-approval" component={WaitingApproval} />
          <Route path="/logout" component={Logout} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <SectionOverview />
    </div>
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
