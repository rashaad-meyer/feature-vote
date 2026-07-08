import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useToast } from '../../components/ui/useToast'
import { ApiError } from '../../lib/apiClient'
import type { Idea, Paginated } from '../../lib/types'
import { unvoteIdea, voteIdea } from './ideas.api'
import { applyVoteToggle } from './optimistic'

interface VoteVariables {
  idea: Idea
}

interface VoteContext {
  snapshot: Array<[QueryKey, Paginated<Idea> | undefined]>
}

const IDEAS_KEY = ['ideas'] as const

/**
 * Optimistic vote/unvote: flip the UI immediately, reconcile on the server,
 * and roll back with visible feedback if the request fails.
 */
export function useVote() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation<Idea, Error, VoteVariables, VoteContext>({
    mutationFn: ({ idea }) =>
      idea.has_voted ? unvoteIdea(idea.id) : voteIdea(idea.id),

    onMutate: async ({ idea }) => {
      await queryClient.cancelQueries({ queryKey: IDEAS_KEY })

      const snapshot = queryClient.getQueriesData<Paginated<Idea>>({
        queryKey: IDEAS_KEY,
      })

      const nextVoted = !idea.has_voted
      for (const [key, page] of snapshot) {
        if (!page) continue
        queryClient.setQueryData(key, applyVoteToggle(page, idea.id, nextVoted))
      }

      return { snapshot }
    },

    onError: (error, _variables, context) => {
      context?.snapshot.forEach(([key, page]) => {
        queryClient.setQueryData(key, page)
      })
      showToast(
        error instanceof ApiError
          ? error.message
          : 'Could not save your vote. Please try again.',
      )
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: IDEAS_KEY })
    },
  })
}
