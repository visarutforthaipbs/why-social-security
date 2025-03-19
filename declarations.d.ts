// Add type declarations for modules that don't have TypeScript definitions

declare module "next/link";
declare module "react-icons/fi";
declare module "@/components/Navbar" {
  import { FunctionComponent } from "react";

  export type Section =
    | "home"
    | "selection"
    | "currentBenefits"
    | "userInput"
    | "suggestBenefits"
    | "end";

  export interface NavbarProps {
    navigateTo?: (section: Section) => void;
  }

  const Navbar: FunctionComponent<NavbarProps>;
  export default Navbar;
}
