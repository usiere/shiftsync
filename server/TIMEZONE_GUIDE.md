# ShiftSync Timezone Handling Guide

## Overview

ShiftSync implements comprehensive timezone handling to ensure that all times are correctly managed across different geographical locations. This system handles the complexity of timezone conversions, DST transitions, overnight shifts, and availability checking across multiple timezones.

## Key Principles

### 1. **UTC Storage Rule**
- All times are stored in the database as UTC
- This ensures consistency and prevents timezone-related data corruption
- Database timestamps are always in UTC regardless of application server location

### 2. **Location-Based Display**
- All times displayed to users are in the location's timezone for that shift
- Each location has a `timezone` field (IANA timezone identifier like `America/New_York`)
- Users see times in the context that makes sense for their work location

### 3. **Availability Resolution**
- Staff availability is stored as local time windows
- During constraint checks, availability is resolved against the location's timezone
- This allows staff to set availability in their local time while supporting multiple locations

### 4. **Overnight Shift Support**
- Shifts spanning midnight are handled as single continuous shifts
- Proper duration calculation accounts for DST transitions
- Overnight availability windows (e.g., 11 PM - 7 AM) work correctly

## TimezoneService API

### Core Methods

#### `toLocationTime(utcTime, locationTimezone)`
Converts UTC time to location's local time.

```typescript
const utcTime = new Date('2024-03-15T18:00:00Z')
const localTime = timezoneService.toLocationTime(utcTime, 'America/New_York')
// Returns DateTime object representing 2:00 PM EDT
```

#### `toUTC(localTime, locationTimezone)`
Converts local time to UTC for database storage.

```typescript
const localTime = new Date('2024-03-15T14:00:00') // 2:00 PM
const utcTime = timezoneService.toUTC(localTime, 'America/New_York')
// Returns Date object in UTC (18:00 UTC = 2:00 PM EDT)
```

#### `isWithinAvailability(shift, staffAvailability)`
Checks if a shift falls within staff availability, accounting for timezone differences.

```typescript
const shiftTimes = {
  id: 1,
  date: new Date('2024-03-15'),
  startTime: new Date('2024-03-15T14:00:00Z'),
  endTime: new Date('2024-03-15T22:00:00Z'),
  locationTimezone: 'America/New_York'
}

const staffAvailability = [{
  dayOfWeek: 5, // Friday
  startTime: '09:00',
  endTime: '18:00',
  isAvailable: true,
  isRecurring: true
}]

const result = timezoneService.isWithinAvailability(shiftTimes, staffAvailability)
// Returns { isAvailable: true, matchingAvailability: [...], details: "..." }
```

#### `resolveOvernightShift(startUTC, endUTC, locationTimezone)`
Correctly identifies and calculates duration for overnight shifts.

```typescript
const startUTC = new Date('2024-03-16T02:00:00Z') // 10 PM EST
const endUTC = new Date('2024-03-16T10:00:00Z')   // 6 AM EST
const resolved = timezoneService.resolveOvernightShift(startUTC, endUTC, 'America/New_York')

// Returns:
// {
//   isOvernight: true,
//   duration: 8,
//   localStartDate: '2024-03-15',
//   localEndDate: '2024-03-16',
//   crossesMidnight: true
// }
```

### Display and Formatting

#### `getShiftDisplay(shiftTimes)`
Generates comprehensive display information for a shift.

```typescript
const display = timezoneService.getShiftDisplay(shiftTimes)
// Returns:
// {
//   localDate: '2024-03-15',
//   localStartTime: '10:00',
//   localEndTime: '18:00',
//   localStartDateTime: '2024-03-15T10:00:00-04:00',
//   localEndDateTime: '2024-03-15T18:00:00-04:00',
//   duration: 8,
//   isOvernight: false,
//   timezone: 'America/New_York',
//   timezoneAbbreviation: 'EDT'
// }
```

#### `formatForLocation(utcDate, timezone, formatString)`
Formats UTC date for display in specific timezone.

```typescript
const formatted = timezoneService.formatForLocation(
  new Date('2024-03-15T18:00:00Z'),
  'America/New_York',
  'MMM dd, yyyy HH:mm'
)
// Returns: 'Mar 15, 2024 14:00'
```

### DST Handling

#### `getDSTTransitions(timezone, year)`
Gets DST transition information for timezone and year.

```typescript
const transitions = timezoneService.getDSTTransitions('America/New_York', 2024)
// Returns array of transition objects:
// [
//   { date: Date, type: 'spring', offsetBefore: -300, offsetAfter: -240 },
//   { date: Date, type: 'fall', offsetBefore: -240, offsetAfter: -300 }
// ]
```

#### `calculateBusinessDay(date, timezone, startHour, endHour)`
Calculates business day duration accounting for DST.

