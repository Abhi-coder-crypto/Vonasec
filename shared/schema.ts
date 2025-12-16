import { z } from "zod";

// Validation schemas
export const insertParticipantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  qualification: z.string().min(2, "Qualification is required"),
  email: z.string().email("Invalid email address").regex(/@gmail\.com$/i, "Only Gmail addresses are allowed"),
  phone: z.string().regex(/^[0-9]{10}$/, "Enter valid 10 digit mobile number"),
  collegeName: z.string().optional(),
  state: z.string().min(2, "State is required"),
  city: z.string().min(2, "City is required"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Enter valid 6 digit pincode"),
});

export const insertSubmissionSchema = z.object({
  participantId: z.string(),
  answers: z.record(z.string(), z.string()),
});

// Types
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;

export interface Participant extends InsertParticipant {
  _id: string;
  createdAt: Date;
}

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export interface Submission extends InsertSubmission {
  _id: string;
  submittedAt: Date;
}

export interface SubmissionWithParticipant extends Submission {
  participant: Participant;
}
