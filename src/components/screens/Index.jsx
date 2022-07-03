import { useState } from 'react';
import { useAuthState } from '~/components/contexts/UserContext';
import { Head } from '~/components/shared/Head';
import { Flex, Heading, Button, SimpleGrid, Text, AspectRatio, LinkBox, LinkOverlay } from '@chakra-ui/react';
import { useDatabase } from '~/lib/firebase';
import { ref, push, onValue } from "firebase/database";
import { Link as RouterLink } from 'react-router-dom';
import toaster from "react-hot-toast";

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
          name: `New Project ${projects.length + 1}`,
      });
      toaster.success('Project created');
    }
  }

  return (
    <>
      <Head title="Home" />
      <Flex flexDir='column' px={20} pt={12}>
        <Flex justify='space-between' align='center' w='full'>
          <Heading>My presentations</Heading>
          <Button onClick={createProject} colorScheme='green'>
            Add new project
          </Button>
        </Flex>
        <hr></hr>
        <SimpleGrid minChildWidth='240px' spacing={8} mt={12}>
          {projects.map((project) => (
            <LinkBox as='article' key={project.id} maxW="250px" textAlign='center'>
              <AspectRatio borderRadius='lg' ratio={1} bg='yellow.50' border='1px'>
                <LinkOverlay as={RouterLink} to={`/projects/${project.id}`}>
                  <Text fontSize={20} fontWeight={300}>{project.name}</Text>
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
