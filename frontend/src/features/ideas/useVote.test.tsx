import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '../../components/ui/ToastProvider'
import { ApiError } from '../../lib/apiClient'
import type { Idea, Paginated } from '../../lib/types'
import { ideasQueryKey } from './useIdeas'
import { useVote } from './useVote'

const { voteIdea, unvoteIdea } = vi.hoisted(() => ({
  voteIdea: vi.fn(),
  unvoteIdea: vi.fn(),
}))

vi.mock('./ideas.api', () => ({ voteIdea, unvoteIdea }))

const IDEA: Idea = {
  id: 1,
  title: 'Dark mode',
  description: '',
  vote_count: 10,
  created_at: '2026-07-01T00:00:00Z',
  created_by: 'demo',
  has_voted: false,
}

function seededClient(): QueryClient {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const page: Paginated<Idea> = {
    count: 1,
    next: null,
    previous: null,
    results: [IDEA],
  }
  client.setQueryData(ideasQueryKey('votes', 1), page)
  return client
}

function cachedIdea(client: QueryClient): Idea {
  const page = client.getQueryData<Paginated<Idea>>(ideasQueryKey('votes', 1))
  return page!.results[0]
}

function wrapper(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  )
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('useVote', () => {
  it('optimistically increments the vote before the server responds', async () => {
    const client = seededClient()
    let resolveVote: (idea: Idea) => void = () => {}
    voteIdea.mockImplementation(
      () => new Promise<Idea>((resolve) => (resolveVote = resolve)),
    )

    const { result } = renderHook(() => useVote(), { wrapper: wrapper(client) })
    result.current.mutate({ idea: IDEA })

    await waitFor(() => expect(cachedIdea(client).vote_count).toBe(11))
    expect(cachedIdea(client).has_voted).toBe(true)

    resolveVote({ ...IDEA, vote_count: 11, has_voted: true })
  })

  it('rolls back to the server value when the vote fails', async () => {
    const client = seededClient()
    voteIdea.mockRejectedValue(new ApiError('Already voted', 400))

    const { result } = renderHook(() => useVote(), { wrapper: wrapper(client) })
    result.current.mutate({ idea: IDEA })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(cachedIdea(client).vote_count).toBe(10)
    expect(cachedIdea(client).has_voted).toBe(false)
  })

  it('calls unvote when the idea is already voted', async () => {
    const client = seededClient()
    unvoteIdea.mockResolvedValue({ ...IDEA, vote_count: 9, has_voted: false })

    const { result } = renderHook(() => useVote(), { wrapper: wrapper(client) })
    result.current.mutate({ idea: { ...IDEA, has_voted: true, vote_count: 10 } })

    await waitFor(() => expect(unvoteIdea).toHaveBeenCalledWith(1))
    expect(voteIdea).not.toHaveBeenCalled()
  })
})
