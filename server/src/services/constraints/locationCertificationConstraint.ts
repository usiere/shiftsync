import { ValidationResult, ConstraintContext, ConstraintType } from '../../types/constraint'

export function validateLocationCertification(context: ConstraintContext): ValidationResult {
  const { proposedAssignment } = context
  const { user, shift } = proposedAssignment

  // Check if user is certified for the shift location
  const hasCertification = user.locationCertifications.some(
    cert => cert.locationId === shift.locationId
  )

  if (!hasCertification) {
    // Find alternative users certified for this location
    const suggestions = context.allQualifiedUsers.filter(alternativeUser => {
      if (alternativeUser.id === user.id) return false

      // Check if user is certified for location
      const isCertified = alternativeUser.locationCertifications.some(
        cert => cert.locationId === shift.locationId
      )
      if (!isCertified) return false

      // Check if user has required skill (if any)
      if (shift.skill) {
        const hasSkill = alternativeUser.userSkills.some(us => us.skill.id === shift.skill!.id)
        if (!hasSkill) return false
      }

      return true
    })

    return {
      valid: false,
      rule: ConstraintType.LOCATION_CERTIFICATION,
      message: `${user.firstName} ${user.lastName} is not certified to work at ${shift.location.name}`,
      suggestions
    }
  }

  return {
    valid: true,
    rule: ConstraintType.LOCATION_CERTIFICATION,
    message: `User is certified to work at ${shift.location.name}`,
    suggestions: []
  }
}