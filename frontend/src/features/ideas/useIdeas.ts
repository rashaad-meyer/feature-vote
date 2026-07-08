import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { Idea, Paginated, SortKey } from '../../lib/types'
import { fetchIdeas } from './ideas.api'

export function ideasQueryKey(sort: SortKey, page: number) {
  return ['ideas', { sort, page }] as const
}

export function useIdeas(sort: SortKey, page: number) {
  return useQuery<Paginated<Idea>>({
    queryKey: ideasQueryKey(sort, page),
    queryFn: () => fetchIdeas(sort, page),
    placeholderData: keepPreviousData,
  })
}
