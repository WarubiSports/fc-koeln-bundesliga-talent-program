import HouseRules from "@/components/house-rules";
import ChoresList from "@/components/chores-list";
import ChoreStats from "@/components/chore-stats";
import AddChoreModal from "@/components/add-chore-modal";
import { useState } from "react";

export default function Chores() {
  const [isAddChoreModalOpen, setIsAddChoreModalOpen] = useState(false);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HouseRules />
        <ChoreStats />
        <ChoresList 
          onAddChore={() => setIsAddChoreModalOpen(true)}
        />
      </div>

      <AddChoreModal
        isOpen={isAddChoreModalOpen}
        onClose={() => setIsAddChoreModalOpen(false)}
      />
    </>
  );
}