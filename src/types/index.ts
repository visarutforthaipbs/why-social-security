// Define shared types for the application

// Section types for navigation
export type Section =
  | "home"
  | "selection"
  | "currentBenefits"
  | "userInput"
  | "suggestBenefits"
  | "end";

// Section types for selection
export type SectionType = "33" | "39" | "40" | null;

// User data interface
export interface UserData {
  name: string;
  age: string;
  occupation: string;
  yearsContributing: string;
  [key: string]: string | undefined; // Allow for additional fields
}

// Suggested benefits interface
export interface SuggestedBenefits {
  healthcare: boolean;
  retirement: boolean;
  unemployment: boolean;
  disability: boolean;
  childSupport: boolean;
  other: string;
}
