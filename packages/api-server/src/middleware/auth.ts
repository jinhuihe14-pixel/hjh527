import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nebula-arena-secret-key';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    (req as any).adminId = decoded.adminId;
    (req as any).userId = decoded.adminId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function generateAdminToken(adminId: string): string {
  return jwt.sign({ adminId, isAdmin: true }, JWT_SECRET, { expiresIn: '1d' });
}