```typescript
const businessDay = timezoneService.calculateBusinessDay(
  new Date('2024-03-10'), // Spring forward day
  'America/New_York',
  9,
  17
)
// Returns:
// {
//   startUTC: Date,
//   endUTC: Date,
//   duration: 7, // One hour less due to spring forward
//   isDSTTransitionDay: true,
//   transition: { type: 'spring', ... }
// }
```

## API Response Format

All shift APIs now include timezone display information:

```json
{
  "shift": {
    "id": 1,
    "title": "Morning Shift",
    "date": "2024-03-15T00:00:00.000Z",
    "startTime": "2024-03-15T14:00:00.000Z",
    "endTime": "2024-03-15T22:00:00.000Z",
    "location": {
      "name": "Downtown Store",
      "timezone": "America/New_York"
    },
    "timezone": {
      "localDate": "2024-03-15",
      "localStartTime": "10:00",
      "localEndTime": "18:00",
      "localStartDateTime": "2024-03-15T10:00:00-04:00",
      "localEndDateTime": "2024-03-15T18:00:00-04:00",
      "duration": 8,
      "isOvernight": false,
      "timezone": "America/New_York",
      "timezoneAbbreviation": "EDT",
      "utcStartTime": "2024-03-15T14:00:00.000Z",
      "utcEndTime": "2024-03-15T22:00:00.000Z"
    }
  }
}
```

## Constraint Engine Integration

The availability constraint has been updated to use TimezoneService:

### Before (Problematic)
```typescript
// Old approach - could have timezone issues
const localShiftStart = convertToTimezone(shift.startTime, timezone)
const shiftDayOfWeek = localShiftStart.getDay()

if (isTimeInAvailabilityWindow(shift.startTime, shift.endTime,
    availability.startTime, availability.endTime, shiftDayOfWeek, timezone)) {
  // Check passed
}
```

### After (Correct)
```typescript
// New approach - proper timezone handling
const shiftTimes: ShiftTimes = {
  id: shift.id,
  date: shift.date,
  startTime: shift.startTime,
  endTime: shift.endTime,
  locationTimezone: shift.location.timezone
}

const staffAvailability: StaffAvailability[] = user.availability.map(avail => ({
  // Map availability fields...
}))

const availabilityCheck = timezoneService.isWithinAvailability(shiftTimes, staffAvailability)
```

## Database Schema Considerations

### Location Table
```sql
CREATE TABLE locations (
  id INTEGER PRIMARY KEY,
  name VARCHAR NOT NULL,
  timezone VARCHAR NOT NULL, -- IANA timezone (e.g., 'America/New_York')
  -- other fields...
)
```

### Availability Table
```sql
CREATE TABLE availability (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  day_of_week INTEGER, -- 0-6 (Sunday-Saturday) for recurring
  start_time VARCHAR,  -- HH:mm format (local time)
  end_time VARCHAR,    -- HH:mm format (local time)
  specific_date TIMESTAMP, -- For one-off (UTC)
  start_date_time TIMESTAMP, -- For specific windows (UTC)
  end_date_time TIMESTAMP,   -- For specific windows (UTC)
  is_available BOOLEAN,
  is_recurring BOOLEAN,
  -- other fields...
)
```

### Shift Table
```sql
CREATE TABLE shifts (
  id INTEGER PRIMARY KEY,
  location_id INTEGER,
  date TIMESTAMP,       -- UTC
  start_time TIMESTAMP, -- UTC
  end_time TIMESTAMP,   -- UTC
  -- other fields...
)
```

## Usage Examples

### Creating Shifts with Timezone Awareness

```typescript
// Convert local times to UTC for storage
const startTimeUTC = timezoneService.toUTC(
  '2024-03-15T10:00:00',
  'America/New_York'
)
const endTimeUTC = timezoneService.toUTC(
  '2024-03-15T18:00:00',
  'America/New_York'
)

const shift = await prisma.shift.create({
  data: {
    locationId,
    startTime: startTimeUTC,
    endTime: endTimeUTC,
    // other fields...
  }
})
```

### Setting Staff Availability

```typescript
// For recurring availability (stored as local time strings)
await prisma.availability.create({
  data: {
    userId,
    dayOfWeek: 1, // Monday
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: true,
    isAvailable: true
  }
})

// For specific date/time (converted to UTC)
await prisma.availability.create({
  data: {
    userId,
    specificDate: new Date('2024-03-15'),
    startDateTime: timezoneService.toUTC('2024-03-15T14:00:00', userTimezone),
    endDateTime: timezoneService.toUTC('2024-03-15T16:00:00', userTimezone),
    isRecurring: false,
    isAvailable: false, // Time off
    notes: 'Doctor appointment'
  }
})
```

### Handling Overnight Shifts

