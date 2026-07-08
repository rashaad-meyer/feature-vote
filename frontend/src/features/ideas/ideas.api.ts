import { apiRequest } from '../../lib/apiClient'
import type {
  CreateIdeaInput,
  Idea,
  Paginated,
  SortKey,
} from '../../lib/types'

const ORDERING: Record<SortKey, string> = {
  votes: '-vote_count',
  newest: '-created_at',
}

export async function fetchIdeas(
  sort: SortKey,
  page: number,
): Promise<Paginated<Idea>> {
  const params = new URLSearchParams({
    ordering: ORDERING[sort],
    page: String(page),
  })
  return apiRequest<Paginated<Idea>>(`/ideas/?${params.toString()}`, {
    auth: true,
  })
}

export async function createIdea(input: CreateIdeaInput): Promise<Idea> {
  return apiRequest<Idea>('/ideas/', {
    method: 'POST',
    body: input,
    auth: true,
  })
}

export async function voteIdea(id: number): Promise<Idea> {
  return apiRequest<Idea>(`/ideas/${id}/vote/`, { method: 'POST', auth: true })
}

export async function unvoteIdea(id: number): Promise<Idea> {
  return apiRequest<Idea>(`/ideas/${id}/unvote/`, {
    method: 'POST',
    auth: true,
  })
}
