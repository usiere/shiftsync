import { Server } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '../utils/jwt'

export interface SocketUser {
  id: number
  firstName: string
  lastName: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF'
  locationIds: number[]
}

export interface SchedulePublishedEvent {
  locationId: number
  locationName: string
  weekStart: string
  weekEnd: string
  publishedShifts: number
  publishedBy: {
    id: number
    name: string
  }
}

export interface ScheduleUpdatedEvent {
  shiftId: number
  locationId: number
  locationName: string
  changes: {
    field: string
    oldValue: any
    newValue: any
  }[]
  updatedBy: {
    id: number
    name: string
  }
}

export interface SwapRequestedEvent {
  swapRequestId: number
  fromUser: {
    id: number
    name: string
  }
  toUser: {
    id: number
    name: string
  }
  fromShift: {
    id: number
    date: string
    startTime: string
    endTime: string
    location: string
  }
  toShift?: {
    id: number
    date: string
    startTime: string
    endTime: string
    location: string
  }
  type: 'SWAP' | 'DROP'
  reason?: string
}

export interface SwapResolvedEvent {
  swapRequestId: number
  status: 'APPROVED' | 'CANCELLED' | 'ACCEPTED'
  fromUserId: number
  toUserId?: number
  resolvedBy: {
    id: number
    name: string
    role: string
  }
  shift: {
    id: number
    date: string
    startTime: string
    endTime: string
    location: string
  }
}

export interface OvertimeWarningEvent {
  userId: number
  userName: string
  shiftId: number
  shiftDetails: {
    date: string
    startTime: string
    endTime: string
    location: string
  }
  overtimeImpact: {
    currentWeeklyHours: number
    projectedWeeklyHours: number
    additionalOvertimeHours: number
    additionalOvertimeCost: number
  }
  warnings: Array<{
    type: string
    message: string
    currentValue: number
    threshold: number
  }>
  locationId: number
}

export interface ConflictDetectedEvent {
  conflictType: 'DOUBLE_ASSIGNMENT'
  shiftId: number
  userId: number
  userName: string
  shiftDetails: {
    date: string
    startTime: string
    endTime: string
    location: string
  }
  firstManager: {
    id: number
    name: string
  }
  secondManager: {
    id: number
    name: string
  }
  timestamp: string
  locationId: number
}

