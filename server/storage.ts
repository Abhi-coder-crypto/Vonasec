import { MongoClient, ObjectId, Db } from "mongodb";
import type {
  Participant,
  InsertParticipant,
  Submission,
  InsertSubmission,
  SubmissionWithParticipant,
} from "@shared/schema";

export interface IStorage {
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  getParticipant(id: string): Promise<Participant | undefined>;
  getParticipantByEmail(email: string): Promise<Participant | undefined>;
  hasSubmittedQuiz(email: string, phone?: string): Promise<{ submitted: boolean; reason?: string }>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getAllSubmissions(): Promise<SubmissionWithParticipant[]>;
}

class MongoStorage implements IStorage {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  constructor() {
    const uri = process.env.MONGO_URI;
    if (uri) {
      this.client = new MongoClient(uri);
    } else {
      console.warn("MONGO_URI environment variable is not set. Database operations will fail.");
    }
  }

  private async getDb(): Promise<Db> {
    if (!this.client) {
      throw new Error("MONGO_URI environment variable is required for database operations");
    }
    if (!this.db) {
      await this.client.connect();
      this.db = this.client.db("vonasec_quiz");
    }
    return this.db;
  }

  async createParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const db = await this.getDb();
    const collection = db.collection("participants");
    
    const doc = {
      ...insertParticipant,
      email: insertParticipant.email.toLowerCase(),
      createdAt: new Date(),
    };
    
    const result = await collection.insertOne(doc);
    
    return {
      _id: result.insertedId.toString(),
      ...insertParticipant,
      email: doc.email,
      createdAt: doc.createdAt,
    };
  }

  async getParticipant(id: string): Promise<Participant | undefined> {
    const db = await this.getDb();
    const collection = db.collection("participants");
    
    try {
      const doc = await collection.findOne({ _id: new ObjectId(id) });
      if (!doc) return undefined;
      
      return {
        _id: doc._id.toString(),
        name: doc.name,
        qualification: doc.qualification,
        email: doc.email,
        phone: doc.phone,
        collegeName: doc.collegeName,
        state: doc.state,
        city: doc.city,
        pincode: doc.pincode,
        createdAt: doc.createdAt,
      };
    } catch {
      return undefined;
    }
  }

  async getParticipantByEmail(email: string): Promise<Participant | undefined> {
    const db = await this.getDb();
    const collection = db.collection("participants");
    
    try {
      const doc = await collection.findOne({ email: email.toLowerCase() });
      if (!doc) return undefined;
      
      return {
        _id: doc._id.toString(),
        name: doc.name,
        qualification: doc.qualification,
        email: doc.email,
        phone: doc.phone,
        collegeName: doc.collegeName,
        state: doc.state,
        city: doc.city,
        pincode: doc.pincode,
        createdAt: doc.createdAt,
      };
    } catch {
      return undefined;
    }
  }

  async hasSubmittedQuiz(email: string, phone?: string): Promise<{ submitted: boolean; reason?: string }> {
    const db = await this.getDb();
    const participantsCol = db.collection("participants");
    const submissionsCol = db.collection("submissions");
    
    try {
      // Check by email
      const participantByEmail = await participantsCol.findOne({ email: email.toLowerCase() });
      if (participantByEmail) {
        const submission = await submissionsCol.findOne({ participantId: participantByEmail._id.toString() });
        if (submission) {
          return { submitted: true, reason: "email" };
        }
      }
      
      // Check by phone if provided
      if (phone) {
        const participantByPhone = await participantsCol.findOne({ phone: phone });
        if (participantByPhone) {
          const submission = await submissionsCol.findOne({ participantId: participantByPhone._id.toString() });
          if (submission) {
            return { submitted: true, reason: "phone" };
          }
        }
      }
      
      return { submitted: false };
    } catch {
      return { submitted: false };
    }
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const db = await this.getDb();
    const collection = db.collection("submissions");
    
    const doc = {
      ...insertSubmission,
      submittedAt: new Date(),
    };
    
    const result = await collection.insertOne(doc);
    
    return {
      _id: result.insertedId.toString(),
      ...insertSubmission,
      submittedAt: doc.submittedAt,
    };
  }

  async getAllSubmissions(): Promise<SubmissionWithParticipant[]> {
    const db = await this.getDb();
    const submissionsCol = db.collection("submissions");
    const participantsCol = db.collection("participants");
    
    const submissions = await submissionsCol
      .find()
      .sort({ submittedAt: -1 })
      .toArray();
    
    // Batch load all participants at once instead of N+1 queries
    const participantIds = submissions
      .map(sub => {
        try {
          return new ObjectId(sub.participantId);
        } catch {
          return null;
        }
      })
      .filter((id): id is ObjectId => id !== null);
    
    // Fetch all participants in a single query
    const participantDocs = await participantsCol
      .find({ _id: { $in: participantIds } })
      .toArray();
    
    // Create a map for fast lookup
    const participantMap = new Map();
    for (const doc of participantDocs) {
      participantMap.set(doc._id.toString(), {
        _id: doc._id.toString(),
        name: doc.name,
        qualification: doc.qualification,
        email: doc.email,
        phone: doc.phone,
        collegeName: doc.collegeName,
        state: doc.state,
        city: doc.city,
        pincode: doc.pincode,
        createdAt: doc.createdAt,
      });
    }
    
    // Build results using the map
    const results: SubmissionWithParticipant[] = [];
    for (const sub of submissions) {
      const participant = participantMap.get(sub.participantId);
      if (participant) {
        results.push({
          _id: sub._id.toString(),
          participantId: sub.participantId,
          answers: sub.answers,
          submittedAt: sub.submittedAt,
          participant,
        });
      }
    }
    
    return results;
  }
}

export const storage = new MongoStorage();
