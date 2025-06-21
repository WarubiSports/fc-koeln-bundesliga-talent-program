import PlayerTable from "@/components/player-table";
import RecentActivity from "@/components/recent-activity";
import { NotificationPermission, NotificationStatus } from "@/components/notification-permission";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export default function Dashboard() {
  // Initialize push notifications
  usePushNotifications();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <NotificationPermission />
      </div>
      
      <PlayerTable />
      
      <div className="mt-8">
        <RecentActivity />
      </div>
      
      <div className="mt-4 flex justify-end">
        <NotificationStatus />
      </div>
    </div>
  );
}