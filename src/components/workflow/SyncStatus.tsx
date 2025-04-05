
import { Cloud, CloudOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

interface SyncStatusProps {
  status: 'synced' | 'local' | 'syncing';
  className?: string;
}

export function SyncStatus({ status, className }: SyncStatusProps) {
  const isOnline = useNetworkStatus();
  
  return (
    <div className={cn("flex items-center text-xs font-medium", className)}>
      {status === 'synced' && isOnline ? (
        <div className="flex items-center text-success-500">
          <Cloud className="h-3 w-3 mr-1" />
          <span>Saved to cloud</span>
        </div>
      ) : status === 'local' ? (
        <div className="flex items-center text-warning-500">
          <CloudOff className="h-3 w-3 mr-1" />
          <span>Saved locally{isOnline ? ' (will sync soon)' : ' (offline)'}</span>
        </div>
      ) : status === 'syncing' ? (
        <div className="flex items-center text-primary-500">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          <span>Syncing...</span>
        </div>
      ) : null}
    </div>
  );
}
