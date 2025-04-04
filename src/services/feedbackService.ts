// Service for handling feedback data

export type SectionType = "33" | "39" | "40" | "40-1" | "40-2" | "40-3" | null;

export interface UserData {
  name: string;
  age: string;
  occupation: string;
  yearsContributing: string;
  monthsContributing?: string;
  monthlyContribution: string;
  usedBenefits: string[];
  // Fields for section 39
  yearsSection33?: string;
  monthsSection33?: string;
  monthlySection33?: string;
  yearsSection39?: string;
  monthsSection39?: string;
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
    // For non-registered users, sectionType will be null
    // Skip detailed validation for users who are not registered

    // For registered users, validate the required section-specific fields
    if (data.sectionType !== null) {
      // Basic validation for all section types
      if (!data.userData.age || !data.userData.occupation) {
        return { success: false, error: "Missing required user data" };
      }

      // Validate based on section type
      if (data.sectionType === "39") {
        // Section 39 validation
        if (
          !data.userData.yearsSection33 ||
          !data.userData.monthsSection33 ||
          !data.userData.monthlySection33 ||
          !data.userData.yearsSection39 ||
          !data.userData.monthsSection39
        ) {
          return { success: false, error: "Missing required Section 39 data" };
        }
      } else if (
        data.sectionType === "40" ||
        data.sectionType === "40-1" ||
        data.sectionType === "40-2" ||
        data.sectionType === "40-3"
      ) {
        // Section 40 validation
        if (
          !data.userData.yearsContributing ||
          data.userData.monthsContributing === undefined ||
          !data.userData.monthlyContribution
        ) {
          return { success: false, error: "Missing required Section 40 data" };
        }
      } else {
        // Section 33 and others
        if (
          !data.userData.yearsContributing ||
          !data.userData.monthlyContribution
        ) {
          return {
            success: false,
            error: "Missing required contribution data",
          };
        }
      }
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
