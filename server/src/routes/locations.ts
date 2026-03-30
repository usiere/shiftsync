import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'
import { requireManagerOrAdmin } from '../middleware/roleGuards'

const router = Router()
const prisma = new PrismaClient()

/**
 * GET /locations - Get all locations
 */
router.get('/', authenticateToken, requireManagerOrAdmin, async (_req: Request, res: Response) => {
  try {
    const locations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
        timezone: true,
        address: true,
        city: true,
        state: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    res.json({
      message: 'Locations retrieved successfully',
      count: locations.length,
      locations
    })

  } catch (error) {
    console.error('Get locations error:', error)
    res.status(500).json({
      error: 'Failed to retrieve locations',
      message: 'An internal server error occurred'
    })
  }
})

export default router