import { Request, Response, NextFunction } from 'express'
import { UserRole } from '@prisma/client'
import { verifyToken, JwtPayload } from '../utils/jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        email: string
        role: UserRole
        firstName: string
        lastName: string
        isActive: boolean
      }
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided' })
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid authorization header format' })
    }

    const token = authHeader.substring(7)

    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded: JwtPayload = verifyToken(token)

    // Fetch user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' })
    }

    req.user = user
    return next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}