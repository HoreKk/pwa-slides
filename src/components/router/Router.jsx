import { lazy, Suspense, useContext, useState } from 'react';
import { Outlet, useRoutes, BrowserRouter } from 'react-router-dom';
import { useAuthState } from '~/components/contexts/UserContext';
import { Container, Button, Heading, Flex, Skeleton, Link, Text } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { auth } from '../../lib/firebase';
import { NetworkStateContext } from '../contexts/NetworkStateContext';

const IndexScreen = lazy(() => import('~/components/screens/Index'));
const Page404Screen = lazy(() => import('~/components/screens/404'));
const ProjectScreen = lazy(() => import('~/components/screens/projects/Project'));

function Layout() {
  const { state } = useAuthState();
  const navigate = useNavigate();

  const { networkState } = useContext(NetworkStateContext);

  const handleSignOut = () => {
    auth.signOut();
    navigate('/');
  };

  const handleSignIn = () => {
    const provider = new GoogleAuthProvider();
    // @see https://firebase.google.com/docs/auth/web/google-signin
    auth.languageCode = 'fr';

    signInWithRedirect(auth, provider);
  };

  return (
    <>
      <Flex justify='space-between' align='center' p={4} bg={networkState ? 'orange.200' : 'grey'} w='full'>
        <Link href='/' style={{ textDecoration: 'none' }}>
          <Flex alignItems='center'>
            <Heading marginRight='5' size='lg'>Open Slide</Heading>
            {!networkState ? <Text fontSize='sm'>(Offline mode activated)</Text> : <></> }
          </Flex>
        </Link>
        <Skeleton isLoaded={state.state !== 'UNKNOWN'}>
          {state.state === 'SIGNED_OUT' ? (
            <Button onClick={handleSignIn} colorScheme='red' icon={<CloseIcon />}>
              Sign In with Google
            </Button>
          ) : (
            <Button onClick={handleSignOut} colorScheme='red' icon={<CloseIcon />}>
              Sign Out
            </Button>
          )}
        </Skeleton>
      </Flex>
      <Outlet />
      <Toaster />
    </>
  );
}

export const Router = () => {
  return (
    <BrowserRouter>
      <InnerRouter />
    </BrowserRouter>
  );
};

const InnerRouter = () => {
  const routes = [
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          element: <IndexScreen />,
        },
        {
          path: '/projects/:projectId',
          element: <ProjectScreen />,
        },
        {
          path: '*',
          element: <Page404Screen />,
        },
      ],
    },
  ];
  const element = useRoutes(routes);
  return (
    <div>
      <Suspense fallback={<Layout />}>{element}</Suspense>
    </div>
  );
};
