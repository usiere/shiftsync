const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testSwap() {
  try {
    const managerId = 41
    const swapRequestId = 6

    // Get swap request details
    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: swapRequestId },
      include: {
        fromAssignment: true,
        toAssignment: true
      }
    })

    console.log('Starting swap transaction...')

    const result = await prisma.$transaction(async (tx) => {
      console.log('Updating swap request status...')
      const updatedRequest = await tx.swapRequest.update({
        where: { id: swapRequestId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedById: managerId
        }
      })

      if (swapRequest.type === 'SWAP' && swapRequest.toAssignment) {
        const fromShiftId = swapRequest.fromAssignment.shiftId
        const toShiftId = swapRequest.toAssignment.shiftId
        const fromUserId = swapRequest.fromUserId
        const toUserId = swapRequest.toUserId

        console.log('Swap details:', {
          fromShiftId,
          toShiftId,
          fromUserId,
          toUserId,
          fromAssignmentId: swapRequest.fromAssignmentId,
          toAssignmentId: swapRequest.toAssignmentId
        })

        // Delete old assignments first
        console.log('Deleting assignment:', swapRequest.fromAssignmentId)
        await tx.shiftAssignment.delete({
          where: { id: swapRequest.fromAssignmentId }
        })

        console.log('Deleting assignment:', swapRequest.toAssignmentId)
        await tx.shiftAssignment.delete({
          where: { id: swapRequest.toAssignmentId }
        })

        // Create new swapped assignments
        console.log('Creating assignment: shift', fromShiftId, 'user', toUserId)
        await tx.shiftAssignment.create({
          data: {
            shiftId: fromShiftId,
            userId: toUserId,
            assignedById: managerId
          }
        })

        console.log('Creating assignment: shift', toShiftId, 'user', fromUserId)
        await tx.shiftAssignment.create({
          data: {
            shiftId: toShiftId,
            userId: fromUserId,
            assignedById: managerId
          }
        })

        console.log('Swap completed successfully!')
      }

      return updatedRequest
    })

    console.log('Transaction successful:', result.status)

  } catch (error) {
    console.error('Error during swap:', error.message)
    console.error('Error code:', error.code)
    console.error('Error meta:', error.meta)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSwap()