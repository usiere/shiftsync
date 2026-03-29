import { addDays, startOfWeek, endOfWeek, differenceInHours, differenceInMinutes, format, startOfDay, endOfDay } from 'date-fns'
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'

export function convertToTimezone(date: Date, timezone: string): Date {
  return utcToZonedTime(date, timezone)
}

export function convertToUtc(date: Date, timezone: string): Date {
  return zonedTimeToUtc(date, timezone)
}

export function getShiftDurationHours(startTime: Date, endTime: Date): number {
  return differenceInHours(endTime, startTime) + (differenceInMinutes(endTime, startTime) % 60) / 60
}

export function doShiftsOverlap(shift1Start: Date, shift1End: Date, shift2Start: Date, shift2End: Date): boolean {
  return shift1Start < shift2End && shift2Start < shift1End
}

export function getTimeBetweenShifts(shift1End: Date, shift2Start: Date): number {
  return differenceInHours(shift2Start, shift1End) + (differenceInMinutes(shift2Start, shift1End) % 60) / 60
}

export function isTimeInAvailabilityWindow(
  shiftStart: Date,
  shiftEnd: Date,
  availabilityStart: string,
  availabilityEnd: string,
  dayOfWeek: number,
  timezone: string
): boolean {
  const shiftLocalStart = convertToTimezone(shiftStart, timezone)
  const shiftLocalEnd = convertToTimezone(shiftEnd, timezone)

  const shiftDayOfWeek = shiftLocalStart.getDay()

  if (shiftDayOfWeek !== dayOfWeek) {
    return false
  }

  const [availStartHour, availStartMin] = availabilityStart.split(':').map(Number)
  const [availEndHour, availEndMin] = availabilityEnd.split(':').map(Number)

  const shiftStartTime = shiftLocalStart.getHours() * 60 + shiftLocalStart.getMinutes()
  const shiftEndTime = shiftLocalEnd.getHours() * 60 + shiftLocalEnd.getMinutes()
  const availStartTime = availStartHour * 60 + availStartMin
  const availEndTime = availEndHour * 60 + availEndMin

  return shiftStartTime >= availStartTime && shiftEndTime <= availEndTime
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = startOfWeek(date, { weekStartsOn: 1 }) // Monday start
  const end = endOfWeek(date, { weekStartsOn: 1 }) // Sunday end
  return { start, end }
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return startOfDay(date1).getTime() === startOfDay(date2).getTime()
}

export function getConsecutiveDays(dates: Date[]): number {
  if (dates.length === 0) return 0

  const sortedDates = dates
    .map(d => startOfDay(d))
    .sort((a, b) => a.getTime() - b.getTime())
    .filter((date, index, arr) =>
      index === 0 || date.getTime() !== arr[index - 1].getTime()
    )

  let maxConsecutive = 1
  let currentConsecutive = 1

  for (let i = 1; i < sortedDates.length; i++) {
    const daysDiff = differenceInHours(sortedDates[i], sortedDates[i - 1]) / 24

    if (daysDiff === 1) {
      currentConsecutive++
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
    } else {
      currentConsecutive = 1
    }
  }

  return maxConsecutive
}