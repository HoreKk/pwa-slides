import { createContext, useEffect, useState } from 'react';
import toaster from 'react-hot-toast';

export const NetworkStateContext = createContext({
  networkState: true,
  setNetworkState: () => { }
});


export const NetworkState = ({ children }) => {
  const [networkState, setNetworkState] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(true);

  useEffect(() => {
    const handleNetwork = ({ detail }) => {
      if (!detail) {
        setIsFirstTime(false)
      }
      setNetworkState(detail)
    }
    document.addEventListener("connection-changed", handleNetwork);
    return () => {
      document.removeEventListener("connection-changed", handleNetwork)
    }
  })

  useEffect(() => {
    if (networkState) {
      if (!isFirstTime) {
        toaster.success('Your connection network is back !');
      }

    } else {
      toaster.error('Your connection network is lost, offline mode is activated'); 
    }
  }, [networkState])

  return (
    <NetworkStateContext.Provider value={{ networkState, setNetworkState }}>
      {children}
    </NetworkStateContext.Provider>
  );
}