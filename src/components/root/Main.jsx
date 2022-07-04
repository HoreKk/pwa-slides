import { useEffect } from 'react';
import { authChanged } from '../../lib/firebase';
import { useSignIn, useSignOut } from '../contexts/UserContext';
import { Router } from '../router/Router';

function Main() {
  const { signIn } = useSignIn();
  const { signOut } = useSignOut();

  useEffect(() => {

    authChanged((user) => {
      if (user) {
        signIn(user);
      } else {
        signOut();
      }
    });
  }, [authChanged]);

  return (
    <main>
      <Router />
    </main>
  );
}

export default Main;
