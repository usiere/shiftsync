const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSwapRequests() {
  try {
    console.log('=== All Swap Requests ===')

    const allSwapRequests = await prisma.swapRequest.findMany({
      include: {
        fromAssignment: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            shift: {
              include: {
                location: { select: { name: true } }
              }
            }
          }
        },
        toAssignment: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            shift: {
              include: {
                location: { select: { name: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`Found ${allSwapRequests.length} swap requests:`)

    allSwapRequests.forEach((request, index) => {
      console.log(`\n${index + 1}. Swap Request ID: ${request.id}`)
      console.log(`   Type: ${request.type}`)
      console.log(`   Status: ${request.status}`)
      console.log(`   Created: ${request.createdAt.toISOString()}`)

      if (request.fromAssignment) {
        const from = request.fromAssignment
        console.log(`   FROM: ${from.user.firstName} ${from.user.lastName}`)
        console.log(`         Shift ${from.shift.id} on ${from.shift.date.toISOString().split('T')[0]}`)
        console.log(`         ${from.shift.startTime.toISOString().split('T')[1].slice(0,5)} - ${from.shift.endTime.toISOString().split('T')[1].slice(0,5)}`)
        console.log(`         Location: ${from.shift.location.name}`)
      }

      if (request.toAssignment) {
        const to = request.toAssignment
        console.log(`   TO:   ${to.user.firstName} ${to.user.lastName}`)
        console.log(`         Shift ${to.shift.id} on ${to.shift.date.toISOString().split('T')[0]}`)
        console.log(`         ${to.shift.startTime.toISOString().split('T')[1].slice(0,5)} - ${to.shift.endTime.toISOString().split('T')[1].slice(0,5)}`)
        console.log(`         Location: ${to.shift.location.name}`)
      }

      if (request.reason) {
        console.log(`   Reason: ${request.reason}`)
      }
    })

    // Check specifically for Alex Thompson (userId: 43) and Ryan Anderson (userId: 49)
    console.log('\n=== Swap Requests involving Alex Thompson (ID: 43) ===')
    const alexRequests = await prisma.swapRequest.findMany({
      where: {
        OR: [
          { fromAssignment: { userId: 43 } },
          { toAssignment: { userId: 43 } }
        ]
      },
      include: {
        fromAssignment: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        },
        toAssignment: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      }
    })

    console.log(`Found ${alexRequests.length} requests involving Alex Thompson`)
    alexRequests.forEach(request => {
      console.log(`- Request ${request.id}: ${request.status}`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSwapRequests()