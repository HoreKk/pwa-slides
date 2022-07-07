import { Button, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, Icon } from '@chakra-ui/react';
import { useRef } from 'react';
import { MdPersonAdd } from 'react-icons/md';

export function CopyLinkModal() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const linkRef = useRef(null);

  const copyLink = () => {
    linkRef.current.select();
    linkRef.current.setSelectionRange(0, 999999);
    const value = linkRef.current.value;
    navigator.clipboard.writeText(value);
  }

  return (
    <>
      <Button onClick={onOpen}>
        <Icon fontSize={18} as={MdPersonAdd}>
        </Icon>
      </Button>
      

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invitation link</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input value={window.location.href} ref={linkRef} placeholder='medium size' size='md' />
          </ModalBody>

          <ModalFooter>
            <Button onClick={copyLink} variant='ghost'>Copy link</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}