import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiRequest, getAuthToken, setAuthToken } from './apiClient'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

describe('apiRequest', () => {
  beforeEach(() => {
    setAuthToken(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    setAuthToken(null)
  })

  it('parses a JSON body on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ id: 1, title: 'Hi' })),
    )
    const data = await apiRequest<{ id: number }>('/ideas/1/')
    expect(data.id).toBe(1)
  })

  it('attaches the auth token when requested', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)
    setAuthToken('abc123')

    await apiRequest('/ideas/', { method: 'POST', body: {}, auth: true })

    const headers = fetchMock.mock.calls[0][1].headers
    expect(headers.Authorization).toBe('Token abc123')
  })

  it('omits the token when auth is not requested', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)
    setAuthToken('abc123')

    await apiRequest('/ideas/')

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })

  it('throws ApiError with the DRF detail message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ detail: 'You have already voted for this idea.' }, 400),
      ),
    )
    await expect(apiRequest('/ideas/1/vote/')).rejects.toMatchObject({
      status: 400,
      message: 'You have already voted for this idea.',
    })
  })

  it('surfaces the first field error from a DRF validation body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ title: ['This field is required.'] }, 400),
      ),
    )
    await expect(apiRequest('/ideas/')).rejects.toThrow(
      'This field is required.',
    )
  })

  it('wraps network failures in an ApiError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('boom')))
    const error = await apiRequest('/ideas/').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(0)
  })

  it('returns undefined for a 204 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    )
    await expect(apiRequest('/ideas/1/')).resolves.toBeUndefined()
  })

  it('persists the token to storage', () => {
    setAuthToken('tok')
    expect(getAuthToken()).toBe('tok')
    expect(localStorage.getItem('feature-vote:token')).toBe('tok')
    setAuthToken(null)
    expect(localStorage.getItem('feature-vote:token')).toBeNull()
  })
})
