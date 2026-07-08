export interface Idea {
  id: number
  title: string
  description: string
  vote_count: number
  created_at: string
  created_by: string
  has_voted: boolean
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type SortKey = 'votes' | 'newest'

export interface CreateIdeaInput {
  title: string
  description: string
}

export interface AuthUser {
  username: string
}
