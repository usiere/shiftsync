import swaggerJSDoc from 'swagger-jsdoc'
import { SwaggerDefinition } from 'swagger-jsdoc'

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'ShiftSync API',
    version: '1.0.0',
    description: 'A comprehensive shift scheduling and management system for restaurants and hospitality businesses',
    contact: {
      name: 'ShiftSync Support',
      email: 'support@shiftsync.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /auth/login endpoint'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          phone: { type: 'string' },
          role: {
            type: 'string',
            enum: ['ADMIN', 'MANAGER', 'STAFF'],
            description: 'User role in the system'
          },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Location: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          address: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          zipCode: { type: 'string' },
          timezone: { type: 'string' }
        }
      },
      Skill: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          description: { type: 'string' }
        }
      },
      Shift: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          locationId: { type: 'integer' },
          skillId: { type: 'integer', nullable: true },
          date: { type: 'string', format: 'date' },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
          headcountNeeded: { type: 'integer' },
          status: {
            type: 'string',
            enum: ['DRAFT', 'PUBLISHED', 'CANCELLED'],
            description: 'Current status of the shift'
          },
          title: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          createdById: { type: 'integer' },
          location: { $ref: '#/components/schemas/Location' },
          skill: { $ref: '#/components/schemas/Skill' },
          createdBy: { $ref: '#/components/schemas/User' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address'
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'User password'
          }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'JWT access token'
          },
          user: { $ref: '#/components/schemas/User' }
        }
      },
      CreateShiftRequest: {
        type: 'object',
        required: ['locationId', 'date', 'startTime', 'endTime'],
        properties: {
          locationId: {
            type: 'integer',
            description: 'ID of the location where the shift takes place'
          },
          skillId: {
            type: 'integer',
            description: 'Required skill for this shift (optional)'
          },
          date: {
            type: 'string',
            format: 'date',
            description: 'Date of the shift (YYYY-MM-DD)'
          },
          startTime: {
            type: 'string',
            format: 'date-time',
            description: 'Start time in ISO 8601 format'
          },
          endTime: {
            type: 'string',
            format: 'date-time',
            description: 'End time in ISO 8601 format'
          },
          headcountNeeded: {
            type: 'integer',
            minimum: 1,
            default: 1,
            description: 'Number of staff members needed'
          },
          title: {
            type: 'string',
            description: 'Optional title for the shift'
          },
          description: {
            type: 'string',
            description: 'Optional description for the shift'
          }
        }
      },
      AssignStaffRequest: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: {
            type: 'integer',
            description: 'ID of the staff member to assign'
          },
          overrideFlags: {
            type: 'object',
            properties: {
              allowConsecutiveDays: { type: 'boolean' },
              allowExcessiveHours: { type: 'boolean' }
            },
            description: 'Override flags for constraint violations'
          }
        }
      },
      ConstraintViolation: {
        type: 'object',
        properties: {
          rule: {
            type: 'string',
            enum: ['SKILL_REQUIREMENT', 'NO_DOUBLE_BOOKING', 'AVAILABILITY_WINDOW', 'DAILY_HOURS_LIMIT', 'WEEKLY_HOURS_LIMIT'],
            description: 'Type of constraint that was violated'
          },
          message: {
            type: 'string',
            description: 'Human-readable description of the violation'
          },
          severity: {
            type: 'string',
            enum: ['error', 'warning'],
            description: 'Severity level of the violation'
          },
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                email: { type: 'string' },
                skills: {
                  type: 'array',
                  items: { type: 'string' }
                },
                locations: {
                  type: 'array',
                  items: { type: 'integer' }
                }
              }
            },
            description: 'Alternative staff members who could be assigned instead'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error type or category'
          },
          message: {
            type: 'string',
            description: 'Human-readable error message'
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
                value: { type: 'string' }
              }
            },
            description: 'Detailed validation errors (if applicable)'
          }
        }
      }
    }
  }
}

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/index.ts'
  ]
}

export const swaggerSpec = swaggerJSDoc(options)