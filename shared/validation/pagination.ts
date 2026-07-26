import { z } from 'zod'

/**
 * Shared pagination/sort/search query-param schema. Every list endpoint
 * under /api/v1 parses `req.nextUrl.searchParams` through this (or an
 * extension of it) instead of hand-rolling parsing per route — see
 * docs/api/api-conventions.md §Pagination.
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().max(200).optional(),
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>

export type PaginatedResult<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
}
