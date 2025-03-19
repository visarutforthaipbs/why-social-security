"use client";

import { Button, ButtonProps, Flex, Text } from "@chakra-ui/react";
import { FiArrowRight } from "react-icons/fi";

interface ChakraButtonProps {
  text: string;
  buttonType?: "primary" | "secondary" | "outline";
  showArrow?: boolean;
  onClick?: () => void;
}

export function ChakraButton({
  text,
  buttonType = "primary",
  showArrow = false,
  onClick,
}: ChakraButtonProps) {
  const buttonStyles: ButtonProps = {
    variant: buttonType,
    size: "md",
    px: 6,
    py: 2,
    onClick,
  };

  return (
    <Button {...buttonStyles}>
      <Flex alignItems="center" gap={2}>
        <Text color="inherit">{text}</Text>
        {showArrow && <FiArrowRight />}
      </Flex>
    </Button>
  );
}
