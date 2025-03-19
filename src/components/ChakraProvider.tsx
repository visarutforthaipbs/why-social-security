"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider as ChakraUIProvider } from "@chakra-ui/react";
import theme from "../theme/index";
import { ReactNode } from "react";

export function ChakraProvider({ children }: { children: ReactNode }) {
  return (
    <CacheProvider>
      <ChakraUIProvider theme={theme}>{children}</ChakraUIProvider>
    </CacheProvider>
  );
}
