import { Box, Input } from "@chakra-ui/react";
import { onValue, push, ref } from "firebase/database";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { database } from '../../../../lib/firebase';
import { useAuthState } from '../../../contexts/UserContext';

export default function MessagesContainer() {
  const { userId, projectId } = useParams();
  
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(null);
  const {state} = useAuthState();


  useEffect(() => {
    const messagesRef = ref(database, `workSpace-${userId}/projects/${projectId}/messages`)
    onValue(messagesRef, (snapshot) => {
      setMessages(snapshot.val());
    }
    , [])
  }, [])

  function addMessage(e) {
    e.preventDefault
    const message = {
      sender: state.currentUser.uid,
      content: input,
      time: Date.now(),
    }

    push(ref(database, `workSpace-${userId}/projects/${projectId}/messages/`), message).catch(console.error);
  }

  function handleKeyPress(e) {
    if (e.key === "Enter") {
      addMessage(e);
      setInput("");
    }
  }

  const [isOpened , setIsOpened] = useState(false);
  function handleOpenClose () {
    setIsOpened(!isOpened);
  }

  if (isOpened)
    return <Box position='absolute' bottom={0} right='5%' background='white' zIndex={10000}  border='solid 1px black' borderBottom='none' borderRadius='0.10em' boxShadow="0.10em 0.30em 0.4em rgba(0,0,0,0.2)" >
      <Box display="flex" width='15%' minWidth="250px" minHeight="300px" maxHeight="450px" height="40%" flexDir='column' alignItems='center' justifyContent='space-between'>
        <Box flex={1} display="flex" flexDir="column">
        
          <Box width="100%" textAlign='center' onClick={handleOpenClose}>Messages</Box>
          <Box width='90%' height='1px' marginBottom="3%" borderRadius='1em' background='black'></Box>
          <Box display="flex" flex="1 1 0" height={0} flexDir="column" overflowY='auto'>
            {messages && Object.entries(messages).map(([key, value]) => <Box style={value.sender === state.currentUser.uid ? {alignSelf: 'flex-end'} : {border: 'solid 1px black'} } background={value.sender === state.currentUser.uid ? 'green': 'white'} width='80%' key={key} border="1px black" borderRadius="0.10em" marginBottom="3%" padding="2%">{value.content}</Box>)}
          </Box>
        </Box>
        <Input placeholder='send message' onKeyDown={handleKeyPress} value={input} onChange={(e) => setInput(e.target.value)}/>
      </Box>
    </Box>
  
  return  (<Box position='absolute' width='15%' minWidth="250px" bottom={0} right='5%' background='white' zIndex={10000}  border='solid 1px black' borderBottom='none' borderRadius='0.10em' boxShadow="0.10em 0.30em 0.4em rgba(0,0,0,0.2)" >
    <Box width="100%" textAlign='center' onClick={handleOpenClose}>Messages</Box></Box>)

}