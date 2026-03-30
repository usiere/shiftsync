const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkRyanShifts() {
  try {
    // Find Ryan Anderson
    const ryan = await prisma.user.findFirst({
      where: {
        firstName: 'Ryan',
        lastName: 'Anderson'
      }
    })

    if (!ryan) {
      console.log('Ryan not found')
      return
    }

    console.log('=== Ryan Anderson Shift Assignments ===')

    // Get all Ryan's assignments
    const ryanAssignments = await prisma.shiftAssignment.findMany({
      where: {
        userId: ryan.id
      },
      include: {
        shift: {
          include: {
            location: { select: { name: true, timezone: true } },
            skill: { select: { name: true } }
          }
        }
      },
      orderBy: {
        shift: { date: 'asc' }
      }
    })

    console.log(`Found ${ryanAssignments.length} assignments for Ryan Anderson:`)
    ryanAssignments.forEach(assignment => {
      const shift = assignment.shift
      console.log(`- Assignment ID: ${assignment.id}`)
      console.log(`  Shift ID: ${shift.id}`)
      console.log(`  Date: ${shift.date.toISOString().split('T')[0]}`)
      console.log(`  Time: ${shift.startTime.toISOString().split('T')[1].slice(0,5)} - ${shift.endTime.toISOString().split('T')[1].slice(0,5)}`)
      console.log(`  Location: ${shift.location.name}`)
      console.log(`  Skill: ${shift.skill?.name || 'No skill required'}`)
      console.log(`  Status: ${shift.status}`)
      console.log('')
    })

    // Now let's check Alex Thompson's assignments for comparison
    const alex = await prisma.user.findFirst({
      where: {
        firstName: 'Alex',
        lastName: 'Thompson'
      }
    })

    if (alex) {
      console.log('=== Alex Thompson Shift Assignments ===')
      const alexAssignments = await prisma.shiftAssignment.findMany({
        where: {
          userId: alex.id
        },
        include: {
          shift: {
            include: {
              location: { select: { name: true } },
              skill: { select: { name: true } }
            }
          }
        },
        orderBy: {
          shift: { date: 'asc' }
        }
      })

      console.log(`Found ${alexAssignments.length} assignments for Alex Thompson:`)
      alexAssignments.forEach(assignment => {
        const shift = assignment.shift
        console.log(`- Assignment ID: ${assignment.id}`)
        console.log(`  Shift ID: ${shift.id}`)
        console.log(`  Date: ${shift.date.toISOString().split('T')[0]}`)
        console.log(`  Time: ${shift.startTime.toISOString().split('T')[1].slice(0,5)} - ${shift.endTime.toISOString().split('T')[1].slice(0,5)}`)
        console.log(`  Location: ${shift.location.name}`)
        console.log(`  Skill: ${shift.skill?.name || 'No skill required'}`)
        console.log('')
      })
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRyanShifts()