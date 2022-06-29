import { Center, Heading, Link, Button } from "@chakra-ui/react";
import {Head} from "~/components/shared/Head";

function Page404() {
  return (
    <>
      <Head title={'The page is not found'}></Head>
      <Center flexDirection='column' pt={20}>
        <Heading>
          The page is not found.
        </Heading>
        <Link href='/' mt={4}>Home Page</Link>
      </Center>
    </>
  )
}

export default Page404