```typescript
// Overnight shift: Friday 11 PM to Saturday 7 AM
const overnightShift = {
  id: 1,
  date: new Date('2024-03-15'), // Friday
  startTime: timezoneService.toUTC('2024-03-15T23:00:00', 'America/New_York'),
  endTime: timezoneService.toUTC('2024-03-16T07:00:00', 'America/New_York'),
  locationTimezone: 'America/New_York'
}

const display = timezoneService.getShiftDisplay(overnightShift)
console.log(display.isOvernight) // true
console.log(display.duration)    // 8 hours
console.log(display.localStartTime) // '23:00'
console.log(display.localEndTime)   // '07:00'

// Availability window for overnight workers
const overnightAvailability = {
  dayOfWeek: 5, // Friday
  startTime: '22:00',
  endTime: '08:00', // Spans to Saturday morning
  isRecurring: true,
  isAvailable: true
}

const check = timezoneService.isWithinAvailability(overnightShift, [overnightAvailability])
console.log(check.isAvailable) // true
```

### DST Transition Handling

```typescript
// Shift during spring forward (March 10, 2024)
const dstShift = {
  startTime: new Date('2024-03-10T06:00:00Z'), // 1:00 AM EST
  endTime: new Date('2024-03-10T08:00:00Z'),   // 4:00 AM EDT (actually 3 hours)
  locationTimezone: 'America/New_York'
}

const resolved = timezoneService.resolveOvernightShift(
  dstShift.startTime,
  dstShift.endTime,
  'America/New_York'
)

console.log(resolved.duration) // 2 hours (due to spring forward)
```

## Best Practices

### 1. **Always Store UTC in Database**
```typescript
// ✅ Good
const utcTime = timezoneService.toUTC(localTime, timezone)
await prisma.shift.create({ data: { startTime: utcTime } })

// ❌ Bad
await prisma.shift.create({ data: { startTime: localTime } })
```

### 2. **Use Location Timezone for Display**
```typescript
// ✅ Good
const display = timezoneService.getShiftDisplay(shift)
console.log(`Shift: ${display.localStartTime} - ${display.localEndTime} ${display.timezoneAbbreviation}`)

// ❌ Bad
console.log(`Shift: ${shift.startTime.toLocaleString()}`) // Shows in server timezone
```

### 3. **Handle Overnight Shifts Explicitly**
```typescript
// ✅ Good
const resolved = timezoneService.resolveOvernightShift(start, end, timezone)
if (resolved.isOvernight) {
  // Special handling for overnight shifts
}

// ❌ Bad
const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60) // May be wrong for overnight
```

### 4. **Validate Timezones**
```typescript
// ✅ Good
if (!timezoneService.isValidTimezone(timezone)) {
  throw new Error('Invalid timezone')
}

// ❌ Bad
// Assuming timezone is valid
```

### 5. **Use Availability Service for Constraint Checking**
```typescript
// ✅ Good
const check = timezoneService.isWithinAvailability(shift, availability)
if (!check.isAvailable) {
  return { valid: false, message: check.details }
}

// ❌ Bad
// Manual availability checking without timezone consideration
```

## Testing Timezone Functionality

The system includes comprehensive tests covering:

- UTC/local time conversion
- DST transition handling
- Overnight shift calculations
- Availability constraint checking
- Cross-timezone scenarios
- Edge cases and error handling

Run tests with:
```bash
npm test -- timezone
npm test -- timezone-integration
```

## Common Pitfalls and Solutions

### 1. **Date vs DateTime Confusion**
```typescript
// ❌ Problem: Using date strings without timezone context
const shift = { date: '2024-03-15', startTime: '10:00' }

// ✅ Solution: Always include timezone context
const startUTC = timezoneService.createLocationDateTime('2024-03-15', '10:00', 'America/New_York')
```

### 2. **Midnight Crossing Logic**
```typescript
// ❌ Problem: Assuming shifts don't cross midnight
if (endTime < startTime) { /* This will fail for overnight */ }

// ✅ Solution: Use TimezoneService
const resolved = timezoneService.resolveOvernightShift(start, end, timezone)
```

### 3. **DST Transition Days**
```typescript
// ❌ Problem: Assuming all days have 24 hours
const hoursInDay = 24

// ✅ Solution: Calculate based on actual duration
const businessDay = timezoneService.calculateBusinessDay(date, timezone)
const actualHours = businessDay.duration
```

### 4. **Server Timezone Dependency**
```typescript
// ❌ Problem: Using server's local time
const now = new Date()

// ✅ Solution: Use location-specific time
const nowInLocation = timezoneService.nowInLocation(timezone)
```

This timezone implementation ensures that ShiftSync correctly handles time-related operations across different geographical locations while maintaining data integrity and providing accurate user experiences.