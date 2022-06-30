import { useEffect, useState } from 'react';
import { useAuthState } from '~/components/contexts/UserContext';
import { Head } from '~/components/shared/Head';
import { Flex, Heading, Button, Tabs, TabList, Tab, TabPanels, TabPanel, Spinner, Skeleton, Box, AspectRatio, Text, calc } from '@chakra-ui/react';
import { useDatabase } from '~/lib/firebase';
import { ref, onValue, push, update } from "firebase/database";
import { useParams } from "react-router-dom";
import ReactQuill from 'react-quill';

function Project({ params }) {
  const { state } = useAuthState();
  const database = useDatabase()

  const { projectId } = useParams();
  const [project, setProject] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedSlideId, setSelectedSlideId] = useState(null);

  if (state.currentUser && !Object.values(project).length) {
    let refProject = ref(database, `workSpace-${state.currentUser.uid}/projects/${projectId}`)
    onValue(refProject, (snapshot) => {
      let { slides, ...tmpProject } = snapshot.val()
      let tmpSlides = []
      Object.entries(slides).forEach(([key, value]) => tmpSlides.push({ id: key, ...value }))
      setSelectedSlideId(!isLoaded ? tmpSlides[0].id : tmpSlides[tmpSlides.length].id)
      setProject({ ...tmpProject, slides: tmpSlides })
      !isLoaded && setIsLoaded(true)
    });
  }

  function addSlide() {
    console.log(project)
    if (state?.currentUser) {
      push(ref(database, `/workSpace-${state.currentUser.uid}/projects/${projectId}/slides`), {
          name: "New Slide",
          content: "",
      });
    }
  }

  function changeContentSlide(id, content) {
    if (state?.currentUser) {
      update(ref(database, `/workSpace-${state.currentUser.uid}/projects/${projectId}/slides/${id}`), {
        content,
      });
    }
  }

  function findSlideSelected() {
    return project.slides.findIndex(slide => slide.id === selectedSlideId)
  }

  return (
    <>
      <Box mt={12} my='auto'>
        <Flex justify='space-between' align='center' w='full' mt={8} px={4}>
          <Skeleton isLoaded={isLoaded}>
            <Heading>{project.name}</Heading>
          </Skeleton>
          <Button onClick={addSlide} colorScheme='green'>
            Add new slide
          </Button>
        </Flex>
        <Box mt={8} w='full'>
          {isLoaded ? (
            <Tabs orientation='vertical' colorScheme='transparent' variant='unstyled' onChange={currentIndex => setSelectedSlideId(project.slides[currentIndex].id)}>
              <TabList borderY='1px' borderColor='gray.300' overflowY='auto' maxH="78vh">
                {project.slides.map((slide, index) => (
                  <Tab key={slide.id} flex alignItems='start' bg={(findSlideSelected() === index) && 'yellow.100'} style={{ colorRendering: 'yellow'}} px={4}>
                    <Text>{index + 1}</Text>
                    <AspectRatio ratio={16 / 9} borderRadius='md' bg='white' w={32} ml={4} border='2px' borderColor={(findSlideSelected() === index) && 'yellow.200'}>
                      <></>
                    </AspectRatio>
                  </Tab>
                ))}
              </TabList>
              <TabPanels>
                {project.slides.map((slide) => (
                  <TabPanel key={slide.id} w='full' textAlign='center' p={0}>
                    <ReactQuill theme="snow" value={slide.content} key={slide.id} onChange={content => changeContentSlide(slide.id, content)} style={{ height: '73vh' }}>
                      <Box className="my-editing-area" />
                    </ReactQuill>
                  </TabPanel>
                ))} 
              </TabPanels>
            </Tabs>
          ) : (
            <Spinner
              display='block'
              mx='auto'
              alignSelf='center'
              thickness='4px'
              speed='0.65s'
              emptyColor='gray.200'
              color='blue.500'
              size='xl'
            />
          )}
        </Box>
      </Box>
    </>
  );
}

export default Project;
