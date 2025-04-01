"use client";

import { Box, Heading, Text, VStack, Flex, Icon } from "@chakra-ui/react";
import { FiCheck } from "react-icons/fi";
import { ReactNode } from "react";

interface ChakraCardProps {
  title: string;
  description: ReactNode;
  icon?: ReactNode;
  benefits?: string[];
  gradientFrom?: string;
  gradientTo?: string;
  onClick?: () => void;
}

export function ChakraCard({
  title,
  description,
  icon,
  benefits,
  gradientFrom,
  gradientTo,
  onClick,
}: ChakraCardProps) {
  return (
    <Box
      bg="background.card"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      borderColor="gray.200"
      boxShadow="md"
      transition="all 0.3s"
      cursor="pointer"
      _hover={{
        transform: "scale(1.02)",
        boxShadow: "xl",
        borderColor: "transparent",
      }}
      onClick={onClick}
    >
      <Box
        bgGradient={`linear(to-r, ${gradientFrom}, ${gradientTo})`}
        p={6}
        color="white"
      >
        <Flex justifyContent="space-between" alignItems="flex-start">
          <Heading size="md" fontWeight="bold" color="white">
            {title}
          </Heading>
          {icon}
        </Flex>
      </Box>

      <Box p={6}>
        {typeof description === "string" ? (
          <Text mb={4}>{description}</Text>
        ) : (
          <Box mb={4}>{description}</Box>
        )}

        {benefits && benefits.length > 0 && (
          <>
            <Heading size="sm" fontWeight="semibold" mb={2}>
              สิทธิประโยชน์หลัก:
            </Heading>

            <VStack spacing={2} align="stretch">
              {benefits.map((benefit, index) => (
                <Flex key={index} alignItems="center">
                  <Flex
                    bg="accent.50"
                    rounded="full"
                    p={1}
                    mr={2}
                    alignItems="center"
                    justifyContent="center"
                    minW="16px"
                    h="16px"
                  >
                    <Icon as={FiCheck} color="accent.500" boxSize={3} />
                  </Flex>
                  <Text fontSize="sm">{benefit}</Text>
                </Flex>
              ))}
            </VStack>
          </>
        )}
      </Box>
    </Box>
  );
}
