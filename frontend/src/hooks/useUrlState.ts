import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { SortKey } from '../lib/types'

const VALID_SORTS: SortKey[] = ['votes', 'newest']

interface ListUrlState {
  sort: SortKey
  page: number
  setSort: (sort: SortKey) => void
  setPage: (page: number) => void
}

/** List controls (sort + page) persisted in the URL, so views are shareable. */
export function useListUrlState(): ListUrlState {
  const [params, setParams] = useSearchParams()

  const sortParam = params.get('sort')
  const sort: SortKey = VALID_SORTS.includes(sortParam as SortKey)
    ? (sortParam as SortKey)
    : 'votes'

  const parsedPage = Number(params.get('page'))
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1

  const setSort = useCallback(
    (next: SortKey) => {
      setParams((current) => {
        const updated = new URLSearchParams(current)
        updated.set('sort', next)
        updated.delete('page') // new sort resets to page 1
        return updated
      })
    },
    [setParams],
  )

  const setPage = useCallback(
    (next: number) => {
      setParams((current) => {
        const updated = new URLSearchParams(current)
        if (next <= 1) {
          updated.delete('page')
        } else {
          updated.set('page', String(next))
        }
        return updated
      })
    },
    [setParams],
  )

  return { sort, page, setSort, setPage }
}
