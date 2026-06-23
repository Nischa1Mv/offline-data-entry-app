import React, { createContext, useEffect, useRef, useState, useContext } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { processQueue } from '../services/submissionService';

interface NetworkContextProps {
  isConnected: boolean;
}

const NetworkContext = createContext<NetworkContextProps>({
  isConnected: true,
});

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const wasConnected = useRef(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected !== false;
      const cameOnline = online && !wasConnected.current;
      wasConnected.current = online;
      setIsConnected(online);

      if (cameOnline) {
        console.log('[Network] Back online — flushing pending queue');
        processQueue().catch(e => console.warn('[Network] Auto-submit failed:', e));
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
