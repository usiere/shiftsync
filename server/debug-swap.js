const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugSwap() {
  try {
    // Get swap request 6 details
    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: 6 },
      include: {
        fromAssignment: {
          include: {
            shift: { include: { location: true, skill: true } },
            user: true
          }
        },
        toAssignment: {
          include: {
            shift: { include: { location: true, skill: true } },
            user: true
          }
        },
        fromUser: true,
        toUser: true
      }
    })

    console.log('Swap Request Details:', JSON.stringify(swapRequest, null, 2))

    if (swapRequest) {
      console.log('\nSwap Summary:')
      console.log('From User:', swapRequest.fromUser.firstName, swapRequest.fromUser.lastName)
      console.log('To User:', swapRequest.toUser?.firstName, swapRequest.toUser?.lastName)
      console.log('From Assignment ID:', swapRequest.fromAssignmentId)
      console.log('To Assignment ID:', swapRequest.toAssignmentId)
      console.log('From Shift ID:', swapRequest.fromAssignment.shiftId)
      console.log('To Shift ID:', swapRequest.toAssignment?.shiftId)
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugSwap()