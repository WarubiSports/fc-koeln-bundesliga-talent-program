// Push notification service for browser notifications
export class PushNotificationService {
  private static instance: PushNotificationService;
  
  private constructor() {}
  
  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // Request permission for notifications
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    
    return permission;
  }

  // Check if notifications are supported and permission is granted
  isSupported(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  // Send a notification
  async sendNotification(title: string, options: {
    body?: string;
    icon?: string;
    tag?: string;
    data?: any;
    requireInteraction?: boolean;
  } = {}): Promise<void> {
    if (!this.isSupported()) {
      console.warn('Notifications are not supported or permission not granted');
      return;
    }

    const defaultOptions = {
      icon: '/generated-icon.png',
      badge: '/generated-icon.png',
      requireInteraction: false,
      ...options
    };

    const notification = new Notification(title, defaultOptions);

    // Auto-close notification after 5 seconds unless requireInteraction is true
    if (!defaultOptions.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    // Handle click events
    notification.onclick = () => {
      window.focus();
      notification.close();
      
      // Navigate to relevant page if data contains URL
      if (options.data?.url) {
        window.location.href = options.data.url;
      }
    };
  }

  // Send event notification
  async sendEventNotification(eventTitle: string, eventTime: string, eventType: string): Promise<void> {
    const title = `FC Köln Event: ${eventTitle}`;
    const body = `${eventType} scheduled for ${eventTime}`;
    
    await this.sendNotification(title, {
      body,
      tag: 'event-notification',
      data: { url: '/calendar' },
      requireInteraction: true
    });
  }

  // Send chore notification
  async sendChoreNotification(choreTitle: string, house: string): Promise<void> {
    const title = `New Chore Assignment`;
    const body = `${choreTitle} in ${house}`;
    
    await this.sendNotification(title, {
      body,
      tag: 'chore-notification',
      data: { url: '/chores' }
    });
  }

  // Send message notification
  async sendMessageNotification(from: string, preview: string): Promise<void> {
    const title = `New Message from ${from}`;
    const body = preview.length > 50 ? preview.substring(0, 50) + '...' : preview;
    
    await this.sendNotification(title, {
      body,
      tag: 'message-notification',
      data: { url: '/communications' }
    });
  }
}

export const pushNotifications = PushNotificationService.getInstance();