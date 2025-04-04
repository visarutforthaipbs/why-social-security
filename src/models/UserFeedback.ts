import mongoose, { Schema } from "mongoose";

// Define the model interface
export interface IUserFeedback {
  sectionType: "33" | "39" | "40" | "40-1" | "40-2" | "40-3" | "notRegYet";
  userData: {
    name?: string;
    age: string;
    occupation: string;
    yearsContributing?: string;
    monthsContributing?: string;
    monthlyContribution?: string;
    usedBenefits: string[];
    // Additional fields for Section 39
    yearsSection33?: string;
    monthsSection33?: string;
    monthlySection33?: string;
    yearsSection39?: string;
    monthsSection39?: string;
  };
  suggestedBenefits: {
    healthcare: boolean;
    retirement: boolean;
    unemployment: boolean;
    disability: boolean;
    childSupport: boolean;
    other: string;
  };
  createdAt: Date;
}

// Define the schema
const UserFeedbackSchema = new Schema<IUserFeedback>({
  sectionType: {
    type: String,
    enum: ["33", "39", "40", "40-1", "40-2", "40-3", "notRegYet"],
    required: false,
    default: "notRegYet",
  },
  userData: {
    name: { type: String },
    age: { type: String, required: false },
    occupation: { type: String, required: false },
    yearsContributing: { type: String, required: false },
    monthsContributing: { type: String },
    monthlyContribution: { type: String, required: false },
    usedBenefits: { type: [String], default: [] },
    // Additional fields for Section 39
    yearsSection33: { type: String },
    monthsSection33: { type: String },
    monthlySection33: { type: String },
    yearsSection39: { type: String },
    monthsSection39: { type: String },
  },
  suggestedBenefits: {
    healthcare: { type: Boolean, default: false },
    retirement: { type: Boolean, default: false },
    unemployment: { type: Boolean, default: false },
    disability: { type: Boolean, default: false },
    childSupport: { type: Boolean, default: false },
    other: { type: String, default: "" },
  },
  createdAt: { type: Date, default: Date.now },
});

// Create or get the model
export const UserFeedback =
  mongoose.models.UserFeedback ||
  mongoose.model<IUserFeedback>("UserFeedback", UserFeedbackSchema);

export default UserFeedback;
