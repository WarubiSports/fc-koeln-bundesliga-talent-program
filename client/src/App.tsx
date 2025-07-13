import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/header";
import SectionOverview from "@/components/section-overview";
import { useAuth, AuthProvider } from "@/hooks/use-token-auth";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import Dashboard from "@/pages/dashboard";
import Players from "@/pages/players";
import Chores from "@/pages/chores";
import Calendar from "@/pages/calendar";
import FoodOrders from "@/pages/food-orders";
import HouseOrders from "@/pages/house-orders";
import Communications from "@/pages/communications";
import HouseManagement from "@/pages/house-management";
import AdminUsers from "@/pages/admin-users";
import AdminMembers from "@/pages/admin-members";
import TestProfile from "@/pages/test-profile";
import EmergencyTest from "@/pages/emergency-test";
import EditProfile from "@/pages/profile-new";
import Landing from "@/pages/landing";
import TokenLogin from "@/pages/token-login";
import Register from "@/pages/register";
import CompleteProfile from "@/pages/complete-profile";
import WaitingApproval from "@/pages/waiting-approval";
import PlayerRegistration from "@/pages/player-registration";
import Logout from "@/pages/logout";
import ResetPassword from "@/pages/reset-password";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();
  
  // Initialize push notifications for authenticated users
  usePushNotifications();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Show login page for unauthenticated users
  if (!user) {
    return (
      <Switch>
        <Route path="/" component={TokenLogin} />
        <Route path="/login" component={TokenLogin} />
        <Route path="/register" component={Register} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/logout" component={Logout} />
        <Route component={TokenLogin} />
      </Switch>
    );
  }

  // Show main application for authenticated users
  return (
    <div className="min-h-screen bg-gray-50" style={{ zoom: 1 }}>
      <Header />
      <main className="pb-20">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/players" component={Players} />
          <Route path="/chores" component={Chores} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/food-orders" component={FoodOrders} />
          <Route path="/house-orders" component={HouseOrders} />
          <Route path="/communications" component={Communications} />
          <Route path="/house-management" component={HouseManagement} />
          <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/members" component={AdminMembers} />
          <Route path="/test-page" component={TestProfile} />
          <Route path="/emergency-test" component={EmergencyTest} />
          <Route path="/edit-profile" component={EditProfile} />
          <Route path="/profile-test" component={EditProfile} />
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
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
