import { useRef, useState } from 'react';
import { useAuthState } from '~/components/contexts/UserContext';
import { Head } from '~/components/shared/Head';

function Index() {
  const { state } = useAuthState();

  return (
    <>
      <Head title="TOP PAGE" />
      <div>fsafsd</div>
    </>
  );
}

export default Index;
