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
