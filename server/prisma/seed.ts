import { PrismaClient, UserRole, ShiftStatus } from '@prisma/client'
import { addDays, addHours, setHours, setMinutes, startOfWeek } from 'date-fns'
import { hashPassword } from '../src/utils/password'

const prisma = new PrismaClient()

// Helper function to create UTC datetime
function createUTCDate(year: number, month: number, day: number, hour: number, minute: number = 0): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute))
}

// Get current week start (March 29, 2026) as our seed week start
function getCurrentWeekStart(): Date {
  // March 29, 2026 is a Sunday - start of the current week
  const currentWeekStart = new Date('2026-03-29T00:00:00Z')
  return currentWeekStart
}

async function main() {
  console.log('🌱 Starting seed...')

  // Clean existing data
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.swapRequest.deleteMany()
  await prisma.shiftAssignment.deleteMany()
  await prisma.shift.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.locationCertification.deleteMany()
  await prisma.userSkill.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.location.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Skills
  console.log('Creating skills...')
  const skills = await Promise.all([
    prisma.skill.create({
      data: {
        name: 'Bartender',
        description: 'Mixing drinks, cocktail preparation, bar management'
      }
    }),
    prisma.skill.create({
      data: {
        name: 'Line Cook',
        description: 'Food preparation, cooking, kitchen operations'
      }
    }),
    prisma.skill.create({
      data: {
        name: 'Server',
        description: 'Table service, customer interaction, order taking'
      }
    }),
    prisma.skill.create({
      data: {
        name: 'Host',
        description: 'Greeting customers, seating, reservation management'
      }
    })
  ])

  // 2. Create Locations (4 total: 2 in each timezone)
  console.log('Creating locations...')
  const locations = await Promise.all([
    // East Coast locations
    prisma.location.create({
      data: {
        name: 'Downtown Manhattan',
        address: '123 Broadway',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        timezone: 'America/New_York'
      }
    }),
    prisma.location.create({
      data: {
        name: 'Brooklyn Heights',
        address: '456 Atlantic Ave',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11201',
        timezone: 'America/New_York'
      }
    }),
    // West Coast locations
    prisma.location.create({
      data: {
        name: 'Beverly Hills',
        address: '789 Rodeo Drive',
        city: 'Beverly Hills',
        state: 'CA',
        zipCode: '90210',
        timezone: 'America/Los_Angeles'
      }
    }),
    prisma.location.create({
      data: {
        name: 'Santa Monica Pier',
        address: '321 Ocean Ave',
        city: 'Santa Monica',
        state: 'CA',
        zipCode: '90401',
        timezone: 'America/Los_Angeles'
      }
    })
  ])

  // 3. Create Users (1 admin + 2 managers + 10 staff)
  console.log('Creating users...')

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@shiftsync.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1-555-0100',
      password: await hashPassword('admin123'),
      role: UserRole.ADMIN
    }
  })

  // Managers (each assigned to 2 locations)
  const manager1 = await prisma.user.create({
    data: {
      email: 'manager.east@shiftsync.com',
      firstName: 'Michael',
      lastName: 'Chen',
      phone: '+1-555-0101',
      password: await hashPassword('manager123'),
      role: UserRole.MANAGER
    }
  })

  const manager2 = await prisma.user.create({
    data: {
      email: 'manager.west@shiftsync.com',
      firstName: 'Jennifer',
      lastName: 'Rodriguez',
      phone: '+1-555-0102',
      password: await hashPassword('manager123'),
      role: UserRole.MANAGER
    }
  })

  // Staff members with varied skill sets
  const staffData = [
    { firstName: 'Alex', lastName: 'Thompson', skills: ['Bartender', 'Server'] },
    { firstName: 'Maria', lastName: 'Garcia', skills: ['Server', 'Host'] },
    { firstName: 'James', lastName: 'Wilson', skills: ['Line Cook'] },
    { firstName: 'Emma', lastName: 'Davis', skills: ['Bartender'] },
    { firstName: 'David', lastName: 'Brown', skills: ['Server'] },
    { firstName: 'Lisa', lastName: 'Miller', skills: ['Host', 'Server'] },
    { firstName: 'Ryan', lastName: 'Anderson', skills: ['Line Cook', 'Bartender'] },
    { firstName: 'Nicole', lastName: 'Taylor', skills: ['Server'] },
    { firstName: 'Kevin', lastName: 'Moore', skills: ['Host'] },
    { firstName: 'Amanda', lastName: 'Jackson', skills: ['Line Cook', 'Server'] }
  ]

  const staff = []
  for (let i = 0; i < staffData.length; i++) {
    const staffMember = await prisma.user.create({
      data: {
        email: `staff${i + 1}@shiftsync.com`,
        firstName: staffData[i].firstName,
        lastName: staffData[i].lastName,
        phone: `+1-555-02${(i + 10).toString().padStart(2, '0')}`,
        password: await hashPassword('staff123'),
        role: UserRole.STAFF
      }
    })
    staff.push(staffMember)

    // Assign skills to staff
    for (const skillName of staffData[i].skills) {
      const skill = skills.find(s => s.name === skillName)!
      await prisma.userSkill.create({
        data: {
          userId: staffMember.id,
          skillId: skill.id,
          proficiency: Math.floor(Math.random() * 3) + 3, // 3-5 proficiency
          certifiedAt: new Date()
        }
      })
    }
  }

  // 4. Create Location Certifications
  console.log('Creating location certifications...')

  // Manager 1 certified at East Coast locations
  await Promise.all([
    prisma.locationCertification.create({
      data: { userId: manager1.id, locationId: locations[0].id }
    }),
    prisma.locationCertification.create({
      data: { userId: manager1.id, locationId: locations[1].id }
    })
  ])

  // Manager 2 certified at West Coast locations
  await Promise.all([
    prisma.locationCertification.create({
      data: { userId: manager2.id, locationId: locations[2].id }
    }),
    prisma.locationCertification.create({
      data: { userId: manager2.id, locationId: locations[3].id }
    })
  ])

  // Staff certifications (mix of single and multiple locations)
  const staffLocationMapping = [
    [0, 1], // Alex - both East Coast
    [0],    // Maria - Manhattan only
    [1],    // James - Brooklyn only
    [2, 3], // Emma - both West Coast
    [2],    // David - Beverly Hills only
    [3],    // Lisa - Santa Monica only
    [0, 2], // Ryan - Manhattan + Beverly Hills
    [1, 3], // Nicole - Brooklyn + Santa Monica
    [0],    // Kevin - Manhattan only
    [1, 2]  // Amanda - Brooklyn + Beverly Hills
  ]

  for (let i = 0; i < staff.length; i++) {
    for (const locationIndex of staffLocationMapping[i]) {
      await prisma.locationCertification.create({
        data: {
          userId: staff[i].id,
          locationId: locations[locationIndex].id
        }
      })
    }
  }

  // 5. Create Availability (realistic windows for each staff member)
  console.log('Creating availability...')

  const availabilityPatterns = [
    // Full-time patterns
    { days: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '17:00' }, // Mon-Fri 9-5
    { days: [0, 1, 2, 3, 4], startTime: '11:00', endTime: '19:00' }, // Sun-Thu 11-7
    { days: [3, 4, 5, 6], startTime: '16:00', endTime: '23:00' },    // Thu-Sat 4-11pm

    // Part-time patterns
    { days: [5, 6, 0], startTime: '17:00', endTime: '23:00' },       // Fri-Sun 5-11pm
    { days: [1, 3, 5], startTime: '12:00', endTime: '20:00' },       // Mon/Wed/Fri 12-8
    { days: [2, 4, 6], startTime: '10:00', endTime: '18:00' },       // Tue/Thu/Sat 10-6
    { days: [6, 0], startTime: '08:00', endTime: '16:00' },          // Weekend mornings
    { days: [1, 2, 3], startTime: '14:00', endTime: '22:00' },       // Mon-Wed evenings
    { days: [4, 5, 6], startTime: '18:00', endTime: '23:59' },       // Thu-Sat nights
    { days: [0, 6], startTime: '10:00', endTime: '14:00' }           // Weekend days
  ]

  for (let i = 0; i < staff.length; i++) {
    const pattern = availabilityPatterns[i]
    for (const day of pattern.days) {
      await prisma.availability.create({
        data: {
          userId: staff[i].id,
          dayOfWeek: day,
          startTime: pattern.startTime,
          endTime: pattern.endTime,
          isAvailable: true,
          isRecurring: true
        }
      })
    }

    // Add some one-off unavailability (time-off requests)
    if (Math.random() > 0.7) {
      const randomDay = addDays(getCurrentWeekStart(), Math.floor(Math.random() * 7))
      await prisma.availability.create({
        data: {
          userId: staff[i].id,
          specificDate: randomDay,
          isAvailable: false,
          isRecurring: false,
          notes: 'Personal time off'
        }
      })
    }
  }

  // 6. Create Shifts with Conflicts and Issues
  console.log('Creating shifts with realistic scheduling scenarios...')

  const weekStart = getCurrentWeekStart()
  const shifts = []

  // Helper function to create shifts
  async function createShift(
    locationIndex: number,
    skillName: string,
    dayOffset: number,
    startHour: number,
    endHour: number,
    headcount: number = 1,
    status: ShiftStatus = ShiftStatus.PUBLISHED
  ) {
    const shiftDate = addDays(weekStart, dayOffset)
    const startTime = createUTCDate(shiftDate.getFullYear(), shiftDate.getMonth() + 1, shiftDate.getDate(), startHour)
    const endTime = createUTCDate(shiftDate.getFullYear(), shiftDate.getMonth() + 1, shiftDate.getDate(), endHour)

    const skill = skills.find(s => s.name === skillName)!

    return await prisma.shift.create({
      data: {
        locationId: locations[locationIndex].id,
        skillId: skill.id,
        date: shiftDate,
        startTime,
        endTime,
        headcountNeeded: headcount,
        status,
        title: `${skillName} - ${locations[locationIndex].name}`,
        createdById: locationIndex < 2 ? manager1.id : manager2.id
      }
    })
  }

  // SCENARIO 1: Double Bookings
  // Create overlapping shifts for same staff member
  console.log('Creating double booking scenarios...')
  const doubleBookShift1 = await createShift(0, 'Server', 0, 18, 22) // Monday 6-10pm Manhattan
  const doubleBookShift2 = await createShift(1, 'Server', 0, 19, 23) // Monday 7-11pm Brooklyn

  // Assign Alex to both (he's certified at both East Coast locations)
  await prisma.shiftAssignment.create({
    data: { shiftId: doubleBookShift1.id, userId: staff[0].id, isConfirmed: true }
  })
  await prisma.shiftAssignment.create({
    data: { shiftId: doubleBookShift2.id, userId: staff[0].id, isConfirmed: true }
  })

  // SCENARIO 2: Overtime Risks
  // Create multiple shifts for same person in same day/week
  console.log('Creating overtime risk scenarios...')
  const overtimeShifts = [
    await createShift(0, 'Bartender', 1, 9, 17),   // Tuesday 9-5 (8 hours)
    await createShift(0, 'Bartender', 1, 18, 23),  // Tuesday 6-11pm (5 more hours = 13 total)
    await createShift(1, 'Bartender', 2, 17, 22),  // Wednesday 5-10pm (5 more = 18 total)
    await createShift(0, 'Bartender', 3, 16, 21)   // Thursday 4-9pm (5 more = 23 total!)
  ]

  // Assign all to Emma (bartender certified at both East/West)
  for (const shift of overtimeShifts) {
    await prisma.shiftAssignment.create({
      data: { shiftId: shift.id, userId: staff[3].id, isConfirmed: true }
    })
  }

  // SCENARIO 3: Uneven Premium Shift Distribution
  // Create weekend/evening premium shifts and assign unevenly
  console.log('Creating premium shift distribution scenarios...')
  const premiumShifts = [
    // Friday night shifts (premium)
    await createShift(0, 'Bartender', 4, 20, 2),  // Friday 8pm-2am
    await createShift(1, 'Server', 4, 19, 1),     // Friday 7pm-1am
    await createShift(2, 'Bartender', 4, 21, 3),  // Friday 9pm-3am

    // Saturday night shifts (premium)
    await createShift(0, 'Server', 5, 18, 2),     // Saturday 6pm-2am
    await createShift(1, 'Bartender', 5, 20, 3),  // Saturday 8pm-3am
    await createShift(2, 'Server', 5, 19, 2),     // Saturday 7pm-2am

    // Sunday brunch shifts (premium)
    await createShift(3, 'Server', 6, 9, 15),     // Sunday 9am-3pm
    await createShift(2, 'Host', 6, 10, 16)       // Sunday 10am-4pm
  ]

  // Assign most premium shifts to just 2-3 people (uneven distribution)
  const premiumWorkers = [staff[0], staff[1], staff[4]] // Alex, Maria, David
  for (let i = 0; i < premiumShifts.length; i++) {
    const worker = premiumWorkers[i % premiumWorkers.length]
    // Check if worker has required skill and location certification
    const shift = premiumShifts[i]
    await prisma.shiftAssignment.create({
      data: { shiftId: shift.id, userId: worker.id, isConfirmed: true }
    })
  }

  // SCENARIO 4: Staffing Gaps
  // Create shifts with no assignments or understaffed
  console.log('Creating staffing gap scenarios...')
  const unstaffedShifts = [
    await createShift(3, 'Line Cook', 2, 11, 15, 2), // Wednesday lunch - needs 2, assign 0
    await createShift(2, 'Host', 3, 17, 21, 1),      // Thursday evening - needs 1, assign 0
    await createShift(1, 'Server', 4, 12, 16, 3)     // Friday lunch - needs 3, assign 1
  ]

  // Only assign 1 person to the last shift (understaffed)
  await prisma.shiftAssignment.create({
    data: { shiftId: unstaffedShifts[2].id, userId: staff[7].id, isConfirmed: true }
  })

  // SCENARIO 5: Skill Mismatches
  // Assign people to shifts requiring skills they don't have
  console.log('Creating skill mismatch scenarios...')
  const mismatchShift = await createShift(0, 'Line Cook', 1, 10, 14) // Tuesday lunch

  // Assign Kevin (Host only) to Line Cook shift
  await prisma.shiftAssignment.create({
    data: { shiftId: mismatchShift.id, userId: staff[8].id, isConfirmed: false }
  })

  // SCENARIO 6: Availability Conflicts
  // Assign people to shifts outside their availability
  console.log('Creating availability conflict scenarios...')

  // Create early morning shift and assign to someone only available evenings
  const earlyShift = await createShift(2, 'Host', 3, 6, 10) // Thursday 6-10am

  // Assign Lisa (only available weekend days 10-2) to Thursday morning
  await prisma.shiftAssignment.create({
    data: { shiftId: earlyShift.id, userId: staff[5].id, isConfirmed: false }
  })

  // Regular shifts without conflicts to balance the schedule
  console.log('Creating regular shifts...')
  const regularShifts = [
    await createShift(0, 'Server', 0, 11, 15),     // Monday lunch
    await createShift(1, 'Host', 0, 17, 21),       // Monday dinner
    await createShift(2, 'Line Cook', 1, 12, 16),  // Tuesday lunch
    await createShift(3, 'Server', 2, 18, 22),     // Wednesday dinner
    await createShift(0, 'Bartender', 4, 17, 21),  // Friday happy hour
    await createShift(1, 'Server', 5, 12, 16),     // Saturday lunch
    await createShift(3, 'Line Cook', 6, 11, 15)   // Sunday brunch prep
  ]

  // Assign these properly
  const assignments = [
    { shiftIndex: 0, staffIndex: 1 }, // Maria - Server
    { shiftIndex: 1, staffIndex: 8 }, // Kevin - Host
    { shiftIndex: 2, staffIndex: 2 }, // James - Line Cook
    { shiftIndex: 3, staffIndex: 4 }, // David - Server
    { shiftIndex: 4, staffIndex: 6 }, // Ryan - Bartender
    { shiftIndex: 5, staffIndex: 7 }, // Nicole - Server
    { shiftIndex: 6, staffIndex: 9 }  // Amanda - Line Cook
  ]

  for (const { shiftIndex, staffIndex } of assignments) {
    await prisma.shiftAssignment.create({
      data: {
        shiftId: regularShifts[shiftIndex].id,
        userId: staff[staffIndex].id,
        isConfirmed: true
      }
    })
  }

  // Create some swap requests
  console.log('Creating swap requests...')

  // Find some assignments to create swaps for
  const assignment1 = await prisma.shiftAssignment.findFirst({
    where: { userId: staff[0].id } // Alex's assignment
  })
  const assignment2 = await prisma.shiftAssignment.findFirst({
    where: { userId: staff[1].id } // Maria's assignment
  })

  if (assignment1 && assignment2) {
    await prisma.swapRequest.create({
      data: {
        fromAssignmentId: assignment1.id,
        toAssignmentId: assignment2.id,
        fromUserId: staff[0].id,
        toUserId: staff[1].id,
        shiftId: assignment1.shiftId,
        reason: 'Need to switch for personal appointment'
      }
    })
  }

  // Create some notifications
  console.log('Creating notifications...')
  await prisma.notification.create({
    data: {
      userId: staff[0].id,
      type: 'SHIFT_ASSIGNED',
      title: 'New Shift Assignment',
      message: 'You have been assigned to work Monday evening at Downtown Manhattan'
    }
  })

  await prisma.notification.create({
    data: {
      userId: manager1.id,
      type: 'SCHEDULE_PUBLISHED',
      title: 'Schedule Published',
      message: 'The schedule for next week has been published'
    }
  })

  // Create audit logs
  console.log('Creating audit logs...')
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'CREATE',
      entityType: 'User',
      entityId: staff[0].id,
      newValues: { email: staff[0].email, role: 'STAFF' },
      description: 'Created new staff member'
    }
  })

  console.log('✅ Seed completed successfully!')
  console.log(`
📊 Created:
  - 1 Admin (Sarah Johnson)
  - 2 Managers (Michael Chen - East Coast, Jennifer Rodriguez - West Coast)
  - 10 Staff members with varying skills
  - 4 Locations (2 per timezone)
  - 4 Skills (Bartender, Line Cook, Server, Host)
  - Location certifications for all users
  - Realistic availability patterns
  - ${await prisma.shift.count()} shifts with scheduling conflicts
  - ${await prisma.shiftAssignment.count()} shift assignments
  - Sample swap requests and notifications

🔐 Test Login Credentials:
  Admin: admin@shiftsync.com / admin123
  Manager (East): manager.east@shiftsync.com / manager123
  Manager (West): manager.west@shiftsync.com / manager123
  Staff: staff1@shiftsync.com / staff123 (staff1-staff10)

🚨 Scheduling Issues Created:
  1. Double bookings (Alex assigned to overlapping shifts)
  2. Overtime risks (Emma with 23+ hours in one week)
  3. Uneven premium shift distribution (most weekends to same 3 people)
  4. Staffing gaps (understaffed and unstaffed shifts)
  5. Skill mismatches (Kevin assigned to Line Cook shift)
  6. Availability conflicts (Lisa assigned outside availability window)
  `)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })