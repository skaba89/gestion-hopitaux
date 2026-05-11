import { NextResponse } from 'next/server'

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export function successResponse(data: unknown, message?: string, status = 200) {
  return NextResponse.json(
    { success: true, data, ...(message && { message }) },
    { status, headers: corsHeaders() }
  )
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json(
    { success: false, error },
    { status, headers: corsHeaders() }
  )
}

export function paginatedResponse(
  data: unknown[],
  total: number,
  page: number,
  limit: number
) {
  return NextResponse.json(
    {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
    { status: 200, headers: corsHeaders() }
  )
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const skip = (page - 1) * limit
  return { page, limit, skip, take: limit }
}
