import { NextResponse } from "next/server";
import mongoose from "mongoose";
import UserFeedback from "@/models/UserFeedback";

// Connect to MongoDB if not already connected
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    // Connect directly using the full URI string
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export async function POST(req: Request) {
  try {
    // Connect to the database
    await connectDB();

    // Parse the request body
    const data = await req.json();

    // Validate data
    if (!data.sectionType || !data.userData || !data.suggestedBenefits) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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
