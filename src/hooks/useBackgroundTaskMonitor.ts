
import { useEffect, useState, useCallback } from 'react';
import { useGlobalState, TaskStatus } from '../context/GlobalContext';
import { useToast } from '@/hooks/use-toast';

export const useBackgroundTaskMonitor = (taskName: string, applicationId?: string) => {
  const { state, dispatch } = useGlobalState();
  const { toast } = useToast();
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  const isOnline = state.networkStatus.isOnline;
  const task = state.backgroundTasks[taskName];

  const updateTaskStatus = useCallback((status: TaskStatus, message?: string, result?: any) => {
    const now = new Date();
    
    dispatch({
      type: 'SET_TASK',
      payload: {
        name: taskName,
        task: {
          name: taskName,
          status,
          message,
          result,
          createdAt: task?.createdAt || now,
          completedAt: ['success', 'error'].includes(status) ? now : undefined
        }
      }
    });
    
    if (status === 'success') {
      toast({
        title: `${taskName} completed`,
        description: message || 'The task completed successfully.',
        variant: "default",
      });
    } else if (status === 'error') {
      setHasError(true);
      toast({
        title: `${taskName} failed`,
        description: message || 'There was an error completing the task.',
        variant: "destructive",
      });
    }
  }, [dispatch, taskName, task, toast]);

  const startTaskPolling = useCallback(() => {
    if (!isOnline) {
      updateTaskStatus('error', 'Cannot start task while offline');
      return;
    }
    
    if (!applicationId) {
      console.error('No application ID provided for background task');
      return;
    }
    
    // Clear any existing intervals
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    // Set initial state if no task exists
    if (!task) {
      updateTaskStatus('pending', 'Task started');
    } else {
      // Reset any existing task
      updateTaskStatus('pending', 'Task restarted');
    }
    
    setHasError(false);
    
    // Mock API polling - in a real implementation, this would
    // make actual API calls to check task status
    const interval = window.setInterval(() => {
      // Simulate task progress
      const mockProgress = Math.random();
      
      if (mockProgress < 0.7) {
        // Still processing
        updateTaskStatus('pending', `Processing ${taskName}...`);
      } else if (mockProgress < 0.95) {
        // Success
        clearInterval(interval);
        setPollingInterval(null);
        
        // Different mock results based on task name
        let result;
        if (taskName === 'creditBureauCheck') {
          result = { score: 720, status: 'APPROVED', factors: ['Payment History', 'Credit Utilization'] };
        } else if (taskName === 'documentVerification') {
          result = { verified: true, documents: ['id_proof', 'address_proof', 'income_proof'] };
        } else if (taskName === 'autoOffer') {
          result = { approved: true, amount: 35000, rate: '7.5%', term: '60 months' };
        }
        
        updateTaskStatus('success', `${taskName} completed successfully`, result);
      } else {
        // Error - simulating occasional failures
        clearInterval(interval);
        setPollingInterval(null);
        updateTaskStatus('error', `Error processing ${taskName}`);
      }
    }, 3000); // Poll every 3 seconds
    
    setPollingInterval(interval);
    
    // Clean up
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOnline, applicationId, updateTaskStatus, task, pollingInterval, taskName]);

  // Start or restart polling
  const startTask = useCallback(() => {
    setRetryCount(count => count + 1);
    startTaskPolling();
  }, [startTaskPolling]);

  // Initial start
  useEffect(() => {
    if (!task && applicationId && isOnline) {
      startTask();
    }
    
    // Clean up
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [applicationId, isOnline]);

  // Handle network status changes
  useEffect(() => {
    if (!isOnline && pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
      updateTaskStatus('error', 'Task interrupted - you are offline');
    } else if (isOnline && hasError && !pollingInterval) {
      // Auto restart when coming back online after error
      startTaskPolling();
    }
  }, [isOnline, hasError, pollingInterval, startTaskPolling, updateTaskStatus]);

  return {
    status: task?.status || 'idle',
    message: task?.message,
    result: task?.result,
    retryCount,
    startTask,
    isRunning: task?.status === 'pending',
    hasError: task?.status === 'error',
    isComplete: task?.status === 'success',
  };
};
