import Header from "@/components/header";
import DashboardStats from "@/components/dashboard-stats";
import PlayerTable from "@/components/player-table";
import QuickActions from "@/components/quick-actions";
import RecentActivity from "@/components/recent-activity";
import AddPlayerModal from "@/components/add-player-modal";
import { useState } from "react";

export default function Dashboard() {
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardStats />
        
        <PlayerTable 
          onAddPlayer={() => setIsAddPlayerModalOpen(true)}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <QuickActions 
            onAddPlayer={() => setIsAddPlayerModalOpen(true)}
          />
          <RecentActivity />
        </div>
      </main>

      <AddPlayerModal
        isOpen={isAddPlayerModalOpen}
        onClose={() => setIsAddPlayerModalOpen(false)}
      />

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button className="flex flex-col items-center py-2 text-fc-red">
            <i className="fas fa-home text-lg mb-1"></i>
            <span className="text-xs">Dashboard</span>
          </button>
          <a href="/chores" className="flex flex-col items-center py-2 text-gray-600">
            <i className="fas fa-tasks text-lg mb-1"></i>
            <span className="text-xs">Chores</span>
          </a>
          <a href="/calendar" className="flex flex-col items-center py-2 text-gray-600">
            <i className="fas fa-calendar text-lg mb-1"></i>
            <span className="text-xs">Calendar</span>
          </a>
          <button className="flex flex-col items-center py-2 text-gray-600">
            <i className="fas fa-chart-bar text-lg mb-1"></i>
            <span className="text-xs">Analytics</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
