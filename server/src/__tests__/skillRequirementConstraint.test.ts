import { validateSkillRequirement } from '../services/constraints/skillRequirementConstraint'
import { ConstraintType } from '../types/constraint'
import { createShiftAssignment, createConstraintContext } from './utils/testData'

describe('Skill Requirement Constraint', () => {
  it('should pass when shift requires no specific skill', () => {
    const assignment = createShiftAssignment(1, {
      skillId: null, // No skill required
      skillName: undefined
    })

    const context = createConstraintContext(assignment)
    const result = validateSkillRequirement(context)

    expect(result.valid).toBe(true)
    expect(result.rule).toBe(ConstraintType.SKILL_REQUIREMENT)
    expect(result.message).toContain('No specific skill required')
    expect(result.suggestions).toHaveLength(0)
  })

  it('should pass when user has the required skill', () => {
    const assignment = createShiftAssignment(1, {
      skillId: 1, // Bartender skill
      skillName: 'Bartender'
    })

    const context = createConstraintContext(assignment)
    const result = validateSkillRequirement(context)

    expect(result.valid).toBe(true)
    expect(result.rule).toBe(ConstraintType.SKILL_REQUIREMENT)
    expect(result.message).toContain('User has required skill: Bartender')
    expect(result.suggestions).toHaveLength(0)
  })

  it('should fail when user lacks the required skill', () => {
    const assignment = createShiftAssignment(1, {
      skillId: 2, // Server skill (user 1 only has Bartender skill)
      skillName: 'Server'
    })

    const context = createConstraintContext(assignment)
    const result = validateSkillRequirement(context)

    expect(result.valid).toBe(false)
    expect(result.rule).toBe(ConstraintType.SKILL_REQUIREMENT)
    expect(result.message).toContain('Alice Smith does not have the required skill: Server')
    expect(result.suggestions.length).toBeGreaterThan(0)
  })

  it('should provide suggestions with users who have the required skill', () => {
    const assignment = createShiftAssignment(1, {
      skillId: 2, // Server skill
      skillName: 'Server',
      locationId: 2
    })

    const context = createConstraintContext(assignment)
    const result = validateSkillRequirement(context)

    expect(result.valid).toBe(false)
    expect(result.suggestions.length).toBeGreaterThan(0)

    // Check that suggestions have the required skill
    for (const suggestion of result.suggestions) {
      expect(suggestion.userSkills.some(us => us.skill.id === 2)).toBe(true)
      expect(suggestion.locationCertifications.some(lc => lc.locationId === 2)).toBe(true)
    }
  })

  it('should not suggest users without location certification', () => {
    const assignment = createShiftAssignment(1, {
      skillId: 1, // Bartender skill
      skillName: 'Bartender',
      locationId: 999 // Location that no one is certified for
    })

    const context = createConstraintContext(assignment)
    const result = validateSkillRequirement(context)

    expect(result.valid).toBe(false)
    expect(result.suggestions).toHaveLength(0) // No suggestions because no one is certified for location 999
  })

  it('should not suggest the originally assigned user', () => {
    const assignment = createShiftAssignment(2, { // User 2 (Bob)
      skillId: 999, // Non-existent skill
      skillName: 'NonExistentSkill'
    })

    const context = createConstraintContext(assignment)
    const result = validateSkillRequirement(context)

    expect(result.valid).toBe(false)
    // Even though user 2 is qualified for other aspects, they shouldn't be in suggestions
    // since they're the originally proposed user
    expect(result.suggestions.every(s => s.id !== 2)).toBe(true)
  })

  it('should handle multiple users with the same skill', () => {
    // Both user 1 and user 2 have Bartender skill
    const assignment = createShiftAssignment(3, { // User 3 (Charlie) doesn't have Bartender skill
      skillId: 1,
      skillName: 'Bartender',
      locationId: 1
    })

    const context = createConstraintContext(assignment)
    const result = validateSkillRequirement(context)

    expect(result.valid).toBe(false)
    // Should suggest both user 1 and user 2 since they both have Bartender skill and location cert
    const suggestionIds = result.suggestions.map(s => s.id)
    expect(suggestionIds).toContain(1) // Alice
    expect(suggestionIds).toContain(2) // Bob
    expect(suggestionIds).not.toContain(3) // Not Charlie (originally proposed user)
  })
})