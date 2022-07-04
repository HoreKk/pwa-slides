import { useAuthState } from '~/components/contexts/UserContext';
import { Head } from '~/components/shared/Head';
import { Flex, Heading, Button, Grid, AspectRatio, LinkBox, LinkOverlay, Text, Box } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import toaster from 'react-hot-toast';
import { getIdbProjects, setIdbProjects, unsetIdbProject } from '../../lib/idb';
import { uuidv4 } from '@firebase/util';
import { NetworkStateContext } from '../contexts/NetworkStateContext';
import { readProjects, writeProject, deleteProject } from '../../lib/firebase';

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
  const [editMode, setEditMode] = useState(false);

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

  async function removeProject(projectId) {
    if (authState?.currentUser) {
      if (networkState) {
        deleteProject({ userId: authState.currentUser.uid, projectId });
        setProjects([...projects.filter((project) => project.id !== projectId)]);
      } else {
        unsetIdbProject(projectId);
      }
      toaster.success('Project deleted successfully');
    }
  }

  return (
    <>
      <Head title="Home" />
      {authState && authState.currentUser && authState.currentUser.uid ? (
        <Flex flexDir="column" px={{ base: '20px', md: '26px', lg: '32px' }} mt={5}>
          <Box display={{ base: '', md: 'flex' }} justify={{ base: '', md: 'space-between' }} align="center" w="full">
            <Heading fontSize={{ base: '30px', md: '28px' }}>My presentations</Heading>
            <Box mt={{ base: '20px', md: '0px' }}>
              <Button
                fontSize={{ base: '14px', md: '16px' }}
                disabled={editMode}
                onClick={createProject}
                colorScheme="green"
              >
                Add new project
              </Button>
              <Button
                fontSize={{ base: '14px', md: '16px' }}
                mx={3}
                onClick={() => setEditMode(!editMode)}
                colorScheme="red"
              >
                {!editMode ? 'Delete project' : 'Delete mode'}
              </Button>
            </Box>
          </Box>
          <hr style={{ marginTop: '10px' }}></hr>
          <Grid mt={6} templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }} gap={8}>
            {projects.map((project) => (
              <LinkBox as="article" key={project.id} textAlign="center">
                {editMode ? (
                  <AspectRatio borderRadius="lg" boxShadow={'lg'} ratio={1} bg="yellow.50">
                    <LinkOverlay>
                      <div>
                        <Text fontSize={{ base: '14px', md: '16px', lg: '20px' }} wordBreak="break-word">
                          {project.name}
                        </Text>
                        <Button
                          style={{ marginTop: '20px' }}
                          onClick={() => removeProject(project.id)}
                          colorScheme="red"
                        >
                          <DeleteIcon></DeleteIcon>
                        </Button>
                      </div>
                    </LinkOverlay>
                  </AspectRatio>
                ) : (
                  <AspectRatio borderRadius="lg" boxShadow={'lg'} ratio={1} bg="gray.50">
                    <LinkOverlay as={RouterLink} to={`/workspace-${authState.currentUser.uid}/projects/${project.id}`}>
                      <Text fontSize={{ base: '14px', md: '16px', lg: '20px' }}>{project.name}</Text>
                    </LinkOverlay>
                  </AspectRatio>
                )}
              </LinkBox>
            ))}
          </Grid>
        </Flex>
      ) : (
        <Box m={6}>
          <Heading fontSize={{ base: '30px', md: '28px' }}>Welcome to OpenSlides</Heading>
          <p >
            Create slides in no time !<br></br> Stay on the same page, Easily follow the editing process. Colaborate simultaneously with others on your presentations.
          </p>
        </Box>
      )}
    </>
  );
}

export default Index;
