const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifySwap() {
  try {
    // Check the assignments after swap
    const assignment97 = await prisma.shiftAssignment.findUnique({
      where: { id: 97 },
      include: {
        user: { select: { firstName: true, lastName: true } },
        shift: { select: { id: true, startTime: true, endTime: true } }
      }
    })

    const assignment94 = await prisma.shiftAssignment.findUnique({
      where: { id: 94 },
      include: {
        user: { select: { firstName: true, lastName: true } },
        shift: { select: { id: true, startTime: true, endTime: true } }
      }
    })

    console.log('After swap:')
    console.log('Assignment 97 (originally Alex on Shift 111):', {
      user: `${assignment97.user.firstName} ${assignment97.user.lastName}`,
      shift: assignment97.shift.id,
      time: assignment97.shift.startTime
    })

    console.log('Assignment 94 (originally Ryan on Shift 104):', {
      user: `${assignment94.user.firstName} ${assignment94.user.lastName}`,
      shift: assignment94.shift.id,
      time: assignment94.shift.startTime
    })

    // Check the swap request status
    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: 6 },
      select: { status: true, approvedAt: true, approvedById: true }
    })

    console.log('Swap request status:', swapRequest)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifySwap()