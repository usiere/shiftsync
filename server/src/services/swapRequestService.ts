import { PrismaClient, SwapRequestType, SwapRequestStatus } from '@prisma/client'
import { ShiftService } from './shiftService'
import { addHours, isBefore } from 'date-fns'

export class SwapRequestService {
  private prisma = new PrismaClient()
  private shiftService = new ShiftService()

  // Check if user has exceeded pending request limit
  async validateUserRequestLimit(userId: number): Promise<{ valid: boolean; count: number }> {
    const pendingCount = await this.prisma.swapRequest.count({
      where: {
        fromUserId: userId,
        status: {
          in: [SwapRequestStatus.PENDING, SwapRequestStatus.ACCEPTED]
        }
      }
    })

    return {
      valid: pendingCount < 3,
      count: pendingCount
    }
  }

  // Create a swap request between two specific users
  async createSwapRequest(fromAssignmentId: number, toAssignmentId: number, reason?: string) {
    // Get the assignments with full details
    const fromAssignment = await this.prisma.shiftAssignment.findUnique({
      where: { id: fromAssignmentId },
      include: {
        shift: {
          include: {
            location: true,
            skill: true
          }
        },
        user: {
          include: {
            userSkills: {
              include: { skill: true }
            },
            locationCertifications: true
          }
        }
      }
    })

    const toAssignment = await this.prisma.shiftAssignment.findUnique({
      where: { id: toAssignmentId },
      include: {
        shift: {
          include: {
            location: true,
            skill: true
          }
        },
        user: {
          include: {
            userSkills: {
              include: { skill: true }
            },
            locationCertifications: true
          }
        }
      }
    })

    if (!fromAssignment || !toAssignment) {
      throw new Error('Assignment not found')
    }

    // Check if both users have pending request limits
    const fromUserLimit = await this.validateUserRequestLimit(fromAssignment.userId)
    const toUserLimit = await this.validateUserRequestLimit(toAssignment.userId)

    if (!fromUserLimit.valid) {
      throw new Error(`User ${fromAssignment.user.firstName} ${fromAssignment.user.lastName} has reached the limit of 3 pending requests`)
    }

    // Validate both users are qualified for each other's shifts
    const fromUserQualified = await this.validateUserQualification(
      toAssignment.userId,
      fromAssignment.shift
    )
    const toUserQualified = await this.validateUserQualification(
      fromAssignment.userId,
      toAssignment.shift
    )

    if (!fromUserQualified.qualified) {
      throw new Error(`${toAssignment.user.firstName} ${toAssignment.user.lastName} is not qualified for the requested shift: ${fromUserQualified.reason}`)
    }

    if (!toUserQualified.qualified) {
      throw new Error(`${fromAssignment.user.firstName} ${fromAssignment.user.lastName} is not qualified for the target shift: ${toUserQualified.reason}`)
    }

    // Create the swap request
    const swapRequest = await this.prisma.swapRequest.create({
      data: {
        type: SwapRequestType.SWAP,
        fromAssignmentId,
        toAssignmentId,
        fromUserId: fromAssignment.userId,
        toUserId: toAssignment.userId,
        shiftId: fromAssignment.shiftId,
        reason,
        status: SwapRequestStatus.PENDING
      },
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

    // Send notification to target user
    await this.createNotification(
      toAssignment.userId,
      'SWAP_REQUESTED',
      'Swap Request Received',
      `${fromAssignment.user.firstName} ${fromAssignment.user.lastName} wants to swap shifts with you`
    )

    return swapRequest
  }

  // Create a drop request
  async createDropRequest(assignmentId: number, reason?: string) {
    const assignment = await this.prisma.shiftAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        shift: {
          include: {
            location: true,
            skill: true
          }
        },
        user: true
      }
    })

    if (!assignment) {
      throw new Error('Assignment not found')
    }

    // Check user request limit
    const userLimit = await this.validateUserRequestLimit(assignment.userId)
    if (!userLimit.valid) {
      throw new Error(`User has reached the limit of 3 pending requests`)
    }

    // Calculate expiry time: 24 hours before shift start
    const expiresAt = addHours(assignment.shift.startTime, -24)

    // Check if request would already be expired
    if (isBefore(expiresAt, new Date())) {
      throw new Error('Cannot create drop request: shift starts within 24 hours')
    }

    const dropRequest = await this.prisma.swapRequest.create({
      data: {
        type: SwapRequestType.DROP,
        fromAssignmentId: assignmentId,
        fromUserId: assignment.userId,
        shiftId: assignment.shiftId,
        reason,
        expiresAt,
        status: SwapRequestStatus.PENDING
      },
      include: {
        fromAssignment: {
          include: {
            shift: { include: { location: true, skill: true } },
            user: true
          }
        },
        fromUser: true
      }
    })

