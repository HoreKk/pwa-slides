import { useEffect, useState } from 'react';
import { useAuthState } from '~/components/contexts/UserContext';
import { Head } from '~/components/shared/Head';
import { Flex, Heading, Button, SimpleGrid, Box, AspectRatio } from '@chakra-ui/react';
import { useDatabase } from '~/lib/firebase';
import { ref, onValue } from "firebase/database";
import { useParams } from "react-router-dom";

function Project({ params }) {
  const { state } = useAuthState();
  const database = useDatabase()

  const { projectId } = useParams();
  const [project, setProject] = useState({});

  if (state.currentUser && !Object.values(project).length) {
    let refProject = ref(database, `workSpace-${state.currentUser.uid}/projects/${projectId}`)
    onValue(refProject, (snapshot) => setProject(snapshot.val()));
  }

  return (
    <>
      <Flex flexDir='column'>
        {project.name}
      </Flex>
    </>
  );
}

export default Project;
