import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient, ObjectId } from 'mongodb';
import { z } from 'zod';

const insertParticipantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").regex(/@gmail\.com$/i, "Only Gmail addresses are allowed"),
  phone: z.string().regex(/^[0-9]{10}$/, "Enter valid 10 digit mobile number"),
});

const uri = process.env.MONGO_URI || '';

let cachedClient: MongoClient | null = null;

async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }
  return cachedClient.db('megacv_quiz');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const validatedData = insertParticipantSchema.parse(req.body);
      const { name, email, phone } = validatedData;
      
      const db = await getDb();
      const participantsCol = db.collection('participants');
      const submissionsCol = db.collection('submissions');
      
      // Check if user has already submitted the quiz (by email) - case insensitive search
      const existingParticipantByEmail = await participantsCol.findOne({ 
        email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
      if (existingParticipantByEmail) {
        // Check for submission using both string and ObjectId formats
        const existingSubmission = await submissionsCol.findOne({ 
          $or: [
            { participantId: existingParticipantByEmail._id.toString() },
            { participantId: existingParticipantByEmail._id }
          ]
        });
        if (existingSubmission) {
          return res.status(400).json({ error: 'This email has already been used to complete the quiz. Each participant can only submit once.' });
        }
      }
      
      // Check if user has already submitted the quiz (by phone)
      const existingParticipantByPhone = await participantsCol.findOne({ phone: phone });
      if (existingParticipantByPhone) {
        // Check for submission using both string and ObjectId formats
        const existingSubmission = await submissionsCol.findOne({ 
          $or: [
            { participantId: existingParticipantByPhone._id.toString() },
            { participantId: existingParticipantByPhone._id }
          ]
        });
        if (existingSubmission) {
          return res.status(400).json({ error: 'This phone number has already been used to complete the quiz. Each participant can only submit once.' });
        }
      }
      
      const doc = { name, email: email.toLowerCase(), phone, createdAt: new Date() };
      const result = await participantsCol.insertOne(doc);
      
      return res.status(200).json({
        _id: result.insertedId.toString(),
        name,
        email: email.toLowerCase(),
        phone,
        createdAt: doc.createdAt,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const messages = error.errors.map((e: any) => e.message).join(', ');
        return res.status(400).json({ error: messages });
      }
      console.error('Error creating participant:', error);
      return res.status(500).json({ error: 'Failed to create participant' });
    }
  }
  
  if (req.method === 'GET') {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID required' });
    }
    
    try {
      const db = await getDb();
      const collection = db.collection('participants');
      const doc = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!doc) {
        return res.status(404).json({ error: 'Participant not found' });
      }
      
      return res.status(200).json({
        _id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        createdAt: doc.createdAt,
      });
    } catch (error) {
      console.error('Error fetching participant:', error);
      return res.status(500).json({ error: 'Failed to fetch participant' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
