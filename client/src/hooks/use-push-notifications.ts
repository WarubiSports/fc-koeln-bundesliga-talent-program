import { useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pushNotifications } from '@/lib/push-notifications';
import { Notification } from '@shared/schema';

export function usePushNotifications() {
  // Listen for new notifications and send push notifications
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Keep track of processed notifications to avoid duplicates
  const processedNotifications = new Set<number>();

  const sendPushForNotification = useCallback(async (notification: Notification) => {
    if (processedNotifications.has(notification.id) || notification.isRead) {
      return;
    }

    processedNotifications.add(notification.id);

    try {
      switch (notification.type) {
        case 'event_reminder':
          await pushNotifications.sendEventNotification(
            notification.title,
            'Check your calendar for details',
            'Event Reminder'
          );
          break;
        case 'schedule_change':
          await pushNotifications.sendEventNotification(
            notification.title,
            notification.message,
            'Schedule Update'
          );
          break;
        case 'chore':
          await pushNotifications.sendChoreNotification(
            notification.title,
            notification.message
          );
          break;
        case 'message':
          await pushNotifications.sendMessageNotification(
            'Team Communication',
            notification.message
          );
          break;
        default:
          await pushNotifications.sendNotification(
            notification.title,
            {
              body: notification.message,
              data: { url: notification.actionUrl || '/' }
            }
          );
      }
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }, []);

  // Process new notifications
  useEffect(() => {
    if (!pushNotifications.isSupported() || !Array.isArray(notifications)) {
      return;
    }

    const unreadNotifications = notifications.filter((n: Notification) => !n.isRead);
    
    unreadNotifications.forEach(sendPushForNotification);
  }, [notifications, sendPushForNotification]);

  return {
    isSupported: pushNotifications.isSupported(),
    requestPermission: pushNotifications.requestPermission.bind(pushNotifications),
    sendTestNotification: () => pushNotifications.sendNotification(
      'Test Notification',
      { body: 'Push notifications are working!' }
    )
  };
}