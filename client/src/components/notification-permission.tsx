import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BellOff, X } from "lucide-react";
import { pushNotifications } from "@/lib/push-notifications";

export function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isVisible, setIsVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check current permission status
    if ('Notification' in window) {
      setPermission(Notification.permission);
      // Show prompt if permission is default (not asked yet)
      setIsVisible(Notification.permission === 'default');
    }
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const newPermission = await pushNotifications.requestPermission();
      setPermission(newPermission);
      setIsVisible(false);
      
      // Send test notification if granted
      if (newPermission === 'granted') {
        await pushNotifications.sendNotification(
          'Notifications Enabled!',
          {
            body: 'You\'ll now receive alerts about events and updates.',
            requireInteraction: false
          }
        );
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || !('Notification' in window)) {
    return null;
  }

  return (
    <Card className="border-fc-red/20 bg-fc-red/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-fc-red" />
            <CardTitle className="text-sm font-medium">Stay Updated</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 hover:bg-fc-red/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs">
          Get notified about events, training sessions, and important updates even when you're not using the app.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            onClick={handleRequestPermission}
            disabled={isRequesting}
            size="sm"
            className="bg-fc-red hover:bg-fc-red/90 text-white"
          >
            {isRequesting ? 'Requesting...' : 'Enable Notifications'}
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            size="sm"
            className="border-gray-300 hover:bg-gray-50"
          >
            Not Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function NotificationStatus() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  if (!('Notification' in window)) {
    return null;
  }

  const getStatusInfo = () => {
    switch (permission) {
      case 'granted':
        return {
          icon: <Bell className="h-4 w-4 text-green-600" />,
          text: 'Notifications enabled',
          color: 'text-green-600'
        };
      case 'denied':
        return {
          icon: <BellOff className="h-4 w-4 text-red-600" />,
          text: 'Notifications blocked',
          color: 'text-red-600'
        };
      default:
        return {
          icon: <Bell className="h-4 w-4 text-gray-500" />,
          text: 'Notifications not set',
          color: 'text-gray-500'
        };
    }
  };

  const status = getStatusInfo();

  return (
    <div className="flex items-center gap-2 text-sm">
      {status.icon}
      <span className={status.color}>{status.text}</span>
    </div>
  );
}