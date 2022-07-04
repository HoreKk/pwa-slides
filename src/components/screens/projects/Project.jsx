import { useState, useEffect } from 'react';
import { useAuthState } from '~/components/contexts/UserContext';
// import { Head } from '~/components/shared/Head';
import { Presentation } from './Reveal';
import { AspectRatio, Box, Button, Flex, Heading, Skeleton, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
import { onValue, push, ref, remove, update } from "firebase/database";
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import { useParams } from "react-router-dom";
import { database } from '../../../lib/firebase';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline','strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    [{ 'color': [] }],
    ['link', 'image'],
    ['clean']
  ],
}

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'color'
]

function Project() {
  const { state } = useAuthState();

  const { userId, projectId } = useParams();
  const [project, setProject] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedSlideId, setSelectedSlideId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [projectName, setProjectName] = useState('Untitled Project');

  if (state.currentUser && !Object.values(project).length) {
    let refProject = ref(database, `workSpace-${userId}/projects/${projectId}`)
    let firstLoad = false;
    let firstSlideInitialized = false;
    onValue(refProject, async (snapshot) => {
      let { slides, ...tmpProject } = snapshot.val();
      let tmpSlides = [];
      if (!slides && !firstSlideInitialized) {
        firstSlideInitialized = true;
        await push(ref(database, `/workSpace-${userId}/projects/${projectId}/slides`), {
          name: 'New Slide',
          content: '',
        });
      }
      if (slides) {
        Object.entries(slides).forEach(([key, value]) => tmpSlides.push({ id: key, ...value }));
        setProject({ ...tmpProject, slides: tmpSlides });
        setProjectName(tmpProject.name);
        if (!firstLoad) {
          setSelectedSlideId(tmpSlides[0].id);
          firstLoad = true;
          setIsLoaded(true);
        }
      }
    });
  }

  function addSlide() {
    push(ref(database, `/workSpace-${userId}/projects/${projectId}/slides`), {
      name: "New Slide",
      content: "",
    });
    toast.success('Slide added');
  }

  function changeContentSlide(id, content) {
    update(ref(database, `/workSpace-${userId}/projects/${projectId}/slides/${id}`), {
      content,
    });
  }

  function deleteSlide() {
    if (project.slides.length > 1) {
      remove(ref(database, `/workSpace-${userId}/projects/${projectId}/slides/${selectedSlideId}`));
      setSelectedSlideId(project.slides[findSlideSelected() === 0 ? 1 : 0].id)
      document.getElementById(`tabs-:r0:--tab-0`).click();
    } else {
      toast.error('You need at least one slide');
    }
  }

  function findSlideSelected() {
    return project.slides.findIndex((slide) => slide.id === selectedSlideId);
  }

  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // Event listener for fullscreen change
  useEffect(() => {
    document.addEventListener(
      'fullscreenchange',
      () => {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          setIsFullscreen(true);
        }
      },
      false
    );
    if (state && state.currentUser && userId && projectName !== project.name) {
      update(ref(database, `/workSpace-${userId}/projects/${projectId}`), {
        name: projectName,
      });
    }
  }, [isFullscreen, projectName]);

  return (
    <>
      {isFullscreen ? (
        <Presentation slides={project.slides} />
      ) : (
        <Box mt={12} my="auto" style={{ height: 'calc(100vh - 100px)' }}>
          <Flex justify="space-between" align="center" w="full" mt={8} px={4}>
            <Skeleton isLoaded={isLoaded}>
              <Heading>
                <input value={projectName} onChange={e => setProjectName(e.target.value)} style={{ width: '1000px'}}></input>
              </Heading>
            </Skeleton>
            <Flex align="center">
              <Button onClick={toggleFullScreen} colorScheme="blue" ml={4}>
                Start presentation
              </Button>
              <Button onClick={addSlide} colorScheme="green" ml={4}>
                Add new slide
              </Button>
              <Button onClick={deleteSlide} colorScheme="red" ml={4}>
                Delete current slide
              </Button>
            </Flex>
          </Flex>
          <Box mt={8} w="full" style={{ height: 'calc(100vh - 163px)' }}>
            {isLoaded ? (
              <Tabs
                orientation="vertical"
                colorScheme="transparent"
                variant="unstyled"
                onChange={(currentIndex) => setSelectedSlideId(project.slides[currentIndex].id)}
              >
                <TabList borderY="1px" borderColor="gray.300" overflowY="auto" style={{ height: 'calc(100vh - 163px)' }}>
                  {project.slides.map((slide, index) => (
                    <Tab
                      key={slide.id}
                      flex
                      alignItems="start"
                      bg={findSlideSelected() === index && 'yellow.100'}
                      style={{ colorRendering: 'yellow' }}
                      px={4}
                    >
                      <Text>{index + 1}</Text>
                      <AspectRatio
                        ratio={16 / 9}
                        borderRadius="md"
                        bg="white"
                        w={32}
                        ml={4}
                        border="2px"
                        borderColor={findSlideSelected() === index && 'yellow.200'}
                      >
                        <></>
                      </AspectRatio>
                    </Tab>
                  ))}
                </TabList>
                <TabPanels>
                  {project.slides.map((slide) => (
                    <TabPanel key={slide.id} w="full" textAlign="center" p={0}>
                      <ReactQuill
                        theme="snow"
                        value={slide.content}
                        key={slide.id}
                        onChange={(content) => changeContentSlide(slide.id, content)}
                        style={{ height: 'calc(100vh - 207px)' }}
                      >
                        <Box className="my-editing-area" />
                      </ReactQuill>
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            ) : (
              <Spinner
                display="block"
                mx="auto"
                alignSelf="center"
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
            )}
          </Box>
        </Box>
      )}
    </>
  );
}

export default Project;
