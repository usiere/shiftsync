const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function findAlex() {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: 'Alex', mode: 'insensitive' } },
          { lastName: { contains: 'Thompson', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true
      }
    })

    console.log('Found users matching Alex Thompson:')
    console.log(users)

    if (users.length === 0) {
      console.log('\nNo users found matching Alex Thompson. Let me check all users:')
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      })
      console.log('All users in database:')
      console.log(allUsers)
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findAlex()