import { useAuth } from "~/lib/firebase";
import { lazy, Suspense, useState } from 'react';
import { Outlet, useRoutes, BrowserRouter } from 'react-router-dom';
import { useAuthState } from '~/components/contexts/UserContext';
import { Container, Button, Heading, Flex, Skeleton, Link } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";

const IndexScreen = lazy(() => import('~/components/screens/Index'));
const Page404Screen = lazy(() => import('~/components/screens/404'));
const ProjectScreen = lazy(() => import('~/components/screens/projects/Project'));

function Layout() {
  const { state } = useAuthState();

  const handleSignOut = () => {
    const auth = useAuth();
    auth.signOut();
  };

  const handleSignIn = () => {
    const provider = new GoogleAuthProvider();
    const auth = useAuth();
    // @see https://firebase.google.com/docs/auth/web/google-signin
    auth.languageCode = 'fr';

    signInWithRedirect(auth, provider);
  };

  return (
    <>
      <Flex justify='space-between' align='center' p={4} bg='orange.200' w='full'>
        <Link href='/' style={{ textDecoration: 'none' }}>
          <Heading size='lg'>PWA Slides</Heading>
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
