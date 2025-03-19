import mongoose, { Schema } from "mongoose";

// Define the model interface
export interface IUserFeedback {
  sectionType: "33" | "39" | "40";
  userData: {
    name?: string;
    age: string;
    occupation: string;
    yearsContributing: string;
    monthlyContribution: string;
    usedBenefits: string[];
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
    enum: ["33", "39", "40"],
    required: true,
  },
  userData: {
    name: { type: String },
    age: { type: String, required: true },
    occupation: { type: String, required: true },
    yearsContributing: { type: String, required: true },
    monthlyContribution: { type: String, required: true },
    usedBenefits: { type: [String], default: [] },
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
