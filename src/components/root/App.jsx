import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { HelmetProvider } from "react-helmet-async";
import 'react-quill/dist/quill.snow.css';
import { NetworkState } from '../contexts/NetworkStateContext';
import { AuthProvider } from "../contexts/UserContext";
import Main from "../root/Main";

const theme = extendTheme({
  styles: {
    global: () => ({
      body: {
        bg: "#EEEEEE;",
      },
    }),
  },
});

export const App = () => {
  return (
    <HelmetProvider>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <NetworkState>
            <Main />
          </NetworkState>
        </AuthProvider>
      </ChakraProvider>
    </HelmetProvider>
  )
};
