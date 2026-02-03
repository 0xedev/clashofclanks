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
      } catch (error) {
        console.error("Failed to initialize Mini App SDK:", error);
      }
    };

    initMiniApp();
  }, []);

  return <div className="mini-app-container">{children}</div>;
}
