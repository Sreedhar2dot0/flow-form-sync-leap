
import { Check, ChevronRight } from "lucide-react";
import { useGlobalState, Stage, StageConfig, SubStage } from "@/context/GlobalContext";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  className?: string;
}

export function ProgressBar({ className }: ProgressBarProps) {
  const { state, dispatch } = useGlobalState();
  const { stages, currentStage, currentSubStageId } = state.workflow;

  // Get indices for visual representation
  const currentStageIndex = stages.findIndex(s => s.id === currentStage);
  const currentStageConfig = stages.find(s => s.id === currentStage);
  const currentSubStageIndex = currentStageConfig?.subStages.findIndex(
    ss => ss.id === currentSubStageId
  ) || 0;

  const handleStageClick = (stage: StageConfig, subStage: SubStage) => {
    // Check if the user can access this stage/sub-stage
    // In a real app, you would implement proper access control logic
    const canAccess = true; // Simplified for demo
    
    if (canAccess) {
      dispatch({ type: 'SET_CURRENT_STAGE', payload: stage.id });
      dispatch({ type: 'SET_CURRENT_SUB_STAGE', payload: subStage.id });
    }
  };

  return (
    <div className={cn("bg-white p-4 rounded-lg shadow-sm mb-6", className)}>
      <div className="flex flex-wrap items-center">
        {stages.map((stage, stageIdx) => {
          const isActive = stage.id === currentStage;
          const isCompleted = stageIdx < currentStageIndex;
          
          return (
            <div key={stage.id} className="flex items-center">
              {/* Stage indicator */}
              <div className="flex flex-col items-center">
                <div 
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center font-medium text-sm border-2",
                    isActive ? "border-primary-500 bg-primary-50 text-primary-700" : 
                    isCompleted ? "border-success-500 bg-success-50 text-success-500" : 
                    "border-gray-300 bg-gray-50 text-gray-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    stageIdx + 1
                  )}
                </div>
                <span 
                  className={cn(
                    "text-xs mt-1 font-medium",
                    isActive ? "text-primary-700" : 
                    isCompleted ? "text-success-500" : 
                    "text-gray-500"
                  )}
                >
                  {stage.title}
                </span>
              </div>
              
              {/* Only show sub-stages for active stage */}
              {isActive && (
                <div className="mx-2 flex items-center px-2 py-1 bg-gray-50 rounded-md">
                  {stage.subStages.map((subStage, subIdx) => {
                    const isSubActive = subStage.id === currentSubStageId;
                    const isSubCompleted = subIdx < currentSubStageIndex;
                    
                    return (
                      <div key={subStage.id} className="flex items-center">
                        <button
                          onClick={() => handleStageClick(stage, subStage)}
                          className={cn(
                            "flex items-center text-xs px-2 py-1 rounded",
                            isSubActive ? "bg-primary-500 text-white" : 
                            isSubCompleted ? "text-success-500" : 
                            "text-gray-500 hover:bg-gray-100"
                          )}
                          disabled={subStage.requiresRole && state.user?.role !== subStage.requiresRole}
                        >
                          {isSubCompleted ? (
                            <Check className="h-3 w-3 mr-1" />
                          ) : null}
                          {subStage.title}
                        </button>
                        
                        {/* Divider between sub-stages */}
                        {subIdx < stage.subStages.length - 1 && (
                          <ChevronRight className="h-3 w-3 mx-1 text-gray-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Connecting line between stages */}
              {stageIdx < stages.length - 1 && (
                <div className={cn(
                  "h-0.5 w-8 mx-2",
                  stageIdx < currentStageIndex ? "bg-success-500" : "bg-gray-300"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
