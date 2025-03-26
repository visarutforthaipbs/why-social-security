"use client";

import Image from "next/image";
import { Box, Container, Flex, HStack } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box
      as="footer"
      bg="#3d3a7e"
      py={1}
      position="fixed"
      bottom={0}
      width="full"
      zIndex={10}
      borderTop="1px"
      borderColor="rgba(255,255,255,0.1)"
    >
      <Container maxW="lg">
        <Flex justifyContent="center" alignItems="center">
          <HStack spacing={{ base: 1, md: 2 }}>
            <Box
              position="relative"
              width={{ base: 20, md: 24 }}
              height={{ base: 16, md: 20 }}
            >
              <Image
                src="/3.png"
                alt="Logo 1"
                fill
                style={{ objectFit: "contain" }}
              />
            </Box>
            <Box
              position="relative"
              width={{ base: 20, md: 24 }}
              height={{ base: 16, md: 20 }}
            >
              <Image
                src="/1.png"
                alt="Logo 2"
                fill
                style={{ objectFit: "contain" }}
              />
            </Box>
            <Box
              position="relative"
              width={{ base: 16, md: 25 }}
              height={{ base: 16, md: 45 }}
            >
              <Image
                src="/2.png"
                alt="Logo 3"
                fill
                style={{ objectFit: "contain" }}
              />
            </Box>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;
