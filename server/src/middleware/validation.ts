import { Request, Response, NextFunction } from 'express'
import { body, param, query, validationResult } from 'express-validator'

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : error.type,
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      }))
    })
  }
  next()
}

export const validateShiftCreation = [
  body('locationId')
    .isInt({ min: 1 })
    .withMessage('Location ID must be a positive integer'),

  body('skillId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Skill ID must be a positive integer'),

  body('date')
    .isISO8601()
    .withMessage('Date must be in ISO 8601 format (YYYY-MM-DD)')
    .custom((value) => {
      const date = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (date < today) {
        throw new Error('Cannot create shifts in the past')
      }
      return true
    }),

  body('startTime')
    .isISO8601()
    .withMessage('Start time must be in ISO 8601 format'),

  body('endTime')
    .isISO8601()
    .withMessage('End time must be in ISO 8601 format')
    .custom((value, { req }) => {
      const startTime = new Date(req.body.startTime)
      const endTime = new Date(value)

      if (endTime <= startTime) {
        throw new Error('End time must be after start time')
      }
      return true
    }),

  body('headcountNeeded')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Headcount needed must be a positive integer'),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Title must be 255 characters or less'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be 1000 characters or less'),

  handleValidationErrors
]

export const validateShiftUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Shift ID must be a positive integer'),

  body('skillId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Skill ID must be a positive integer'),

  body('startTime')
    .optional()
    .isISO8601()
    .withMessage('Start time must be in ISO 8601 format'),

  body('endTime')
    .optional()
    .isISO8601()
    .withMessage('End time must be in ISO 8601 format')
    .custom((value, { req }) => {
      if (req.body.startTime) {
        const startTime = new Date(req.body.startTime)
        const endTime = new Date(value)

        if (endTime <= startTime) {
          throw new Error('End time must be after start time')
        }
      }
      return true
    }),

  body('headcountNeeded')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Headcount needed must be a positive integer'),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Title must be 255 characters or less'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be 1000 characters or less'),

  handleValidationErrors
]

export const validateShiftAssignment = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Shift ID must be a positive integer'),

  body('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),

  body('overrideFlags')
    .optional()
    .isObject()
    .withMessage('Override flags must be an object'),

  body('overrideFlags.allowConsecutiveDays')
    .optional()
    .isBoolean()
    .withMessage('allowConsecutiveDays must be a boolean'),

  body('overrideFlags.allowExcessiveHours')
    .optional()
    .isBoolean()
    .withMessage('allowExcessiveHours must be a boolean'),

  handleValidationErrors
]

export const validateShiftRemoveAssignment = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Shift ID must be a positive integer'),

  param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),

  handleValidationErrors
]

export const validateShiftFilters = [
  query('locationId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Location ID must be a positive integer'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in ISO 8601 format'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in ISO 8601 format')
    .custom((value, { req }) => {
      if (req.query.startDate) {
        const startDate = new Date(req.query.startDate as string)
        const endDate = new Date(value)

        if (endDate < startDate) {
          throw new Error('End date must be after start date')
        }
      }
      return true
    }),

  query('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED'])
    .withMessage('Status must be either DRAFT or PUBLISHED'),

  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),

  handleValidationErrors
]

export const validateShiftId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Shift ID must be a positive integer'),

  handleValidationErrors
]