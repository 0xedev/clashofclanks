import { Share2 } from "lucide-react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useState } from "react";

interface ShareButtonProps {
  title: string;
  url: string;
  description?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export function ShareButton({
  title,
  url,
  description,
  variant = "secondary",
  size = "md",
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    try {
      setIsSharing(true);

      // Construct full URL
      const fullUrl = url.startsWith("http")
        ? url
        : `https://clashofclanks.vercel.app${url}`;

      // Use Farcaster SDK to create a cast with the link
      const castText = description
        ? `${description}\n\n${fullUrl}`
        : `${title}\n\n${fullUrl}`;

      // Open compose cast with pre-filled text
      await sdk.actions.openUrl(
        `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}`,
      );
    } catch (error) {
      console.error("Failed to share:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const sizeClasses = {
    sm: "p-2 text-xs",
    md: "p-3 text-sm",
    lg: "p-4 text-base",
  };

  const variantClasses = {
    primary:
      "bg-primary-glow text-bg-deep hover:bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]",
    secondary:
      "bg-white/10 text-white border border-white/20 hover:bg-white/20",
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-xl font-bold transition-all
        flex items-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-[1.02] active:scale-[0.98]
      `}
    >
      <Share2 className="w-4 h-4" />
      <span>{isSharing ? "Sharing..." : "Share"}</span>
    </button>
  );
}