export class SocketService {
  private io: Server
  private prisma: PrismaClient
  private userSockets: Map<number, string> = new Map() // userId -> socketId
  private socketUsers: Map<string, SocketUser> = new Map() // socketId -> user

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true
      }
    })
    this.prisma = new PrismaClient()
    this.setupSocketHandlers()
  }

  private async setupSocketHandlers() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token
        if (!token) {
          return next(new Error('Authentication error: No token provided'))
        }

        const decoded = verifyToken(token)
        if (!decoded) {
          return next(new Error('Authentication error: Invalid token'))
        }

        // Fetch user details and their location access
        const user = await this.prisma.user.findUnique({
          where: { id: decoded.userId },
          include: {
            locationCertifications: {
              where: { expiresAt: { gte: new Date() } },
              select: { locationId: true }
            }
          }
        })

        if (!user || !user.isActive) {
          return next(new Error('Authentication error: User not found or inactive'))
        }

        // Determine accessible locations based on role
        let locationIds: number[] = []
        if (user.role === 'ADMIN') {
          // Admins can access all locations
          const allLocations = await this.prisma.location.findMany({
            where: { isActive: true },
            select: { id: true }
          })
          locationIds = allLocations.map(loc => loc.id)
        } else if (user.role === 'MANAGER') {
          // Managers can access locations they're certified for
          locationIds = user.locationCertifications.map(cert => cert.locationId)
        } else {
          // Staff can access locations they're certified for
          locationIds = user.locationCertifications.map(cert => cert.locationId)
        }

        const socketUser: SocketUser = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          locationIds
        }

        socket.data.user = socketUser
        next()
      } catch (error) {
        next(new Error('Authentication error: ' + error))
      }
    })

    this.io.on('connection', (socket) => {
      const user: SocketUser = socket.data.user

      console.log(`User ${user.firstName} ${user.lastName} (${user.role}) connected`)

      // Store user-socket mapping
      this.userSockets.set(user.id, socket.id)
      this.socketUsers.set(socket.id, user)

      // Join location-based rooms
      user.locationIds.forEach(locationId => {
        socket.join(`location:${locationId}`)
      })

      // Join role-based rooms
      socket.join(`role:${user.role.toLowerCase()}`)

      // Send initial connection success
      socket.emit('connection:established', {
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        joinedRooms: [
          ...user.locationIds.map(id => `location:${id}`),
          `role:${user.role.toLowerCase()}`
        ]
      })

      socket.on('disconnect', () => {
        console.log(`User ${user.firstName} ${user.lastName} disconnected`)
        this.userSockets.delete(user.id)
        this.socketUsers.delete(socket.id)
      })
    })
  }

  // Event emission methods
  public emitSchedulePublished(event: SchedulePublishedEvent) {
    console.log(`Emitting schedule:published to location:${event.locationId}`)
    this.io.to(`location:${event.locationId}`).emit('schedule:published', event)
  }

  public emitScheduleUpdated(event: ScheduleUpdatedEvent) {
    console.log(`Emitting schedule:updated to location:${event.locationId}`)
    this.io.to(`location:${event.locationId}`).emit('schedule:updated', event)
  }

  public emitSwapRequested(event: SwapRequestedEvent) {
    console.log(`Emitting swap:requested to user ${event.toUser.id}`)
    const targetSocketId = this.userSockets.get(event.toUser.id)
    if (targetSocketId) {
      this.io.to(targetSocketId).emit('swap:requested', event)
    }
  }

  public emitSwapResolved(event: SwapResolvedEvent) {
    console.log(`Emitting swap:resolved to users ${event.fromUserId}${event.toUserId ? ` and ${event.toUserId}` : ''}`)

    // Notify the requester
    const fromSocketId = this.userSockets.get(event.fromUserId)
    if (fromSocketId) {
      this.io.to(fromSocketId).emit('swap:resolved', event)
    }

    // Notify the target user if applicable
    if (event.toUserId) {
      const toSocketId = this.userSockets.get(event.toUserId)
      if (toSocketId) {
        this.io.to(toSocketId).emit('swap:resolved', event)
      }
    }
  }

  public emitOvertimeWarning(event: OvertimeWarningEvent) {
    console.log(`Emitting overtime:warning to managers at location:${event.locationId}`)
    // Send to managers and admins at this location
    this.io.to(`location:${event.locationId}`).emit('overtime:warning', event)
  }

  public emitConflictDetected(event: ConflictDetectedEvent) {
    console.log(`Emitting conflict:detected to manager ${event.secondManager.id}`)
    const managerSocketId = this.userSockets.get(event.secondManager.id)
    if (managerSocketId) {
      this.io.to(managerSocketId).emit('conflict:detected', event)
    }
  }

  // Notification methods
  public emitToUser(userId: number, event: string, data: any) {
    const socketId = this.userSockets.get(userId)
    if (socketId) {
      this.io.to(socketId).emit(event, data)
    }
  }

  public emitToMultipleUsers(userIds: number[], event: string, data: any) {
    userIds.forEach(userId => {
      this.emitToUser(userId, event, data)
    })
  }

  // Utility methods
  public getUserSocketId(userId: number): string | undefined {
    return this.userSockets.get(userId)
  }

  public getSocketUser(socketId: string): SocketUser | undefined {
    return this.socketUsers.get(socketId)
  }

  public isUserOnline(userId: number): boolean {
    return this.userSockets.has(userId)
  }

  public getOnlineUsersInLocation(locationId: number): SocketUser[] {
    const onlineUsers: SocketUser[] = []
    for (const [_socketId, user] of this.socketUsers) {
      if (user.locationIds.includes(locationId)) {
        onlineUsers.push(user)
      }
    }
    return onlineUsers
  }

  public getConnectedManagersInLocation(locationId: number): SocketUser[] {
    return this.getOnlineUsersInLocation(locationId).filter(
      user => user.role === 'MANAGER' || user.role === 'ADMIN'
    )
  }

  // Cleanup method
  public async close() {
    this.io.close()
    await this.prisma.$disconnect()
  }
}

// Global socket service instance
let socketService: SocketService | null = null

export function initializeSocketService(httpServer: HTTPServer): SocketService {
  if (!socketService) {
    socketService = new SocketService(httpServer)
  }
  return socketService
}

export function getSocketService(): SocketService {
  if (!socketService) {
    throw new Error('Socket service not initialized. Call initializeSocketService first.')
  }
  return socketService
}