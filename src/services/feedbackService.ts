// Service for handling feedback data

export type SectionType = "33" | "39" | "40" | null;

export interface UserData {
  name: string;
  age: string;
  occupation: string;
  yearsContributing: string;
  monthlyContribution: string;
  usedBenefits: string[];
  [key: string]: string | string[] | undefined;
}

export interface SuggestedBenefits {
  healthcare: boolean;
  retirement: boolean;
  unemployment: boolean;
  disability: boolean;
  childSupport: boolean;
  other: string;
}

export interface FeedbackData {
  sectionType: SectionType;
  userData: UserData;
  suggestedBenefits: SuggestedBenefits;
}

/**
 * Save feedback data to the API
 */
export const saveFeedback = async (
  data: FeedbackData
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate required fields
    if (!data.sectionType) {
      return { success: false, error: "Missing section type" };
    }

    if (
      !data.userData.age ||
      !data.userData.occupation ||
      !data.userData.yearsContributing ||
      !data.userData.monthlyContribution
    ) {
      return { success: false, error: "Missing required user data" };
    }

    // Send the data to the API
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Parse the response
    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to save feedback",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};
