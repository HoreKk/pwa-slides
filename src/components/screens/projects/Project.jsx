import { AspectRatio, Box, Button, Flex, Heading, Skeleton, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
import { onValue, push, ref, remove, update } from "firebase/database";
import { useState } from 'react';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import { useParams } from "react-router-dom";
import { useAuthState } from '~/components/contexts/UserContext';
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

  const { projectId } = useParams();
  const [project, setProject] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedSlideId, setSelectedSlideId] = useState(null);

  if (state.currentUser && !Object.values(project).length) {
    let refProject = ref(database, `workSpace-${state.currentUser.uid}/projects/${projectId}`)
    let firstLoad = false
    onValue(refProject, (snapshot) => {
      let { slides, ...tmpProject } = snapshot.val()
      let tmpSlides = []
      Object.entries(slides).forEach(([key, value]) => tmpSlides.push({ id: key, ...value }))
      setProject({ ...tmpProject, slides: tmpSlides })
      !firstLoad && setSelectedSlideId(tmpSlides[0].id)
      setIsLoaded(true)
      firstLoad = true
    });
  }

  function addSlide() {
    if (state?.currentUser) {
      push(ref(database, `/workSpace-${state.currentUser.uid}/projects/${projectId}/slides`), {
        name: "New Slide",
        content: "",
      });
      toast.success('Slide added');
    }
  }

  function changeContentSlide(id, content) {
    if (state?.currentUser) {
      update(ref(database, `/workSpace-${state.currentUser.uid}/projects/${projectId}/slides/${id}`), {
        content,
      });
    }
  }

  function deleteSlide() {
    if (project.slides.length > 1) {
      if (state?.currentUser) {
        remove(ref(database, `/workSpace-${state.currentUser.uid}/projects/${projectId}/slides/${selectedSlideId}`));
      }
      setSelectedSlideId(project.slides[findSlideSelected() === 0 ? 1 : 0].id)
      document.getElementById(`tabs-:r0:--tab-0`).click();
    } else {
      toast.error('You need at least one slide');
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
          <Flex align='center'>
            <Button onClick={addSlide} colorScheme='green'>
              Add new slide
            </Button>
            <Button onClick={deleteSlide} colorScheme='red' ml={4}>
              Delete current slide
            </Button>
          </Flex>
        </Flex>
        <Box mt={8} w='full'>
          {isLoaded ? (
            <Tabs orientation='vertical' colorScheme='transparent' variant='unstyled' onChange={currentIndex => setSelectedSlideId(project.slides[currentIndex].id)}>
              <TabList borderY='1px' borderColor='gray.300' overflowY='auto' maxH="78vh">
                {project.slides.map((slide, index) => (
                  <Tab key={slide.id} flex alignItems='start' bg={(findSlideSelected() === index) && 'yellow.100'} style={{ colorRendering: 'yellow' }} px={4}>
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
                    <ReactQuill
                      formats={formats}
                      modules={modules}
                      theme="snow"
                      value={slide.content}
                      key={slide.id}
                      onChange={content => changeContentSlide(slide.id, content)}
                      style={{ height: '73vh' }}>
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
