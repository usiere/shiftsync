import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'
import { requireManagerOrAdmin } from '../middleware/roleGuards'
import { SwapRequestService } from '../services/swapRequestService'
import { getSocketService } from '../services/socketService'
import { notificationService } from '../services/notificationService'

const router = Router()
const prisma = new PrismaClient()
const swapRequestService = new SwapRequestService()

/**
 * POST /swap-requests/:id/accept - Accept a swap request
 */
router.post('/:id/accept', authenticateToken, async (req: Request, res: Response) => {
  try {
    const swapRequestId = parseInt(req.params.id)

    if (!swapRequestId || isNaN(swapRequestId)) {
      return res.status(400).json({
        error: 'Invalid swap request ID',
        message: 'Swap request ID must be a valid number'
      })
    }

    const updatedRequest = await swapRequestService.acceptSwapRequest(
      swapRequestId,
      req.user!.id
    )

    // Emit real-time event for swap resolution
    try {
      const socketService = getSocketService()
      socketService.emitSwapResolved({
        swapRequestId: updatedRequest.id,
        status: 'ACCEPTED',
        fromUserId: updatedRequest.fromUserId,
        toUserId: updatedRequest.toUserId,
        resolvedBy: {
          id: req.user!.id,
          name: `${req.user!.firstName} ${req.user!.lastName}`,
          role: req.user!.role
        },
        shift: {
          id: updatedRequest.fromAssignment.shift.id,
          date: updatedRequest.fromAssignment.shift.date.toISOString().split('T')[0],
          startTime: updatedRequest.fromAssignment.shift.startTime.toISOString(),
          endTime: updatedRequest.fromAssignment.shift.endTime.toISOString(),
          location: updatedRequest.fromAssignment.shift.location.name
        }
      })
    } catch (socketError) {
      console.error('Failed to emit swap resolved event:', socketError)
    }

    // Create notifications for swap acceptance
    try {
      await notificationService.createNotification({
        userId: updatedRequest.fromUserId,
        type: 'SWAP_ACCEPTED',
        title: 'Swap Request Accepted',
        message: `Your swap request has been accepted by ${req.user!.firstName} ${req.user!.lastName}`,
        data: {
          swapRequestId: updatedRequest.id,
          location: updatedRequest.fromAssignment.shift.location.name,
          date: updatedRequest.fromAssignment.shift.date.toISOString().split('T')[0]
        }
      })
    } catch (notificationError) {
      console.error('Failed to create swap accepted notification:', notificationError)
    }

    res.json({
      message: 'Swap request accepted successfully',
      swapRequest: {
        id: updatedRequest.id,
        type: updatedRequest.type,
        status: updatedRequest.status,
        from: {
          userId: updatedRequest.fromUserId,
          user: `${updatedRequest.fromUser.firstName} ${updatedRequest.fromUser.lastName}`,
          shift: {
            id: updatedRequest.fromAssignment.shift.id,
            location: updatedRequest.fromAssignment.shift.location.name,
            skill: updatedRequest.fromAssignment.shift.skill?.name,
            date: updatedRequest.fromAssignment.shift.date,
            startTime: updatedRequest.fromAssignment.shift.startTime,
            endTime: updatedRequest.fromAssignment.shift.endTime
          }
        },
        to: {
          userId: updatedRequest.toUserId,
          user: `${updatedRequest.toUser?.firstName} ${updatedRequest.toUser?.lastName}`,
          shift: {
            id: updatedRequest.toAssignment?.shift.id,
            location: updatedRequest.toAssignment?.shift.location.name,
            skill: updatedRequest.toAssignment?.shift.skill?.name,
            date: updatedRequest.toAssignment?.shift.date,
            startTime: updatedRequest.toAssignment?.shift.startTime,
            endTime: updatedRequest.toAssignment?.shift.endTime
          }
        },
        reason: updatedRequest.reason,
        acceptedAt: updatedRequest.acceptedAt,
        createdAt: updatedRequest.createdAt
      }
    })

  } catch (error: any) {
    console.error('Accept swap request error:', error)

    if (error.message === 'Swap request not found') {
      return res.status(404).json({
        error: 'Swap request not found',
        message: `Swap request with ID ${req.params.id} does not exist`
      })
    }

    if (error.message === 'Cannot accept a drop request') {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Drop requests cannot be accepted - use pickup instead'
      })
    }

    if (error.message === 'Only the target user can accept this swap request') {
      return res.status(403).json({
        error: 'Permission denied',
        message: 'You are not the target user for this swap request'
      })
    }

    if (error.message === 'Swap request is not in pending status') {
      return res.status(409).json({
        error: 'Invalid status',
        message: 'This swap request is not pending and cannot be accepted'
      })
    }

    res.status(500).json({
      error: 'Failed to accept swap request',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * POST /swap-requests/:id/approve - Approve a swap request (Manager/Admin only)
 */
router.post('/:id/approve', authenticateToken, requireManagerOrAdmin, async (req: Request, res: Response) => {
  try {
    const swapRequestId = parseInt(req.params.id)

    if (!swapRequestId || isNaN(swapRequestId)) {
      return res.status(400).json({
        error: 'Invalid swap request ID',
        message: 'Swap request ID must be a valid number'
      })
    }

    const approvedRequest = await swapRequestService.approveSwapRequest(
      swapRequestId,
      req.user!.id
    )

    // Emit real-time event for swap approval
    try {
      const socketService = getSocketService()

      // Get the full swap request details for the event
      const fullSwapRequest = await prisma.swapRequest.findUnique({
        where: { id: swapRequestId },
        include: {
          fromAssignment: {
            include: {
              shift: {
                include: { location: true }
              }
            }
          }
        }
      })

      if (fullSwapRequest) {
        socketService.emitSwapResolved({
          swapRequestId: approvedRequest.id,
          status: 'APPROVED',
          fromUserId: fullSwapRequest.fromUserId,
          toUserId: fullSwapRequest.toUserId,
          resolvedBy: {
            id: req.user!.id,
            name: `${req.user!.firstName} ${req.user!.lastName}`,
            role: req.user!.role
          },
          shift: {
            id: fullSwapRequest.fromAssignment.shift.id,
            date: fullSwapRequest.fromAssignment.shift.date.toISOString().split('T')[0],
            startTime: fullSwapRequest.fromAssignment.shift.startTime.toISOString(),
            endTime: fullSwapRequest.fromAssignment.shift.endTime.toISOString(),
            location: fullSwapRequest.fromAssignment.shift.location.name
          }
        })
      }
    } catch (socketError) {
      console.error('Failed to emit swap approved event:', socketError)
    }

    res.json({
      message: 'Swap request approved successfully',
      swapRequest: {
        id: approvedRequest.id,
        status: approvedRequest.status,
        approvedById: approvedRequest.approvedById,
        approvedAt: approvedRequest.approvedAt,
        message: 'Shift assignments have been updated'
      }
    })

  } catch (error: any) {
    console.error('Approve swap request error:', error)

    if (error.message === 'Swap request not found') {
      return res.status(404).json({
        error: 'Swap request not found',
        message: `Swap request with ID ${req.params.id} does not exist`
      })
    }

    if (error.message === 'Swap request must be accepted or pending to approve') {
      return res.status(409).json({
        error: 'Invalid status',
        message: 'This swap request must be accepted or pending to approve'
      })
    }

    if (error.message === 'Constraint validation failed for swap') {
      return res.status(409).json({
        error: 'Constraint violation',
        message: 'The swap cannot be approved due to scheduling constraint violations'
      })
    }

    res.status(500).json({
      error: 'Failed to approve swap request',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * POST /swap-requests/:id/cancel - Cancel a swap request
 */
router.post('/:id/cancel', authenticateToken, async (req: Request, res: Response) => {
  try {
    const swapRequestId = parseInt(req.params.id)

    if (!swapRequestId || isNaN(swapRequestId)) {
      return res.status(400).json({
        error: 'Invalid swap request ID',
        message: 'Swap request ID must be a valid number'
      })
    }

    const cancelledRequest = await swapRequestService.cancelSwapRequest(
      swapRequestId,
      req.user!.id
    )

    // Emit real-time event for swap cancellation
    try {
      const socketService = getSocketService()

      // Get the full swap request details for the event
      const fullSwapRequest = await prisma.swapRequest.findUnique({
        where: { id: swapRequestId },
        include: {
          fromAssignment: {
            include: {
              shift: {
                include: { location: true }
              }
            }
          }
        }
      })

      if (fullSwapRequest) {
        socketService.emitSwapResolved({
          swapRequestId: cancelledRequest.id,
          status: 'CANCELLED',
          fromUserId: fullSwapRequest.fromUserId,
          toUserId: fullSwapRequest.toUserId,
          resolvedBy: {
            id: req.user!.id,
            name: `${req.user!.firstName} ${req.user!.lastName}`,
            role: req.user!.role
          },
          shift: {
            id: fullSwapRequest.fromAssignment.shift.id,
            date: fullSwapRequest.fromAssignment.shift.date.toISOString().split('T')[0],
            startTime: fullSwapRequest.fromAssignment.shift.startTime.toISOString(),
            endTime: fullSwapRequest.fromAssignment.shift.endTime.toISOString(),
            location: fullSwapRequest.fromAssignment.shift.location.name
          }
        })
      }
    } catch (socketError) {
      console.error('Failed to emit swap cancelled event:', socketError)
    }

    res.json({
      message: 'Swap request cancelled successfully',
      swapRequest: {
        id: cancelledRequest.id,
        status: cancelledRequest.status,
        cancelledAt: cancelledRequest.cancelledAt
      }
    })

  } catch (error: any) {
    console.error('Cancel swap request error:', error)

    if (error.message === 'Swap request not found') {
      return res.status(404).json({
        error: 'Swap request not found',
        message: `Swap request with ID ${req.params.id} does not exist`
      })
    }

    if (error.message === 'Only the requesting user can cancel this request') {
      return res.status(403).json({
        error: 'Permission denied',
        message: 'You can only cancel your own swap requests'
      })
    }

    if (error.message === 'Cannot cancel an already approved swap request') {
      return res.status(409).json({
        error: 'Invalid operation',
        message: 'Cannot cancel a swap request that has already been approved'
      })
    }

    res.status(500).json({
      error: 'Failed to cancel swap request',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * POST /swap-requests/:id/pickup - Pick up a dropped shift
 */
router.post('/:id/pickup', authenticateToken, async (req: Request, res: Response) => {
  try {
    const swapRequestId = parseInt(req.params.id)

    if (!swapRequestId || isNaN(swapRequestId)) {
      return res.status(400).json({
        error: 'Invalid swap request ID',
        message: 'Swap request ID must be a valid number'
      })
    }

    const assignment = await swapRequestService.pickupDroppedShift(
      swapRequestId,
      req.user!.id
    )

    res.json({
      message: 'Shift picked up successfully',
      assignment: {
        id: assignment.id,
        shiftId: assignment.shiftId,
        userId: assignment.userId,
        assignedAt: assignment.assignedAt,
        message: 'You have been assigned to this shift'
      }
    })

  } catch (error: any) {
    console.error('Pickup dropped shift error:', error)

    if (error.message === 'Drop request not found') {
      return res.status(404).json({
        error: 'Drop request not found',
        message: `Drop request with ID ${req.params.id} does not exist`
      })
    }

    if (error.message === 'Not a drop request') {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'This is not a drop request'
      })
    }

    if (error.message === 'Drop request is not available for pickup') {
      return res.status(409).json({
        error: 'Unavailable',
        message: 'This drop request is no longer available for pickup'
      })
    }

    if (error.message === 'Cannot pick up your own dropped shift') {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'You cannot pick up your own dropped shift'
      })
    }

    if (error.message === 'Drop request has expired') {
      return res.status(410).json({
        error: 'Request expired',
        message: 'This drop request has expired and is no longer available'
      })
    }

    if (error.message.includes('You are not qualified')) {
      return res.status(409).json({
        error: 'Not qualified',
        message: error.message
      })
    }

    if (error.message === 'Assignment violates scheduling constraints') {
      return res.status(409).json({
        error: 'Constraint violation',
        message: 'Picking up this shift would violate scheduling constraints'
      })
    }

    res.status(500).json({
      error: 'Failed to pick up shift',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * GET /swap-requests - Get swap requests (filtered by user role)
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { status, type } = req.query
    const userId = req.user!.id
    const userRole = req.user!.role

    let whereClause: any = {}

    // Filter by status if provided
    if (status) {
      whereClause.status = status
    }

    // Filter by type if provided
    if (type) {
      whereClause.type = type
    }

    // Role-based filtering
    if (userRole === 'STAFF') {
      // Staff can only see requests involving them
      whereClause.OR = [
        { fromUserId: userId },
        { toUserId: userId }
      ]
    }
    // Managers and admins can see all requests

    const swapRequests = await prisma.swapRequest.findMany({
      where: whereClause,
      include: {
        fromUser: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        toUser: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        fromAssignment: {
          include: {
            shift: {
              include: {
                location: { select: { id: true, name: true } },
                skill: { select: { id: true, name: true } }
              }
            }
          }
        },
        toAssignment: {
          include: {
            shift: {
              include: {
                location: { select: { id: true, name: true } },
                skill: { select: { id: true, name: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedRequests = swapRequests.map(request => ({
      id: request.id,
      type: request.type,
      status: request.status,
      reason: request.reason,
      from: {
        userId: request.fromUserId,
        user: `${request.fromUser.firstName} ${request.fromUser.lastName}`,
        shift: {
          id: request.fromAssignment.shift.id,
          location: request.fromAssignment.shift.location.name,
          skill: request.fromAssignment.shift.skill?.name,
          date: request.fromAssignment.shift.date,
          startTime: request.fromAssignment.shift.startTime,
          endTime: request.fromAssignment.shift.endTime
        }
      },
      to: request.toAssignment ? {
        userId: request.toUserId,
        user: `${request.toUser?.firstName} ${request.toUser?.lastName}`,
        shift: {
          id: request.toAssignment.shift.id,
          location: request.toAssignment.shift.location.name,
          skill: request.toAssignment.shift.skill?.name,
          date: request.toAssignment.shift.date,
          startTime: request.toAssignment.shift.startTime,
          endTime: request.toAssignment.shift.endTime
        }
      } : null,
      expiresAt: request.expiresAt,
      acceptedAt: request.acceptedAt,
      approvedAt: request.approvedAt,
      cancelledAt: request.cancelledAt,
      createdAt: request.createdAt
    }))

    res.json({
      message: 'Swap requests retrieved successfully',
      count: formattedRequests.length,
      swapRequests: formattedRequests
    })

  } catch (error) {
    console.error('Get swap requests error:', error)
    res.status(500).json({
      error: 'Failed to retrieve swap requests',
      message: 'An internal server error occurred'
    })
  }
})

export default router