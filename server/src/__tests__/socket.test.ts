import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { createServer } from 'http'
import express from 'express'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ioClient = require('socket.io-client')
import { PrismaClient } from '@prisma/client'
import { initializeSocketService, SocketService } from '../services/socketService'
import { generateToken } from '../utils/jwt'

const prisma = new PrismaClient()
let httpServer: any
let socketService: SocketService
let serverUrl: string

beforeAll(async () => {
  await prisma.$connect()

  // Create test server
  const app = express()
  httpServer = createServer(app)
  socketService = initializeSocketService(httpServer)

  // Start server on random port
  await new Promise<void>((resolve) => {
    httpServer.listen(0, () => {
      const port = httpServer.address()?.port
      serverUrl = `http://localhost:${port}`
      resolve()
    })
  })
})

afterAll(async () => {
  httpServer?.close()
  await socketService?.close()
  await prisma.$disconnect()
})

beforeEach(async () => {
  // Clean up test data
  await prisma.user.deleteMany({
    where: { email: { contains: 'socket-test' } }
  })
  await prisma.location.deleteMany({
    where: { name: { contains: 'Socket Test' } }
  })
})

describe('Socket.io Real-Time Events', () => {
  test('should authenticate user and join location rooms', async () => {
    // Create test location
    const location = await prisma.location.create({
      data: {
        name: 'Socket Test Location',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        timezone: 'America/New_York'
      }
    })

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'socket-test-user@example.com',
        firstName: 'Socket',
        lastName: 'User',
        password: 'hashedpassword',
        role: 'STAFF'
      }
    })

    // Create location certification
    await prisma.locationCertification.create({
      data: {
        userId: user.id,
        locationId: location.id
      }
    })

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email, role: user.role, name: `${user.firstName} ${user.lastName}` })

    // Connect client with authentication
    const clientSocket = ioClient(serverUrl, {
      auth: { token }
    })

    const connectionEstablished = await new Promise((resolve) => {
      clientSocket.on('connection:established', (data: any) => {
        resolve(data)
      })
    })

    expect(connectionEstablished).toMatchObject({
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      joinedRooms: expect.arrayContaining([
        `location:${location.id}`,
        'role:staff'
      ])
    })

    clientSocket.disconnect()
  })

  test('should emit schedule published event to location room', async () => {
    // Create test data
    const location = await prisma.location.create({
      data: {
        name: 'Socket Test Location 2',
        address: '456 Test Ave',
        city: 'Test City',
        state: 'TS',
        zipCode: '54321',
        timezone: 'America/New_York'
      }
    })

    const user = await prisma.user.create({
      data: {
        email: 'socket-test-user-2@example.com',
        firstName: 'Test',
        lastName: 'Staff',
        password: 'hashedpassword',
        role: 'STAFF'
      }
    })

    await prisma.locationCertification.create({
      data: { userId: user.id, locationId: location.id }
    })

    const token = generateToken({ userId: user.id, email: user.email, role: user.role, name: `${user.firstName} ${user.lastName}` })

    // Connect client
    const clientSocket = ioClient(serverUrl, {
      auth: { token }
    })

    await new Promise((resolve) => {
      clientSocket.on('connection:established', resolve)
    })

    // Set up event listener
    const schedulePublishedEvent = new Promise((resolve) => {
      clientSocket.on('schedule:published', resolve)
    })

    // Emit event from server
    socketService.emitSchedulePublished({
      locationId: location.id,
      locationName: location.name,
      weekStart: '2024-03-04',
      weekEnd: '2024-03-10',
      publishedShifts: 10,
      publishedBy: {
        id: 999,
        name: 'Test Manager'
      }
    })

    const receivedEvent = await schedulePublishedEvent

    expect(receivedEvent).toMatchObject({
      locationId: location.id,
      locationName: location.name,
      weekStart: '2024-03-04',
      weekEnd: '2024-03-10',
      publishedShifts: 10,
      publishedBy: {
        id: 999,
        name: 'Test Manager'
      }
    })

    clientSocket.disconnect()
  })

  test('should emit swap requested event to specific user', async () => {
    // Create test users
    const user1 = await prisma.user.create({
      data: {
        email: 'socket-test-user1@example.com',
        firstName: 'User',
        lastName: 'One',
        password: 'hashedpassword',
        role: 'STAFF'
      }
    })

    const user2 = await prisma.user.create({
      data: {
        email: 'socket-test-user2@example.com',
        firstName: 'User',
        lastName: 'Two',
        password: 'hashedpassword',
        role: 'STAFF'
      }
    })

    const token1 = generateToken({ userId: user1.id, email: user1.email, role: user1.role, name: `${user1.firstName} ${user1.lastName}` })
    const token2 = generateToken({ userId: user2.id, email: user2.email, role: user2.role, name: `${user2.firstName} ${user2.lastName}` })

    // Connect both clients
    const client1 = ioClient(serverUrl, { auth: { token: token1 } })
    const client2 = ioClient(serverUrl, { auth: { token: token2 } })

    await Promise.all([
      new Promise(resolve => client1.on('connection:established', resolve)),
      new Promise(resolve => client2.on('connection:established', resolve))
    ])

    // Set up event listener on client2 (target user)
    const swapRequestedEvent = new Promise((resolve) => {
      client2.on('swap:requested', resolve)
    })

    // Emit swap request event targeting user2
    socketService.emitSwapRequested({
      swapRequestId: 123,
      fromUser: {
        id: user1.id,
        name: `${user1.firstName} ${user1.lastName}`
      },
      toUser: {
        id: user2.id,
        name: `${user2.firstName} ${user2.lastName}`
      },
      fromShift: {
        id: 456,
        date: '2024-03-05',
        startTime: '2024-03-05T09:00:00Z',
        endTime: '2024-03-05T17:00:00Z',
        location: 'Test Location'
      },
      type: 'SWAP',
      reason: 'Need to swap shifts'
    })

    const receivedEvent = await swapRequestedEvent

    expect(receivedEvent).toMatchObject({
      swapRequestId: 123,
      fromUser: {
        id: user1.id,
        name: `${user1.firstName} ${user1.lastName}`
      },
      toUser: {
        id: user2.id,
        name: `${user2.firstName} ${user2.lastName}`
      },
      type: 'SWAP',
      reason: 'Need to swap shifts'
    })

    client1.disconnect()
    client2.disconnect()
  })

  test('should emit overtime warning to managers in location', async () => {
    // Create test location and manager
    const location = await prisma.location.create({
      data: {
        name: 'Socket Test Location 3',
        address: '789 Test Blvd',
        city: 'Test City',
        state: 'TS',
        zipCode: '78901',
        timezone: 'America/New_York'
      }
    })

    const manager = await prisma.user.create({
      data: {
        email: 'socket-test-manager@example.com',
        firstName: 'Test',
        lastName: 'Manager',
        password: 'hashedpassword',
        role: 'MANAGER'
      }
    })

    const staff = await prisma.user.create({
      data: {
        email: 'socket-test-staff@example.com',
        firstName: 'Test',
        lastName: 'Staff',
        password: 'hashedpassword',
        role: 'STAFF'
      }
    })

    // Certify manager for location
    await prisma.locationCertification.create({
      data: { userId: manager.id, locationId: location.id }
    })

    const managerToken = generateToken({ userId: manager.id, email: manager.email, role: manager.role, name: `${manager.firstName} ${manager.lastName}` })

    // Connect manager client
    const managerClient = ioClient(serverUrl, {
      auth: { token: managerToken }
    })

    await new Promise(resolve => managerClient.on('connection:established', resolve))

    // Set up overtime warning listener
    const overtimeWarningEvent = new Promise((resolve) => {
      managerClient.on('overtime:warning', resolve)
    })

    // Emit overtime warning
    socketService.emitOvertimeWarning({
      userId: staff.id,
      userName: `${staff.firstName} ${staff.lastName}`,
      shiftId: 789,
      shiftDetails: {
        date: '2024-03-06',
        startTime: '2024-03-06T09:00:00Z',
        endTime: '2024-03-06T17:00:00Z',
        location: location.name
      },
      overtimeImpact: {
        currentWeeklyHours: 35,
        projectedWeeklyHours: 43,
        additionalOvertimeHours: 3,
        additionalOvertimeCost: 67.50
      },
      warnings: [],
      locationId: location.id
    })

    const receivedEvent = await overtimeWarningEvent

    expect(receivedEvent).toMatchObject({
      userId: staff.id,
      userName: `${staff.firstName} ${staff.lastName}`,
      shiftId: 789,
      overtimeImpact: {
        additionalOvertimeCost: 67.50
      },
      locationId: location.id
    })

    managerClient.disconnect()
  })

  test('should handle authentication failure', async () => {
    const clientSocket = ioClient(serverUrl, {
      auth: { token: 'invalid-token' }
    })

    const connectionError = await new Promise((resolve) => {
      clientSocket.on('connect_error', (error: any) => {
        resolve(error.message)
      })
    })

    expect(connectionError).toContain('Authentication error')

    clientSocket.disconnect()
  })
})