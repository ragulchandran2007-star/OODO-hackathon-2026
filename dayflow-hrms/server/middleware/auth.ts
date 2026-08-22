import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

export interface AuthPayload {
  id: string
  email: string
  role: 'admin' | 'employee'
}

// Extend Express Request to carry the decoded user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

export const signToken = (payload: AuthPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

/**
 * Verifies the Bearer token and attaches the decoded user to req.user.
 * Any module can import this to protect its own routes:
 *   router.get('/employees', requireAuth, handler)
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }

  const token = header.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

/**
 * Role guard, use after requireAuth:
 *   router.post('/employees', requireAuth, requireRole('admin'), handler)
 */
export const requireRole = (...roles: Array<'admin' | 'employee'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' })
    }
    next()
  }
}
