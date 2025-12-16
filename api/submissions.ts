import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient, ObjectId } from 'mongodb';
import { z } from 'zod';

const insertSubmissionSchema = z.object({
  participantId: z.string().min(1, "Participant ID required"),
  answers: z.record(z.string(), z.string()),
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
      const validatedData = insertSubmissionSchema.parse(req.body);
      const { participantId, answers } = validatedData;
      
      const db = await getDb();
      const collection = db.collection('submissions');
      
      const doc = { participantId, answers, submittedAt: new Date() };
      const result = await collection.insertOne(doc);
      
      return res.status(200).json({
        _id: result.insertedId.toString(),
        participantId,
        answers,
        submittedAt: doc.submittedAt,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const messages = error.errors.map((e: any) => e.message).join(', ');
        return res.status(400).json({ error: messages });
      }
      console.error('Error creating submission:', error);
      return res.status(500).json({ error: 'Failed to submit answers' });
    }
  }
  
  if (req.method === 'GET') {
    try {
      const db = await getDb();
      const submissionsCol = db.collection('submissions');
      const participantsCol = db.collection('participants');
      
      const submissions = await submissionsCol.find().sort({ submittedAt: -1 }).toArray();
      
      const results: any[] = [];
      
      for (const sub of submissions) {
        try {
          const participantDoc = await participantsCol.findOne({ 
            _id: new ObjectId(sub.participantId) 
          });
          
          if (participantDoc) {
            results.push({
              _id: sub._id.toString(),
              participantId: sub.participantId,
              answers: sub.answers,
              submittedAt: sub.submittedAt,
              participant: {
                _id: participantDoc._id.toString(),
                name: participantDoc.name,
                qualification: participantDoc.qualification || '',
                email: participantDoc.email,
                phone: participantDoc.phone,
                collegeName: participantDoc.collegeName || '',
                state: participantDoc.state || '',
                city: participantDoc.city || '',
                pincode: participantDoc.pincode || '',
                createdAt: participantDoc.createdAt,
              },
            });
          }
        } catch {
          // Skip submissions with invalid participant references
        }
      }
      
      return res.status(200).json(results);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return res.status(500).json({ error: 'Failed to fetch submissions' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
