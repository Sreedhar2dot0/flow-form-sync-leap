
import { useState, useEffect } from 'react';
import { useGlobalState } from '../context/GlobalContext';

export const useNetworkStatus = () => {
  const { state, dispatch } = useGlobalState();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      dispatch({ 
        type: 'SET_NETWORK_STATUS',
        payload: { isOnline: online }
      });
    };

    updateOnlineStatus();
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [dispatch]);

  return isOnline;
};
