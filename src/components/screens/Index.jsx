import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuthState } from '~/components/contexts/UserContext';
import { Head } from '~/components/shared/Head';
import { Flex, Heading, Button, SimpleGrid, Box, AspectRatio, LinkBox, LinkOverlay } from '@chakra-ui/react';
import { ref, push, onValue, child } from 'firebase/database';
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
      })
    }
  }, [authState]);

  useEffect(() => {
    if (authState.currentUser && networkState) {
      getIdbProjects().then(async (prjs) => {
        for (const project of prjs) {
          if (project.id.startsWith('idxDb-')) {
            console.log('🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩')
            console.log(project)
            console.log('🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦')
            await writeProject({
              userId: authState.currentUser.uid,
              name: project.name,
            })
            await unsetIdbProject(project.id);
          }
        }
      });
    }
  }, [authState, networkState]);

  // const first = useRef(true);
  // useEffect(() => {
  //   if (first.current) {
  //     first.current = false;
  //     return;
  //   }
  //   if (networkState) {
  //     getIdbProjects().then(async (prjs) => {
  //       await new Promise((resolve) => setTimeout(resolve, 2000));
  //       push(ref(database, `/workSpace-${state.currentUser.uid}/projects`), {
  //         "name": "New Project",
  //         "desc": "okok",
  //         "id": "idxDb-7dfa1825-318c-4f76-a27a-1939ec7e4c34"
  //       })
  //     })
  //   }

  // }, [networkState])

  async function createProject() {
    if (authState?.currentUser) {
      if (networkState) {
        const projectName = 'New Project';
        writeProject({
          userId: authState.currentUser.uid,
          name: projectName,
        })
      } else {
        const indexedDbId = `idxDb-${uuidv4()}`;
        setProjects([...projects, { name: 'New Project', id: indexedDbId }]);
      }
      toaster.success('Project created');
    }
  }

  return (
    <>
      <Head title="TOP PAGE" />
      <Flex flexDir="column" px={20} pt={12}>
        <Flex justify="space-between" align="center" w="full">
          <Heading>Mes présentations</Heading>
          <Button onClick={createProject} colorScheme="green">
            Add new project
          </Button>
        </Flex>
        <SimpleGrid minChildWidth="250px" spacing={12} mt={12}>
          {projects.map((project) => (
            <LinkBox as="article" key={project.id} maxW="250px" textAlign="center">
              <AspectRatio borderRadius="lg" ratio={1} bg="yellow.100">
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
