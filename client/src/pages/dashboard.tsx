import PlayerTable from "@/components/player-table";
import RecentActivity from "@/components/recent-activity";

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PlayerTable />
      
      <div className="mt-8">
        <RecentActivity />
      </div>
    </div>
  );
}