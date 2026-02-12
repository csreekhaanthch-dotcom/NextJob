import { Request, Response, NextFunction } from 'express';
import { dbManager } from '../database/connection';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * Middleware to check if user is authenticated
 */
const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Extract user ID from header (in a real app, this would come from JWT)
    const userId = req.headers['user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user exists
    const db = dbManager.getDB();
    const stmt = db.prepare('SELECT id, role FROM users WHERE id = ?');
    const user = stmt.get(userId) as { id: string; role: string } | undefined;
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware to check if user is a recruiter
 */
const requireRecruiter = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // First authenticate user
    await new Promise((resolve, reject) => {
      authenticate(req, res, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
    
    // Check if user is a recruiter
    if (!req.user || req.user.role !== 'recruiter') {
      return res.status(403).json({ error: 'Access denied. Recruiter access required.' });
    }
    
    next();
  } catch (error) {
    console.error('Recruiter authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

export { authenticate, requireRecruiter };
export type { AuthRequest };