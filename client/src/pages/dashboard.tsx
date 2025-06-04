import PlayerTable from "@/components/player-table";
import QuickActions from "@/components/quick-actions";
import RecentActivity from "@/components/recent-activity";
import AddPlayerModal from "@/components/add-player-modal";
import { useState } from "react";

export default function Dashboard() {
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PlayerTable 
          onAddPlayer={() => setIsAddPlayerModalOpen(true)}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <QuickActions 
            onAddPlayer={() => setIsAddPlayerModalOpen(true)}
          />
          <RecentActivity />
        </div>
      </div>

      <AddPlayerModal
        isOpen={isAddPlayerModalOpen}
        onClose={() => setIsAddPlayerModalOpen(false)}
      />
    </>
  );
}