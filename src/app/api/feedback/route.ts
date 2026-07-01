import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserFeedback from "@/models/UserFeedback";

export async function POST(req: Request) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const data = await req.json();

    // Validate data
    if (
      data.sectionType === undefined ||
      !data.userData ||
      !data.suggestedBenefits
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // For non-registered users, sectionType will be "notRegYet"
    // Skip detailed validation for users who are not registered
    if (data.sectionType !== "notRegYet") {
      // Basic validation for all section types
      if (!data.userData.age || !data.userData.occupation) {
        return NextResponse.json(
          { error: "Missing required user data" },
          { status: 400 }
        );
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
          return NextResponse.json(
            { error: "Missing required Section 39 data" },
            { status: 400 }
          );
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
          return NextResponse.json(
            { error: "Missing required Section 40 data" },
            { status: 400 }
          );
        }
      } else {
        // Section 33 and others
        if (
          !data.userData.yearsContributing ||
          !data.userData.monthlyContribution
        ) {
          return NextResponse.json(
            { error: "Missing required contribution data" },
            { status: 400 }
          );
        }
      }
    }

    // Create new feedback document
    const feedback = new UserFeedback({
      sectionType: data.sectionType,
      userData: data.userData,
      suggestedBenefits: data.suggestedBenefits,
    });

    // Save the feedback to the database
    await feedback.save();

    // Return success response
    return NextResponse.json(
      { success: true, id: feedback._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
