import { Request, Response, NextFunction } from 'express'
import { UserRole } from '@prisma/client'

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Admin access required' })
  }

  next()
}

export function requireManager(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  if (req.user.role !== UserRole.MANAGER) {
    return res.status(403).json({ error: 'Manager access required' })
  }

  next()
}

export function requireManagerOrAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  if (req.user.role !== UserRole.MANAGER && req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Manager or Admin access required' })
  }

  next()
}

export function requireStaffOrAbove(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  // All authenticated users have at least STAFF level access
  next()
}