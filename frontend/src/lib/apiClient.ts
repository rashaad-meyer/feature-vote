import { API_BASE_URL, TOKEN_STORAGE_KEY } from './config'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// In-memory token, seeded from storage so requests work on a fresh reload.
let authToken: string | null =
  typeof localStorage !== 'undefined'
    ? localStorage.getItem(TOKEN_STORAGE_KEY)
    : null

export function setAuthToken(token: string | null): void {
  authToken = token
  if (typeof localStorage === 'undefined') return
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

export function getAuthToken(): string | null {
  return authToken
}

/** Turn a DRF error body into a single human-readable message. */
function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>
    const detail = record.detail
    if (typeof detail === 'string') return detail

    const firstField = Object.values(record)[0]
    if (Array.isArray(firstField) && typeof firstField[0] === 'string') {
      return firstField[0]
    }
    if (typeof firstField === 'string') return firstField
  }
  return fallback
}

interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, auth = false }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth && authToken) headers.Authorization = `Token ${authToken}`

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Network error — is the API server running?', 0)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json')
  const payload = isJson ? await response.json() : null

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(payload, `Request failed (${response.status})`),
      response.status,
    )
  }

  return payload as T
}
