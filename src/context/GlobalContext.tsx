
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Define the types for our state
export type UserRole = 'Agent' | 'Manager' | 'Underwriter' | 'Admin';

export type User = {
  id: string;
  name: string;
  role: UserRole;
};

export type LoanType = 'Personal' | 'Home' | 'Auto' | 'Education';

export type Application = {
  id: string;
  loanType: LoanType;
  status: 'Draft' | 'In Progress' | 'Under Review' | 'Approved' | 'Rejected';
  amount: number;
};

export type Stage = 
  | 'lead-capture'
  | 'application'
  | 'document-upload'
  | 'underwriting'
  | 'approval';

export type SubStage = {
  id: string;
  title: string;
  requiresRole?: UserRole;
};

export type StageConfig = {
  id: Stage;
  title: string;
  subStages: SubStage[];
};

export type TaskStatus = 'idle' | 'pending' | 'success' | 'error';

export type BackgroundTask = {
  name: string;
  status: TaskStatus;
  message?: string;
  result?: any;
  createdAt: Date;
  completedAt?: Date;
};

export type GlobalState = {
  user: User | null;
  applications: Application[];
  selectedApplicationId: string | null;
  workflow: {
    stages: StageConfig[];
    currentStage: Stage;
    currentSubStageId: string;
  };
  ui: {
    modals: {
      [key: string]: boolean;
    };
    sidebarOpen: boolean;
  };
  networkStatus: {
    isOnline: boolean;
    lastOnlineAt: Date | null;
  };
  backgroundTasks: {
    [key: string]: BackgroundTask;
  };
};

// Action types
export type GlobalAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_APPLICATIONS'; payload: Application[] }
  | { type: 'SET_SELECTED_APPLICATION'; payload: string | null }
  | { type: 'SET_CURRENT_STAGE'; payload: Stage }
  | { type: 'SET_CURRENT_SUB_STAGE'; payload: string }
  | { type: 'TOGGLE_MODAL'; payload: { id: string; isOpen: boolean } }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_NETWORK_STATUS'; payload: { isOnline: boolean } }
  | { type: 'SET_TASK'; payload: { name: string; task: BackgroundTask } };

// Initial state
const stagesConfig: StageConfig[] = [
  {
    id: 'lead-capture',
    title: 'Lead Capture',
    subStages: [
      { id: 'basic-details', title: 'Basic Details' },
      { id: 'otp-verification', title: 'OTP Verification' }
    ]
  },
  {
    id: 'application',
    title: 'Application',
    subStages: [
      { id: 'primary-applicant', title: 'Primary Applicant' },
      { id: 'co-applicant', title: 'Co-Applicant' },
      { id: 'bureau-check', title: 'Credit Bureau Check' }
    ]
  },
  {
    id: 'document-upload',
    title: 'Document Upload',
    subStages: [
      { id: 'upload', title: 'Upload Documents' },
      { id: 'verification', title: 'Document Verification' },
      { id: 'auto-offer', title: 'Auto Loan Offer' }
    ]
  },
  {
    id: 'underwriting',
    title: 'Underwriting',
    subStages: [
      { id: 'risk-score', title: 'Risk Score & Rules' },
      { id: 'overrides', title: 'Underwriter Overrides', requiresRole: 'Manager' }
    ]
  },
  {
    id: 'approval',
    title: 'Approval',
    subStages: [
      { id: 'sanction', title: 'Sanction & Agreement' },
      { id: 'disbursement', title: 'Final Checklist & Disbursement' }
    ]
  }
];

const initialState: GlobalState = {
  user: null,
  applications: [],
  selectedApplicationId: null,
  workflow: {
    stages: stagesConfig,
    currentStage: 'lead-capture',
    currentSubStageId: 'basic-details',
  },
  ui: {
    modals: {},
    sidebarOpen: true,
  },
  networkStatus: {
    isOnline: navigator.onLine,
    lastOnlineAt: navigator.onLine ? new Date() : null,
  },
  backgroundTasks: {},
};

// Reducer function
const globalReducer = (state: GlobalState, action: GlobalAction): GlobalState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_APPLICATIONS':
      return { ...state, applications: action.payload };
    
    case 'SET_SELECTED_APPLICATION':
      return { ...state, selectedApplicationId: action.payload };
    
    case 'SET_CURRENT_STAGE':
      return { 
        ...state, 
        workflow: {
          ...state.workflow,
          currentStage: action.payload,
          // Set to first sub-stage of the new stage
          currentSubStageId: state.workflow.stages.find(
            stage => stage.id === action.payload
          )?.subStages[0].id || state.workflow.currentSubStageId
        } 
      };
    
    case 'SET_CURRENT_SUB_STAGE':
      return { 
        ...state, 
        workflow: {
          ...state.workflow,
          currentSubStageId: action.payload 
        }
      };
    
    case 'TOGGLE_MODAL':
      return { 
        ...state, 
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            [action.payload.id]: action.payload.isOpen
          }
        } 
      };
    
    case 'SET_SIDEBAR_OPEN':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarOpen: action.payload
        }
      };
    
    case 'SET_NETWORK_STATUS':
      return {
        ...state,
        networkStatus: {
          isOnline: action.payload.isOnline,
          lastOnlineAt: action.payload.isOnline ? new Date() : state.networkStatus.lastOnlineAt
        }
      };
    
    case 'SET_TASK':
      return {
        ...state,
        backgroundTasks: {
          ...state.backgroundTasks,
          [action.payload.name]: action.payload.task
        }
      };
    
    default:
      return state;
  }
};

// Create the context
export const GlobalContext = createContext<{
  state: GlobalState;
  dispatch: React.Dispatch<GlobalAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Create provider component
export const GlobalProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  // Network status effect
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_NETWORK_STATUS', payload: { isOnline: true } });
    };

    const handleOffline = () => {
      dispatch({ type: 'SET_NETWORK_STATUS', payload: { isOnline: false } });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mock demo data setup
  useEffect(() => {
    // Mock user
    const mockUser: User = {
      id: 'user-1',
      name: 'John Doe',
      role: 'Agent'
    };

    // Mock applications
    const mockApplications: Application[] = [
      {
        id: 'app-1',
        loanType: 'Personal',
        status: 'In Progress',
        amount: 25000
      },
      {
        id: 'app-2',
        loanType: 'Auto',
        status: 'Draft',
        amount: 35000
      }
    ];

    dispatch({ type: 'SET_USER', payload: mockUser });
    dispatch({ type: 'SET_APPLICATIONS', payload: mockApplications });
    dispatch({ type: 'SET_SELECTED_APPLICATION', payload: 'app-1' });
  }, []);

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook to use the global context
export const useGlobalState = () => {
  const context = useContext(GlobalContext);
  
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalProvider');
  }
  
  return context;
};
