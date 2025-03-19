import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    primary: {
      50: "#E6E5F7",
      100: "#C5C1F0",
      200: "#A19CE8",
      300: "#7E77E0",
      400: "#5C52D8",
      500: "#3D3A7E", // Main primary color
      600: "#302E64",
      700: "#24234B",
      800: "#181732",
      900: "#0C0C19",
    },
    secondary: {
      50: "#FFF9DA",
      100: "#FFF3B5",
      200: "#FEEC90",
      300: "#FCE46B",
      400: "#FADD46",
      500: "#f9e448", // Main secondary color
      600: "#C7B73A",
      700: "#95892B",
      800: "#635C1D",
      900: "#322E0E",
    },
    accent: {
      50: "#FFEBD9",
      100: "#FFCFB2",
      200: "#FFB38C",
      300: "#FF9766",
      400: "#FF7C41",
      500: "#f3762a", // Main accent color
      600: "#C55E22",
      700: "#964719",
      800: "#642F11",
      900: "#321808",
    },
    subtle: {
      50: "#F9F8FF",
      100: "#F3F0FF",
      200: "#E9E6F7",
      300: "#DEDCEE",
      400: "#D4D2E5",
      500: "#C9C8DC",
      600: "#A1A0B0",
      700: "#797884",
      800: "#505058",
      900: "#28282C",
    },
    background: {
      main: "#F5F5F5", // Dull white background
      card: "#FFFFFF",
      highlight: "#F9F8FF",
    },
    text: {
      primary: "#182233", // Dark blue-gray for better contrast
      secondary: "#4A5568",
      muted: "#718096",
    },
  },
  fonts: {
    heading: "var(--font-noto-sans-thai), sans-serif",
    body: "var(--font-sarabun), sans-serif",
  },
  styles: {
    global: {
      "html, body": {
        bg: "background.main",
        color: "text.primary",
        margin: 0,
        padding: 0,
        minWidth: "100%",
        overflowX: "hidden",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "bold",
        borderRadius: "full",
      },
      variants: {
        primary: {
          bg: "primary.500",
          color: "white",
          _hover: {
            bg: "primary.600",
          },
        },
        secondary: {
          bg: "secondary.500",
          color: "primary.600",
          _hover: {
            bg: "secondary.400",
          },
        },
        outline: {
          border: "2px solid",
          borderColor: "primary.500",
          color: "primary.500",
          _hover: {
            bg: "primary.50",
          },
        },
      },
      defaultProps: {
        variant: "primary",
      },
    },
    Checkbox: {
      baseStyle: {
        control: {
          borderColor: "primary.400",
          borderWidth: "2px",
          _checked: {
            bg: "primary.500",
            borderColor: "primary.500",
          },
          _hover: {
            borderColor: "primary.600",
          },
        },
        label: {
          color: "text.primary",
        },
      },
      sizes: {
        lg: {
          control: {
            w: 6,
            h: 6,
          },
        },
      },
      defaultProps: {
        colorScheme: "primary",
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: "bold",
        color: "text.primary",
      },
    },
    Text: {
      baseStyle: {
        color: "text.secondary",
      },
      variants: {
        subtitle: {
          color: "text.muted",
          fontSize: "lg",
        },
      },
    },
    Container: {
      baseStyle: {
        px: { base: 4, sm: 6, lg: 8 },
      },
    },
    Box: {
      variants: {
        card: {
          bg: "background.card",
          borderWidth: "1px",
          borderRadius: "lg",
          borderColor: "gray.200",
          boxShadow: "md",
          p: { base: 6, md: 8 },
        },
        section: {
          bg: "background.main",
          py: { base: 16, md: 24 },
        },
      },
    },
    FormLabel: {
      baseStyle: {
        fontWeight: "medium",
        color: "text.primary",
      },
    },
  },
});

export default theme;
