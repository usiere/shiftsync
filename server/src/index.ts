import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { PrismaClient } from '@prisma/client'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger'
import { initializeSocketService } from './services/socketService'

// Import routes and middleware
import authRoutes from './routes/auth'
import shiftRoutes from './routes/shifts'
import swapRequestRoutes from './routes/swapRequests'
import overtimeRoutes from './routes/overtime'
import notificationRoutes from './routes/notifications'
import { authenticateToken } from './middleware/auth'
import { requireAdmin, requireManagerOrAdmin } from './middleware/roleGuards'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const prisma = new PrismaClient()
const port = process.env.PORT || 3000

// Initialize Socket.io
const socketService = initializeSocketService(httpServer)

app.use(helmet())
app.use(cors())
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Public health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ShiftSync server is running' })
})

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'ShiftSync API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true
  }
}))

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

// Authentication routes (public)
app.use('/auth', authRoutes)

// Protected API routes
app.use('/api/shifts', shiftRoutes)
app.use('/api/swap-requests', swapRequestRoutes)
app.use('/api/overtime', overtimeRoutes)
app.use('/api/notifications', notificationRoutes)

// Legacy protected routes
app.get('/api/users', authenticateToken, requireManagerOrAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Example protected route - Admin only
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = {
      totalUsers: await prisma.user.count(),
      totalShifts: await prisma.shift.count(),
      totalLocations: await prisma.location.count(),
      activeUsers: await prisma.user.count({ where: { isActive: true } })
    }
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// Example protected route - Manager or Admin
app.get('/api/shifts', authenticateToken, requireManagerOrAdmin, async (req, res) => {
  try {
    const shifts = await prisma.shift.findMany({
      include: {
        location: {
          select: { name: true, timezone: true }
        },
        skill: {
          select: { name: true }
        },
        shiftAssignments: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        }
      }
    })
    res.json(shifts)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shifts' })
  }
})

// Example protected route - Any authenticated user
app.get('/api/my-shifts', authenticateToken, async (req, res) => {
  try {
    const shifts = await prisma.shiftAssignment.findMany({
      where: { userId: req.user!.id },
      include: {
        shift: {
          include: {
            location: {
              select: { name: true, timezone: true }
            },
            skill: {
              select: { name: true }
            }
          }
        }
      }
    })
    res.json(shifts)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your shifts' })
  }
})

process.on('beforeExit', async () => {
  await prisma.$disconnect()
  await socketService.close()
})

httpServer.listen(port, () => {
  console.log(`Server with Socket.io is running on port ${port}`)
})