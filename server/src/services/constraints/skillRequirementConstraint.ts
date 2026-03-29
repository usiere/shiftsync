import { ValidationResult, ConstraintContext, ConstraintType } from '../../types/constraint'

export function validateSkillRequirement(context: ConstraintContext): ValidationResult {
  const { proposedAssignment } = context
  const { user, shift } = proposedAssignment

  // If shift doesn't require a specific skill, validation passes
  if (!shift.skill) {
    return {
      valid: true,
      rule: ConstraintType.SKILL_REQUIREMENT,
      message: 'No specific skill required for this shift',
      suggestions: []
    }
  }

  // Check if user has the required skill
  const hasRequiredSkill = user.userSkills.some(userSkill =>
    userSkill.skill.id === shift.skill!.id
  )

  if (!hasRequiredSkill) {
    // Find alternative users with the required skill
    const suggestions = context.allQualifiedUsers.filter(alternativeUser => {
      if (alternativeUser.id === user.id) return false

      // Check if alternative user has the required skill
      const hasSkill = alternativeUser.userSkills.some(us => us.skill.id === shift.skill!.id)
      if (!hasSkill) return false

      // Check if user is certified for location
      const hasCertification = alternativeUser.locationCertifications.some(
        cert => cert.locationId === shift.locationId
      )

      return hasCertification
    })

    return {
      valid: false,
      rule: ConstraintType.SKILL_REQUIREMENT,
      message: `${user.firstName} ${user.lastName} does not have the required skill: ${shift.skill.name}`,
      suggestions
    }
  }

  return {
    valid: true,
    rule: ConstraintType.SKILL_REQUIREMENT,
    message: `User has required skill: ${shift.skill.name}`,
    suggestions: []
  }
}