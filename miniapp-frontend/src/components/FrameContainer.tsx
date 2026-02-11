import { type ReactNode, useEffect } from "react";
import { sdk } from "@farcaster/frame-sdk";

interface FrameContainerProps {
  children: ReactNode;
}

export function FrameContainer({ children }: FrameContainerProps) {
  useEffect(() => {
    const initMiniApp = async () => {
      try {
        await sdk.actions.ready();

        // Prompt user to add mini app and enable notifications
        // This allows the app to send push notifications to the user
        const result = await sdk.actions.addMiniApp();

        if (result.added) {
          console.log("Mini app added successfully, notifications enabled");
        }
      } catch (error) {
        console.error("Failed to initialize Mini App SDK:", error);
      }
    };

    initMiniApp();
  }, []);

  return <div className="mini-app-container">{children}</div>;
}
