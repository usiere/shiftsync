import jwt from 'jsonwebtoken'
import { UserRole } from '@prisma/client'

export interface JwtPayload {
  userId: number
  role: UserRole
  email: string
  name: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'shiftsync',
    audience: 'shiftsync-users'
  })
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'shiftsync',
      audience: 'shiftsync-users'
    }) as JwtPayload

    return decoded
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}