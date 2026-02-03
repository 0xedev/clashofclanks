import { sdk } from "@farcaster/frame-sdk";

interface NotificationParams {
  title: string;
  body: string;
  targetUrl?: string;
}

interface NotificationsSdk {
  requestPermission: () => Promise<string>;
  send: (params: NotificationParams) => Promise<void>;
}

const getNotifications = (): NotificationsSdk => {
  const notifications = (sdk as unknown as { notifications?: NotificationsSdk })
    .notifications;
  if (!notifications) {
    throw new Error("Notifications are not available in this environment");
  }
  return notifications;
};

export const useNotifications = () => {
  const requestPermission = async () => {
    try {
      const permission = await getNotifications().requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return false;
    }
  };

  const sendNotification = async (params: NotificationParams) => {
    try {
      await getNotifications().send(params);
      return true;
    } catch (error) {
      console.error("Failed to send notification:", error);
      return false;
    }
  };

  return {
    requestPermission,
    sendNotification,
  };
};
