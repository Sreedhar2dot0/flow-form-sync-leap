
import { useEffect, useState } from 'react';
import { useGlobalState, Stage } from '../context/GlobalContext';
import { useToast } from '@/hooks/use-toast';

export type FormData = {
  [key: string]: any;
};

export const useMultiStageForm = (applicationId?: string) => {
  const { state, dispatch } = useGlobalState();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({});
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'local' | 'syncing'>('synced');

  const { currentStage, currentSubStageId } = state.workflow;
  const stages = state.workflow.stages;
  
  const currentStageConfig = stages.find(s => s.id === currentStage);
  const currentSubStageIndex = currentStageConfig?.subStages.findIndex(
    ss => ss.id === currentSubStageId
  ) || 0;
  const currentSubStage = currentStageConfig?.subStages[currentSubStageIndex];
  
  // Load form data from localStorage on init
  useEffect(() => {
    if (applicationId) {
      const savedData = localStorage.getItem(`formData_${applicationId}`);
      if (savedData) {
        try {
          setFormData(JSON.parse(savedData));
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }
    }
  }, [applicationId]);

  // Handle online/offline sync
  useEffect(() => {
    if (isFormChanged) {
      // Save to localStorage regardless of online status
      if (applicationId) {
        localStorage.setItem(`formData_${applicationId}`, JSON.stringify(formData));
      }
      
      if (state.networkStatus.isOnline) {
        syncFormData();
      } else {
        setSyncStatus('local');
        toast({
          title: "You're working offline",
          description: "Changes saved locally and will sync when you're back online.",
          variant: "default",
        });
      }
    }
  }, [formData, isFormChanged, state.networkStatus.isOnline]);

  // Handle reconnection sync
  useEffect(() => {
    if (state.networkStatus.isOnline && syncStatus === 'local') {
      syncFormData();
    }
  }, [state.networkStatus.isOnline]);

  const syncFormData = async () => {
    if (!applicationId) return;
    
    setSyncStatus('syncing');
    
    // Simulate API call
    try {
      // This would be a real API call in production
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSyncStatus('synced');
      setIsFormChanged(false);
      
      toast({
        title: "Changes saved",
        description: "Your application has been updated.",
        variant: "default",
      });
    } catch (error) {
      setSyncStatus('local');
      
      toast({
        title: "Sync failed",
        description: "We couldn't save your changes to the server. They're saved locally.",
        variant: "destructive",
      });
    }
  };

  const updateField = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    setIsFormChanged(true);
  };

  const isSubStageValid = (subStageId?: string) => {
    const targetSubStage = subStageId || currentSubStageId;
    
    // Basic validation rules per sub-stage
    switch (targetSubStage) {
      case 'basic-details':
        return !!(formData.fullName && formData.email && formData.phone);
      
      case 'otp-verification':
        return !!(formData.otpVerified);
      
      case 'primary-applicant':
        return !!(formData.income && formData.employmentType);
      
      // Add more validation rules for other sub-stages
      
      default:
        return true;
    }
  };

  const canAccessSubStage = (subStageId: string) => {
    const stage = stages.find(s => 
      s.subStages.some(ss => ss.id === subStageId)
    );
    
    if (!stage) return false;
    
    const subStage = stage.subStages.find(ss => ss.id === subStageId);
    if (!subStage) return false;
    
    // Check role requirement
    if (subStage.requiresRole && state.user?.role !== subStage.requiresRole) {
      return false;
    }
    
    return true;
  };

  const nextSubStage = () => {
    if (!currentStageConfig) return;
    
    if (!isSubStageValid()) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentSubStageIndex < currentStageConfig.subStages.length - 1) {
      // Move to next sub-stage in current stage
      const nextSubStage = currentStageConfig.subStages[currentSubStageIndex + 1];
      
      if (canAccessSubStage(nextSubStage.id)) {
        dispatch({
          type: 'SET_CURRENT_SUB_STAGE',
          payload: nextSubStage.id
        });
      } else {
        toast({
          title: "Access Restricted",
          description: `You don't have permission to access ${nextSubStage.title}.`,
          variant: "destructive",
        });
      }
    } else {
      // Move to first sub-stage of next stage
      const currentStageIndex = stages.findIndex(s => s.id === currentStage);
      
      if (currentStageIndex < stages.length - 1) {
        const nextStage = stages[currentStageIndex + 1];
        const nextSubStage = nextStage.subStages[0];
        
        if (canAccessSubStage(nextSubStage.id)) {
          dispatch({
            type: 'SET_CURRENT_STAGE',
            payload: nextStage.id
          });
        } else {
          toast({
            title: "Access Restricted",
            description: `You don't have permission to access ${nextStage.title}.`,
            variant: "destructive",
          });
        }
      }
    }
  };

  const prevSubStage = () => {
    if (!currentStageConfig) return;
    
    if (currentSubStageIndex > 0) {
      // Move to previous sub-stage in current stage
      dispatch({
        type: 'SET_CURRENT_SUB_STAGE',
        payload: currentStageConfig.subStages[currentSubStageIndex - 1].id
      });
    } else {
      // Move to last sub-stage of previous stage
      const currentStageIndex = stages.findIndex(s => s.id === currentStage);
      
      if (currentStageIndex > 0) {
        const prevStage = stages[currentStageIndex - 1];
        const lastSubStage = prevStage.subStages[prevStage.subStages.length - 1];
        
        dispatch({
          type: 'SET_CURRENT_STAGE',
          payload: prevStage.id
        });
        
        dispatch({
          type: 'SET_CURRENT_SUB_STAGE',
          payload: lastSubStage.id
        });
      }
    }
  };

  const goToSubStage = (stageId: Stage, subStageId: string) => {
    if (canAccessSubStage(subStageId)) {
      dispatch({ type: 'SET_CURRENT_STAGE', payload: stageId });
      dispatch({ type: 'SET_CURRENT_SUB_STAGE', payload: subStageId });
    } else {
      toast({
        title: "Access Restricted",
        description: "You don't have permission to access this stage.",
        variant: "destructive",
      });
    }
  };

  return {
    currentStage,
    currentSubStage,
    nextSubStage,
    prevSubStage,
    goToSubStage,
    updateField,
    isSubStageValid,
    formData,
    syncStatus,
    stages
  };
};
