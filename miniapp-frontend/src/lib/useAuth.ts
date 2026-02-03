import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

interface UserProfile {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const authenticateUser = async () => {
      try {
        setIsLoading(true);

        const context = (sdk as unknown as { context?: any }).context;
        const resolved =
          typeof context?.then === "function" ? await context : context;

        if (!mounted) {
          return;
        }

        if (resolved?.user) {
          setUser({
            fid: resolved.user.fid,
            username: resolved.user.username,
            displayName: resolved.user.displayName,
            pfpUrl: resolved.user.pfpUrl,
          });
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          console.error("Authentication error:", err);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    authenticateUser();

    return () => {
      mounted = false;
    };
  }, []);

  return { user, isLoading, error };
}
