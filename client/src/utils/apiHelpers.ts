/**
 * Helper function to safely extract arrays from API responses
 * Handles different response formats:
 * - Plain arrays: [...]
 * - Paginated responses: { data: [...], total: 0 }
 * - Other nested formats: { shifts: [...] }
 */
export function extractArray(response: any): any[] {
  if (Array.isArray(response.data)) {
    return response.data
  }

  return response.data?.data || response.data?.shifts || response.data?.swapRequests || []
}