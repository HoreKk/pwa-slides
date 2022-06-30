import {HelmetProvider} from "react-helmet-async";
import {AuthProvider} from "../contexts/UserContext";
import { ChakraProvider } from '@chakra-ui/react'
import Main from "../root/Main";
import 'react-quill/dist/quill.snow.css';

export const App = () => {
  return (
    <HelmetProvider>
      <ChakraProvider>
        <AuthProvider>
          <Main />
        </AuthProvider>
      </ChakraProvider>
    </HelmetProvider>
  )
};
