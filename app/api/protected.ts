// pages/api/protected.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyFirebaseToken } from '@/utils/verifyFirebaseToken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decoded = await verifyFirebaseToken(idToken);
    return res.status(200).json({ message: 'Token valid', decoded });
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
