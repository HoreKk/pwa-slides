import { ChakraProvider } from '@chakra-ui/react';
import { HelmetProvider } from "react-helmet-async";
import 'react-quill/dist/quill.snow.css';
import { NetworkState } from '../contexts/NetworkStateContext';
import { AuthProvider } from "../contexts/UserContext";
import Main from "../root/Main";

export const App = () => {
  return (
    <HelmetProvider>
      <ChakraProvider>
        <AuthProvider>
          <NetworkState>
            <Main />
          </NetworkState>
        </AuthProvider>
      </ChakraProvider>
    </HelmetProvider>
  )
};
