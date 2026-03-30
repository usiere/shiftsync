import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

/**
 * GET /skills - Get all skills
 */
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const skills = await prisma.skill.findMany({
      select: {
        id: true,
        name: true,
        description: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    res.json({
      message: 'Skills retrieved successfully',
      count: skills.length,
      skills
    })

  } catch (error) {
    console.error('Get skills error:', error)
    res.status(500).json({
      error: 'Failed to retrieve skills',
      message: 'An internal server error occurred'
    })
  }
})

export default router