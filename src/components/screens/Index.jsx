import { useEffect, useState } from 'react';
import { useAuthState } from '~/components/contexts/UserContext';
import { Head } from '~/components/shared/Head';
import { Flex, Heading, Button, SimpleGrid, Box, AspectRatio, LinkBox, LinkOverlay } from '@chakra-ui/react';
import { useDatabase } from '~/lib/firebase';
import { ref, push, onValue } from "firebase/database";
import { Link as RouterLink } from 'react-router-dom';

function Index() {
  const { state } = useAuthState();
  const database = useDatabase()

  const [projects, setProjects] = useState([]);
  
  if (state.currentUser && !projects.length) {
    let refProjects = ref(database, `workSpace-${state.currentUser.uid}/projects`)
    onValue(refProjects, (snapshot) => {
      let tmpProjects = []
      Object.entries(snapshot.val()).forEach(([key, value]) => tmpProjects.push({ id: key, ...value }))
      setProjects(tmpProjects)
    });
  }

  function createProject() {
    if (state?.currentUser) {
      push(ref(database, `/workSpace-${state.currentUser.uid}/projects`), {
          name: "New Project",
      });
    }
  }

  return (
    <>
      <Head title="TOP PAGE" />
      <Flex flexDir='column'>
        <Flex justify='space-between' align='center' w='full'>
          <Heading>Mes présentations</Heading>
          <Button onClick={createProject} colorScheme='green'>
            Add new project
          </Button>
        </Flex>
        <SimpleGrid minChildWidth='200px' spacing={12} mt={12}>
          {projects.map((project) => (
            <LinkBox as='article' key={project.id}>
              <AspectRatio borderRadius='lg' ratio={1} bg='yellow.100'>
                <LinkOverlay as={RouterLink} to={`/projects/${project.id}`}>
                  <Heading>{project.name}</Heading>
                </LinkOverlay>
              </AspectRatio>
            </LinkBox>
          ))}
        </SimpleGrid>
      </Flex>
    </>
  );
}

export default Index;
