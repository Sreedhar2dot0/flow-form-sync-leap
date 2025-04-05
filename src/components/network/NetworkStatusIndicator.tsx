
import { Wifi, WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { cn } from "@/lib/utils";

interface NetworkStatusIndicatorProps {
  className?: string;
}

export function NetworkStatusIndicator({ className }: NetworkStatusIndicatorProps) {
  const isOnline = useNetworkStatus();
  
  return (
    <div className={cn("flex items-center", className)}>
      {isOnline ? (
        <div className="flex items-center text-success-500">
          <Wifi className="h-4 w-4 mr-2" />
          <span className="text-xs font-medium">Online</span>
        </div>
      ) : (
        <div className="flex items-center text-warning-500">
          <WifiOff className="h-4 w-4 mr-2" />
          <span className="text-xs font-medium">Offline</span>
        </div>
      )}
    </div>
  );
}
