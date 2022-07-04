import { useAuthState } from '~/components/contexts/UserContext';
import { Head } from '~/components/shared/Head';
import { Flex, Heading, Button, SimpleGrid, AspectRatio, LinkBox, LinkOverlay } from '@chakra-ui/react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import toaster from 'react-hot-toast';
import { getIdbProjects, setIdbProjects, unsetIdbProject } from '../../lib/idb';
import { uuidv4 } from '@firebase/util';
import { NetworkStateContext } from '../contexts/NetworkStateContext';
import { readProjects, writeProject } from '../../lib/firebase';

const useIndexedDb = (value, cb) => {
  const [state, setState] = useState(value);

  const updateState = useCallback((value) => {
    setState(value);
    cb(value);
  }, []);

  return [state, updateState];
};

function Index() {
  const { state: authState } = useAuthState();

  const { networkState } = useContext(NetworkStateContext);
  const [projects, setProjects] = useIndexedDb([], setIdbProjects);

  useEffect(() => {
    if (authState.currentUser) {
      readProjects(authState.currentUser.uid, (projects) => {
        setProjects(projects);
      });
    }
  }, [authState]);

  useEffect(() => {
    if (authState.currentUser && networkState) {
      getIdbProjects().then(async (prjs) => {
        for (const project of prjs) {
          if (project.id.startsWith('idxDb-')) {
            await writeProject({
              userId: authState.currentUser.uid,
              name: project.name,
            });
            await unsetIdbProject(project.id);
          }
        }
      });
    }
  }, [authState, networkState]);

  async function createProject() {
    if (authState?.currentUser) {
      if (networkState) {
        const projectName = 'New Project';
        writeProject({
          userId: authState.currentUser.uid,
          name: projectName,
        });
      } else {
        const indexedDbId = `idxDb-${uuidv4()}`;
        setProjects([...projects, { name: 'New Project', id: indexedDbId }]);
      }
      toaster.success('Project created');
    }
  }

  return (
    <>
      <Head title="Home" />
      <Flex flexDir="column" px={20} pt={12}>
        <Flex justify="space-between" align="center" w="full">
          <Heading>My presentations</Heading>
          <Button onClick={createProject} colorScheme="green">
            Add new project
          </Button>
        </Flex>
        <hr></hr>
        <SimpleGrid minChildWidth="240px" spacing={8} mt={12}>
          {projects.map((project) => (
            <LinkBox as="article" key={project.id} maxW="250px" textAlign="center">
              <AspectRatio borderRadius="lg" ratio={1} bg="yellow.100">
                <LinkOverlay as={RouterLink} to={`/workspace-${authState.currentUser.uid}/projects/${project.id}`}>
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
