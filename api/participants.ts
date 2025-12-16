import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient, ObjectId } from 'mongodb';
import { z } from 'zod';

const insertParticipantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  qualification: z.string().min(2, "Qualification is required"),
  email: z.string().email("Invalid email address").regex(/@gmail\.com$/i, "Only Gmail addresses are allowed"),
  phone: z.string().regex(/^[0-9]{10}$/, "Enter valid 10 digit mobile number"),
  collegeName: z.string().optional(),
  state: z.string().min(2, "State is required"),
  city: z.string().min(2, "City is required"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Enter valid 6 digit pincode"),
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
      const { name, qualification, email, phone, collegeName, state, city, pincode } = validatedData;
      
      const db = await getDb();
      const participantsCol = db.collection('participants');
      const submissionsCol = db.collection('submissions');
      
      // Find ALL participants with this email (case insensitive)
      const participantsByEmail = await participantsCol.find({ 
        email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      }).toArray();
      
      // Check if any of them have submissions
      for (const participant of participantsByEmail) {
        const submission = await submissionsCol.findOne({ participantId: participant._id.toString() });
        if (submission) {
          return res.status(400).json({ error: 'This email has already been used to complete the quiz. Each participant can only submit once.' });
        }
      }
      
      // Find ALL participants with this phone
      const participantsByPhone = await participantsCol.find({ phone: phone }).toArray();
      
      // Check if any of them have submissions
      for (const participant of participantsByPhone) {
        const submission = await submissionsCol.findOne({ participantId: participant._id.toString() });
        if (submission) {
          return res.status(400).json({ error: 'This phone number has already been used to complete the quiz. Each participant can only submit once.' });
        }
      }
      
      const doc = { 
        name, 
        qualification,
        email: email.toLowerCase(), 
        phone, 
        collegeName: collegeName || '',
        state,
        city,
        pincode,
        createdAt: new Date() 
      };
      const result = await participantsCol.insertOne(doc);
      
      return res.status(200).json({
        _id: result.insertedId.toString(),
        name,
        qualification,
        email: email.toLowerCase(),
        phone,
        collegeName: collegeName || '',
        state,
        city,
        pincode,
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
        qualification: doc.qualification || '',
        email: doc.email,
        phone: doc.phone,
        collegeName: doc.collegeName || '',
        state: doc.state || '',
        city: doc.city || '',
        pincode: doc.pincode || '',
        createdAt: doc.createdAt,
      });
    } catch (error) {
      console.error('Error fetching participant:', error);
      return res.status(500).json({ error: 'Failed to fetch participant' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