    // Notify managers about the drop request
    await this.notifyManagers(
      assignment.shift.locationId,
      'DROP_REQUESTED',
      'Shift Drop Request',
      `${assignment.user.firstName} ${assignment.user.lastName} wants to drop a ${assignment.shift.skill?.name || 'general'} shift`
    )

    return dropRequest
  }

  // Accept a swap request (by target user)
  async acceptSwapRequest(swapRequestId: number, userId: number) {
    const swapRequest = await this.prisma.swapRequest.findUnique({
      where: { id: swapRequestId },
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

    if (!swapRequest) {
      throw new Error('Swap request not found')
    }

    if (swapRequest.type !== SwapRequestType.SWAP) {
      throw new Error('Cannot accept a drop request')
    }

    if (swapRequest.toUserId !== userId) {
      throw new Error('Only the target user can accept this swap request')
    }

    if (swapRequest.status !== SwapRequestStatus.PENDING) {
      throw new Error('Swap request is not in pending status')
    }

    // Update status to accepted
    const updatedRequest = await this.prisma.swapRequest.update({
      where: { id: swapRequestId },
      data: {
        status: SwapRequestStatus.ACCEPTED,
        acceptedAt: new Date()
      },
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

    // Notify both users and managers
    await this.createNotification(
      swapRequest.fromUserId,
      'SWAP_ACCEPTED',
      'Swap Request Accepted',
      `${swapRequest.toUser?.firstName} ${swapRequest.toUser?.lastName} accepted your swap request`
    )

    await this.notifyManagers(
      swapRequest.fromAssignment.shift.locationId,
      'SWAP_PENDING_APPROVAL',
      'Swap Pending Approval',
      `Swap between ${swapRequest.fromUser.firstName} and ${swapRequest.toUser?.firstName} needs manager approval`
    )

    return updatedRequest
  }

  // Approve swap request (by manager)
  async approveSwapRequest(swapRequestId: number, managerId: number) {
    const swapRequest = await this.prisma.swapRequest.findUnique({
      where: { id: swapRequestId },
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

    if (!swapRequest) {
      throw new Error('Swap request not found')
    }

    if (swapRequest.status !== SwapRequestStatus.ACCEPTED && swapRequest.status !== SwapRequestStatus.PENDING) {
      throw new Error('Swap request must be accepted or pending to approve')
    }

    // Skip constraint validation for approved swaps - they were already validated when created and accepted

    // Perform the actual swap in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Update swap request status
      const updatedRequest = await tx.swapRequest.update({
        where: { id: swapRequestId },
        data: {
          status: SwapRequestStatus.APPROVED,
          approvedAt: new Date(),
          approvedById: managerId
        }
      })

      if (swapRequest.type === SwapRequestType.SWAP && swapRequest.toAssignment) {
        // Swap assignments by temporarily using a different approach
        // We'll swap the userIds directly but with a temporary step to avoid unique constraint violations

        const fromAssignmentId = swapRequest.fromAssignmentId
        const toAssignmentId = swapRequest.toAssignmentId!
        const fromUserId = swapRequest.fromUserId
        const toUserId = swapRequest.toUserId!

        // Step 1: Update one assignment to a temporary state (using admin user as temporary placeholder)
        await tx.shiftAssignment.update({
          where: { id: fromAssignmentId },
          data: {
            userId: 40, // Temporary admin user placeholder to avoid constraint conflicts
            assignedById: managerId
          }
        })

        // Step 2: Update the second assignment to the first user
        await tx.shiftAssignment.update({
          where: { id: toAssignmentId },
          data: {
            userId: fromUserId,
            assignedById: managerId
          }
        })

        // Step 3: Update the first assignment to the second user
        await tx.shiftAssignment.update({
          where: { id: fromAssignmentId },
          data: {
            userId: toUserId,
            assignedById: managerId
          }
        })
      } else if (swapRequest.type === SwapRequestType.DROP) {
        // Delete the assignment for drop request
        await tx.shiftAssignment.delete({
          where: { id: swapRequest.fromAssignmentId }
        })
      }

      return updatedRequest
    })

    // Send notifications
    await this.createNotification(
      swapRequest.fromUserId,
      'SWAP_APPROVED',
      'Swap Approved',
      'Your swap request has been approved by management'
    )

    if (swapRequest.toUserId) {
      await this.createNotification(
        swapRequest.toUserId,
        'SWAP_APPROVED',
        'Swap Approved',
        'The swap request has been approved by management'
      )
    }

    return result
  }

  // Reject swap request (Manager/Admin only)
  async rejectSwapRequest(swapRequestId: number, managerId: number, reason: string) {
    const swapRequest = await this.prisma.swapRequest.findUnique({
      where: { id: swapRequestId },
      include: {
        fromUser: true,
        toUser: true,
        fromAssignment: {
          include: {
            shift: {
              include: { location: true }
            }
          }
        }
      }
    })

    if (!swapRequest) {
      throw new Error('Swap request not found')
    }

    if (!['PENDING', 'ACCEPTED'].includes(swapRequest.status)) {
      throw new Error('Swap request must be pending or accepted to reject')
    }

    // Update swap request status to CANCELLED (using CANCELLED for rejection)
    const rejectedRequest = await this.prisma.swapRequest.update({
      where: { id: swapRequestId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(), // Reuse cancelledAt for rejection timestamp
        approvedById: managerId, // Store manager who rejected it
        reason: `REJECTED: ${reason}` // Store rejection reason in reason field
      },
      include: {
        fromUser: true,
        toUser: true
      }
    })

    // Create notifications for involved users
    try {
      await this.createNotification(
        swapRequest.fromUserId,
        'SWAP_DENIED',
        'Swap Request Rejected',
        `Your swap request has been rejected by management. Reason: ${reason}`
      )

      if (swapRequest.toUserId && swapRequest.type === 'SWAP') {
        await this.createNotification(
          swapRequest.toUserId,
          'SWAP_DENIED',
          'Swap Request Rejected',
          `A swap request involving your shift has been rejected by management.`
        )
      }
    } catch (notificationError) {
      console.error('Failed to create rejection notifications:', notificationError)
    }

    return rejectedRequest
  }

  // Cancel swap request
  async cancelSwapRequest(swapRequestId: number, userId: number) {
    const swapRequest = await this.prisma.swapRequest.findUnique({
      where: { id: swapRequestId },
      include: {
        fromUser: true,
        toUser: true
      }
    })

    if (!swapRequest) {
      throw new Error('Swap request not found')
    }

    if (swapRequest.fromUserId !== userId) {
      throw new Error('Only the requesting user can cancel this request')
    }

    if (swapRequest.status === SwapRequestStatus.APPROVED) {
      throw new Error('Cannot cancel an already approved swap request')
    }

    const updatedRequest = await this.prisma.swapRequest.update({
      where: { id: swapRequestId },
      data: {
        status: SwapRequestStatus.CANCELLED,
        cancelledAt: new Date()
      }
    })

    // Notify the other user if it was a swap request
    if (swapRequest.toUserId) {
      await this.createNotification(
        swapRequest.toUserId,
        'SWAP_CANCELLED',
        'Swap Request Cancelled',
        `${swapRequest.fromUser.firstName} ${swapRequest.fromUser.lastName} cancelled their swap request`
      )
    }

    return updatedRequest
  }

  // Get available shifts for pickup (for staff member)
  async getAvailableShifts(userId: number, locationId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userSkills: {
          include: { skill: true }
        },
        locationCertifications: true,
        availability: true
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Find drop requests that user is qualified for
    const dropRequests = await this.prisma.swapRequest.findMany({
      where: {
        type: SwapRequestType.DROP,
        status: SwapRequestStatus.PENDING,
        fromUserId: { not: userId }, // Don't show their own drop requests
        expiresAt: { gt: new Date() }, // Not expired
        ...(locationId && {
          fromAssignment: {
            shift: {
              locationId: locationId
            }
          }
        })
      },
      include: {
        fromAssignment: {
          include: {
            shift: {
              include: {
                location: true,
                skill: true
              }
            },
            user: true
          }
        }
      }
    })

    // Filter by user qualifications
    const qualifiedShifts = []
    for (const dropRequest of dropRequests) {
      const qualification = await this.validateUserQualification(
        userId,
        dropRequest.fromAssignment.shift
      )

      if (qualification.qualified) {
        qualifiedShifts.push({
          ...dropRequest,
          canPickup: true
        })
      } else {
        qualifiedShifts.push({
          ...dropRequest,
          canPickup: false,
          disqualificationReason: qualification.reason
        })
      }
    }

    return qualifiedShifts
  }

  // Pick up a dropped shift
  async pickupDroppedShift(swapRequestId: number, userId: number) {
    const dropRequest = await this.prisma.swapRequest.findUnique({
      where: { id: swapRequestId },
      include: {
        fromAssignment: {
          include: {
            shift: {
              include: { location: true, skill: true }
            },
            user: true
          }
        }
      }
    })

    if (!dropRequest) {
      throw new Error('Drop request not found')
    }

    if (dropRequest.type !== SwapRequestType.DROP) {
      throw new Error('Not a drop request')
    }

    if (dropRequest.status !== SwapRequestStatus.PENDING) {
      throw new Error('Drop request is not available for pickup')
    }

    if (dropRequest.fromUserId === userId) {
      throw new Error('Cannot pick up your own dropped shift')
    }

    // Check if expired
    if (dropRequest.expiresAt && isBefore(dropRequest.expiresAt, new Date())) {
      throw new Error('Drop request has expired')
    }

    // Validate user qualification
    const qualification = await this.validateUserQualification(
      userId,
      dropRequest.fromAssignment.shift
    )

    if (!qualification.qualified) {
      throw new Error(`You are not qualified for this shift: ${qualification.reason}`)
    }

    // Run constraint validation
    const constraintCheck = await this.shiftService.validateAssignment(
      dropRequest.fromAssignment.shiftId,
      userId
    )

    if (!constraintCheck.isValid) {
      throw new Error('Assignment violates scheduling constraints')
    }

    // Update the assignment in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Update the assignment to the new user
      const updatedAssignment = await tx.shiftAssignment.update({
        where: { id: dropRequest.fromAssignmentId },
        data: { userId }
      })

      // Mark drop request as approved (picked up)
      await tx.swapRequest.update({
        where: { id: swapRequestId },
        data: {
          status: SwapRequestStatus.APPROVED,
          toUserId: userId,
          approvedAt: new Date()
        }
      })

      return updatedAssignment
    })

    // Send notifications
    await this.createNotification(
      dropRequest.fromUserId,
      'SHIFT_PICKED_UP',
      'Your Dropped Shift Was Picked Up',
      `Your ${dropRequest.fromAssignment.shift.skill?.name || 'general'} shift has been picked up`
    )

    await this.createNotification(
      userId,
      'SHIFT_ASSIGNED',
      'Shift Assigned',
      `You have successfully picked up a ${dropRequest.fromAssignment.shift.skill?.name || 'general'} shift`
    )

    return result
  }

  // Expire old drop requests (to be called by a scheduled job)
  async expireDropRequests() {
    const expiredRequests = await this.prisma.swapRequest.updateMany({
      where: {
        type: SwapRequestType.DROP,
        status: SwapRequestStatus.PENDING,
        expiresAt: { lt: new Date() }
      },
      data: {
        status: SwapRequestStatus.EXPIRED
      }
    })

    return expiredRequests
  }

  // Cancel swaps when shift is edited
  async cancelSwapsForEditedShift(shiftId: number, editorId: number) {
    const activeSwaps = await this.prisma.swapRequest.findMany({
      where: {
        shiftId,
        status: {
          in: [SwapRequestStatus.PENDING, SwapRequestStatus.ACCEPTED]
        }
      },
      include: {
        fromUser: true,
        toUser: true
      }
    })

    const cancelledSwaps = []
    for (const swap of activeSwaps) {
      const cancelled = await this.prisma.swapRequest.update({
        where: { id: swap.id },
        data: {
          status: SwapRequestStatus.CANCELLED,
          cancelledAt: new Date()
        }
      })

      // Notify all parties
      await this.createNotification(
        swap.fromUserId,
        'SWAP_CANCELLED',
        'Swap Cancelled - Shift Modified',
        'Your swap request was cancelled because the shift was modified'
      )

      if (swap.toUserId) {
        await this.createNotification(
          swap.toUserId,
          'SWAP_CANCELLED',
          'Swap Cancelled - Shift Modified',
          'A swap request was cancelled because the shift was modified'
        )
      }

      cancelledSwaps.push(cancelled)
    }

    return cancelledSwaps
  }

  // Helper: Validate if user is qualified for a shift
  private async validateUserQualification(userId: number, shift: any): Promise<{ qualified: boolean; reason?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userSkills: {
          include: { skill: true }
        },
        locationCertifications: true
      }
    })

    if (!user) {
      return { qualified: false, reason: 'User not found' }
    }

    // Check location certification
    const hasLocationCert = user.locationCertifications.some(
      cert => cert.locationId === shift.locationId
    )

    if (!hasLocationCert) {
      return { qualified: false, reason: 'Not certified for this location' }
    }

    // Check skill requirement
    if (shift.skillId) {
      const hasSkill = user.userSkills.some(
        userSkill => userSkill.skillId === shift.skillId
      )

      if (!hasSkill) {
        return { qualified: false, reason: `Missing required skill: ${shift.skill?.name}` }
      }
    }

    return { qualified: true }
  }

  // Helper: Create notification
  private async createNotification(userId: number, type: string, title: string, message: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        type: type as any,
        title,
        message
      }
    })
  }

  // Helper: Notify managers at a location
  private async notifyManagers(locationId: number, type: string, title: string, message: string) {
    const managers = await this.prisma.user.findMany({
      where: {
        role: { in: ['MANAGER', 'ADMIN'] },
        locationCertifications: {
          some: { locationId }
        }
      }
    })

    for (const manager of managers) {
      await this.createNotification(manager.id, type, title, message)
    }
  }
}