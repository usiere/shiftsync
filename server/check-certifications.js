const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCertifications() {
  try {
    console.log('=== Checking Ryan Anderson certification ===')

    // Find Ryan Anderson
    const ryan = await prisma.user.findFirst({
      where: {
        OR: [
          { firstName: { contains: 'Ryan', mode: 'insensitive' } },
          { lastName: { contains: 'Anderson', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    })

    if (!ryan) {
      console.log('❌ Ryan Anderson not found in database')
      return
    }

    console.log('✅ Found Ryan Anderson:', ryan)

    // Find Downtown Manhattan location
    const downtown = await prisma.location.findFirst({
      where: {
        name: { contains: 'Downtown Manhattan', mode: 'insensitive' }
      },
      select: {
        id: true,
        name: true
      }
    })

    if (!downtown) {
      console.log('❌ Downtown Manhattan location not found')
      return
    }

    console.log('✅ Found Downtown Manhattan location:', downtown)

    // Check Ryan's location certifications
    const ryanCerts = await prisma.locationCertification.findMany({
      where: {
        userId: ryan.id
      },
      include: {
        location: {
          select: { id: true, name: true }
        }
      }
    })

    console.log(`\n=== Ryan's Location Certifications (${ryanCerts.length}) ===`)
    ryanCerts.forEach(cert => {
      console.log(`- Location ID ${cert.locationId}: ${cert.location.name}`)
    })

    // Check if Ryan is certified at Downtown Manhattan
    const downtownCert = ryanCerts.find(cert => cert.locationId === downtown.id)
    if (downtownCert) {
      console.log(`✅ Ryan IS certified at Downtown Manhattan (cert ID: ${downtownCert.id})`)
    } else {
      console.log('❌ Ryan is NOT certified at Downtown Manhattan')
    }

    // Check Ryan's skills
    const ryanSkills = await prisma.userSkill.findMany({
      where: {
        userId: ryan.id
      },
      include: {
        skill: {
          select: { id: true, name: true }
        }
      }
    })

    console.log(`\n=== Ryan's Skills (${ryanSkills.length}) ===`)
    ryanSkills.forEach(skill => {
      console.log(`- Skill ID ${skill.skillId}: ${skill.skill.name}`)
    })

    // Find Bartender skill
    const bartenderSkill = await prisma.skill.findFirst({
      where: {
        name: { contains: 'Bartender', mode: 'insensitive' }
      }
    })

    if (bartenderSkill) {
      console.log(`\n✅ Found Bartender skill: ID ${bartenderSkill.id}`)
      const hasBartenderSkill = ryanSkills.some(skill => skill.skillId === bartenderSkill.id)
      if (hasBartenderSkill) {
        console.log('✅ Ryan HAS Bartender skill')
      } else {
        console.log('❌ Ryan does NOT have Bartender skill')
      }
    }

    // Check all staff with Bartender skill and Downtown Manhattan certification
    console.log('\n=== All staff with Bartender skill and Downtown Manhattan certification ===')
    const qualifiedStaff = await prisma.user.findMany({
      where: {
        role: 'STAFF',
        isActive: true,
        userSkills: {
          some: {
            skillId: bartenderSkill?.id
          }
        },
        locationCertifications: {
          some: {
            locationId: downtown.id
          }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    })

    console.log(`Found ${qualifiedStaff.length} qualified staff:`)
    qualifiedStaff.forEach(staff => {
      console.log(`- ID ${staff.id}: ${staff.firstName} ${staff.lastName} (${staff.email})`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCertifications()