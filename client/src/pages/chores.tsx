
import HouseRules from "@/components/house-rules";
import ChoresList from "@/components/chores-list";
import ChoreStats from "@/components/chore-stats";
import AddChoreModal from "@/components/add-chore-modal";
import { useState } from "react";

export default function Chores() {
  const [isAddChoreModalOpen, setIsAddChoreModalOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HouseRules />
        
        <ChoreStats />
        
        <ChoresList 
          onAddChore={() => setIsAddChoreModalOpen(true)}
        />
      </main>

      <AddChoreModal
        isOpen={isAddChoreModalOpen}
        onClose={() => setIsAddChoreModalOpen(false)}
      />

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2">
        <div className="flex justify-around">
          <a href="/" className="flex flex-col items-center py-2 text-gray-600">
            <i className="fas fa-home text-lg mb-1"></i>
            <span className="text-xs">Dashboard</span>
          </a>
          <a href="/players" className="flex flex-col items-center py-2 text-gray-600">
            <i className="fas fa-users text-lg mb-1"></i>
            <span className="text-xs">Players</span>
          </a>
          <button className="flex flex-col items-center py-2 text-fc-red">
            <i className="fas fa-home text-lg mb-1"></i>
            <span className="text-xs">Housing</span>
          </button>
          <a href="/food-orders" className="flex flex-col items-center py-2 text-gray-600">
            <i className="fas fa-shopping-cart text-lg mb-1"></i>
            <span className="text-xs">Groceries</span>
          </a>
          <a href="/communications" className="flex flex-col items-center py-2 text-gray-600">
            <i className="fas fa-comments text-lg mb-1"></i>
            <span className="text-xs">Messages</span>
          </a>
          <a href="/calendar" className="flex flex-col items-center py-2 text-gray-600">
            <i className="fas fa-calendar text-lg mb-1"></i>
            <span className="text-xs">Calendar</span>
          </a>
        </div>
      </nav>
    </div>
  );
}