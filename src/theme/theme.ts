import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      50: "#e6f7ff",
      100: "#b3e0ff",
      200: "#80caff",
      300: "#4db3ff",
      400: "#1a9dff",
      500: "#0088e6",
      600: "#006bb3",
      700: "#004d80",
      800: "#00304d",
      900: "#00121a",
    },
    accent: {
      50: "#fff0e6",
      100: "#ffd6b3",
      200: "#ffbd80",
      300: "#ffa34d",
      400: "#ff8a1a",
      500: "#e67100",
      600: "#b35800",
      700: "#804000",
      800: "#4d2600",
      900: "#1a0d00",
    },
  },
  fonts: {
    heading: '"Noto Sans Thai", sans-serif',
    body: "Sarabun, sans-serif",
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "md",
        fontWeight: "medium",
      },
      variants: {
        primary: {
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "brand.600",
          },
        },
        secondary: {
          bg: "accent.500",
          color: "white",
          _hover: {
            bg: "accent.600",
          },
        },
        outline: {
          borderColor: "brand.500",
          color: "brand.500",
          _hover: {
            bg: "brand.50",
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: "lg",
          overflow: "hidden",
          boxShadow: "md",
        },
      },
    },
  },
});

export default theme;
