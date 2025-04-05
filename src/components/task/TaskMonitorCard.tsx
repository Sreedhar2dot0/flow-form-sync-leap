
import { useBackgroundTaskMonitor } from "@/hooks/useBackgroundTaskMonitor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Check, Loader2, RefreshCcw } from "lucide-react";

interface TaskMonitorCardProps {
  taskName: string;
  title: string;
  description?: string;
  applicationId: string;
}

export function TaskMonitorCard({ taskName, title, description, applicationId }: TaskMonitorCardProps) {
  const {
    status,
    message,
    result,
    startTask,
    isRunning,
    hasError,
    isComplete
  } = useBackgroundTaskMonitor(taskName, applicationId);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent>
        {isRunning ? (
          <div className="flex items-center text-muted-foreground">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <p className="text-sm">{message || `Processing ${taskName}...`}</p>
          </div>
        ) : hasError ? (
          <div className="flex items-start text-destructive">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
            <p className="text-sm">{message || `Error processing ${taskName}`}</p>
          </div>
        ) : isComplete && result ? (
          <div className="space-y-3">
            <div className="flex items-start text-success-500">
              <Check className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
              <p className="text-sm">{message || `${title} completed successfully`}</p>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <RenderResult result={result} taskName={taskName} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {status === 'idle' 
              ? `Click Start to begin ${title.toLowerCase()}`
              : message || `${title} status: ${status}`}
          </p>
        )}
      </CardContent>
      <CardFooter>
        {(hasError || status === 'idle') && (
          <Button 
            variant="outline"
            size="sm"
            onClick={startTask}
            disabled={isRunning}
            className="w-full"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            {hasError ? 'Retry' : 'Start'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'idle') {
    return <div className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">Ready</div>;
  }
  
  if (status === 'pending') {
    return <div className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded flex items-center">
      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
      Processing
    </div>;
  }
  
  if (status === 'success') {
    return <div className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded flex items-center">
      <Check className="h-3 w-3 mr-1" />
      Complete
    </div>;
  }
  
  if (status === 'error') {
    return <div className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded flex items-center">
      <AlertCircle className="h-3 w-3 mr-1" />
      Failed
    </div>;
  }
  
  return null;
}

function RenderResult({ result, taskName }: { result: any, taskName: string }) {
  if (taskName === 'creditBureauCheck' && result.score) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-xs font-medium">Credit Score</span>
          <span className="text-xs">{result.score}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-medium">Status</span>
          <span className="text-xs">{result.status}</span>
        </div>
        <div>
          <span className="text-xs font-medium">Top Factors</span>
          <div className="mt-1 space-y-1">
            {result.factors?.map((factor: string, i: number) => (
              <div key={i} className="text-xs bg-gray-50 px-2 py-1 rounded">
                {factor}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (taskName === 'documentVerification' && result.verified !== undefined) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-xs font-medium">Status</span>
          <span className="text-xs">{result.verified ? 'Verified' : 'Not Verified'}</span>
        </div>
        <div>
          <span className="text-xs font-medium">Documents</span>
          <div className="mt-1 space-y-1">
            {result.documents?.map((doc: string, i: number) => (
              <div key={i} className="text-xs bg-gray-50 px-2 py-1 rounded">
                {doc.replace('_', ' ')}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (taskName === 'autoOffer' && result.approved !== undefined) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-xs font-medium">Decision</span>
          <span className="text-xs">{result.approved ? 'Approved' : 'Rejected'}</span>
        </div>
        {result.approved && (
          <>
            <div className="flex justify-between">
              <span className="text-xs font-medium">Amount</span>
              <span className="text-xs">${result.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-medium">Interest Rate</span>
              <span className="text-xs">{result.rate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-medium">Term</span>
              <span className="text-xs">{result.term}</span>
            </div>
          </>
        )}
      </div>
    );
  }
  
  return <pre className="text-xs overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>;
}
