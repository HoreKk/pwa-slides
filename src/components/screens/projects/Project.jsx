import { useEffect, useState, useRef } from 'react';
import { AspectRatio, Box, Button, Flex, Heading, Icon, Input, Skeleton, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
import { onValue, push, ref, remove, update } from "firebase/database";
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { database } from '../../../lib/firebase';
import { uploadFile } from '../../../lib/storage';
import { CopyLinkModal } from './CopyLinkModal/CopyLinkModal';
import { Presentation } from './Reveal';
import { MdDelete, MdNoteAdd, MdPlayCircle } from "react-icons/md";
import ReactQuill, { Quill } from 'react-quill';

class PreserveWhiteSpace {
  constructor(quill, options) {
    quill.container.style.whiteSpace = "pre-line";
  }
}
Quill.register('modules/preserveWhiteSpace', PreserveWhiteSpace);

const modules = {
  clipboard: {
    matchVisual: false,
  },
  preserveWhiteSpace: true,
  toolbar: {
    container: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'color': [] }],
      ['link', 'image'],
      ['clean']
    ],
    handlers: {
      image: async function image() {
        const input = document.createElement('input');
        input.setAttribute('accept', 'image/*');
        input.setAttribute('type', 'file');
        input.click();

        // Listen upload local image and save to server
        input.onchange = async () => {
          const file = input.files[0];
          const fireStoreUrl = await uploadFile(file)
          const range = this.quill.getSelection();
          if (file.type.match(/image/)) {
            this.quill.insertEmbed(range.index, 'image', fireStoreUrl);
          } else {
            toast.error('File is not supported');
          }
        };
      }
    }
  }
}

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'color', 'handlers'
]

function Project() {
  const { userId, projectId } = useParams();
  const [project, setProject] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedSlideId, setSelectedSlideId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const tabRef = useRef(null);

  useEffect(() => {
    if (userId && !Object.values(project).length) {
      let refProject = ref(database, `workSpace-${userId}/projects/${projectId}`);
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
      }, {
        onlyOnce: false
      });
    }
  }, [selectedSlideId])


  function addSlide() {
    push(ref(database, `/workSpace-${userId}/projects/${projectId}/slides`), {
      name: 'New Slide',
      content: '',
    });
    toast.success('Slide added');
  }

  function changeContentSlide(id, content) {
    if (content.endsWith('<p><br></p>')) {
      return
    }
    update(ref(database, `/workSpace-${userId}/projects/${projectId}/slides/${id}`), {
      content: content,
    });
  }

  // Quill ne gère pas le cas où on spam 'ENTRER', 
  // en gros il active le onChange une fois sur deux si on spam entrer
  function onKeyDown(id, content) {
    if (content.key === 'Enter') {
      update(ref(database, `/workSpace-${userId}/projects/${projectId}/slides/${id}`), {
        content: content.target.innerHTML,
      });
    }
  }

  function deleteSlide() {
    if (project.slides.length > 1) {
      remove(ref(database, `/workSpace-${userId}/projects/${projectId}/slides/${selectedSlideId}`));
      setSelectedSlideId(project.slides[findSlideSelected() === 0 ? 1 : 0].id);
      tabRef.current.children[0].click()
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


  useEffect(() => {
    if (projectName === '') return;
    update(ref(database, `/workSpace-${userId}/projects/${projectId}`), {
      name: projectName,
    });

    const handleRevealJs = () => {
      if (isFullscreen) {
        setIsFullscreen(false);
      } else {
        setIsFullscreen(true);
      }
    }
    // Event listener for fullscreen change
    document.addEventListener('fullscreenchange', handleRevealJs, false);
    return () => {
      document.removeEventListener('fullscreenchange', handleRevealJs, false);
    }
  }, [isFullscreen, projectName]);

  return (
    <>
      {isFullscreen ? (
        <Presentation slides={project.slides} />
      ) : (
        <Box style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column' }}>
          <Flex bg={'white'} padding='2' justify="space-between" align={{ base: "left", md: 'center' }} w="full" px={4} flexDirection={{ base: 'column', md: 'row' }}>
            <Skeleton isLoaded={isLoaded}>
              <Heading>
                <Input fontSize={30} value={projectName} style={{ base: { width: '50vw', textAlign: 'left' }, md: { width: '50vw', textAlign: 'center' } }} onChange={e => setProjectName(e.target.value)} />
              </Heading>
            </Skeleton>
            <Flex padding={'3'} justifyContent={'space-between'} align="center">
              <CopyLinkModal />
              <Button onClick={toggleFullScreen} ml={4}>
                <Icon fontSize={18} as={MdPlayCircle}>
                </Icon>
              </Button>
              <Button onClick={addSlide} ml={4}>
                <Icon fontSize={18} as={MdNoteAdd}>
                </Icon>
              </Button>
              <Button onClick={deleteSlide} colorScheme='red' ml={4}>
                <Icon fontSize={18} as={MdDelete}>
                </Icon>
              </Button>
            </Flex>
          </Flex>
          <Flex padding={{ sm: '', md: '10px' }} flexGrow='1'>
            {isLoaded ? (
              <Tabs
                orientation="vertical"
                colorScheme="transparent"
                variant="unstyled"
                w='full'
                onChange={(currentIndex) => setSelectedSlideId(project.slides[currentIndex]?.id)}
                flexDir={{ base: 'column-reverse', md: 'row' }}
              >
                <TabList
                  borderY="1px"
                  borderColor="gray.300"
                  overflowY="auto"
                  bg={'white'}
                  flexDir={{ base: 'row', md: 'column' }}
                  ref={tabRef}
                >
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
                <TabPanels
                  flexGrow='1'
                >
                  {project.slides.map((slide) => (
                    <TabPanel padding={{ sm: '10px 0 10px 0', md: '0' }} key={slide.id} w="full" h="full" textAlign="center" p={0}>
                      <ReactQuill
                        value={slide.content}
                        onChange={(content) => changeContentSlide(slide.id, content)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          background: 'white',
                        }}
                        onKeyDown={(e) => onKeyDown(slide.id, e)}
                        formats={formats}
                        modules={modules}
                      >
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
          </Flex>
        </Box>
      )}
    </>
  );
}

export default Project;
