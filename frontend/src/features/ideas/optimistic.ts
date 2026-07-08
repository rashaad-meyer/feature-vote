import type { Idea, Paginated } from '../../lib/types'

/**
 * Return a new page with the target idea's vote toggled to `voted`.
 * Pure and immutable so it can be unit-tested and reused for rollback.
 */
export function applyVoteToggle(
  page: Paginated<Idea>,
  ideaId: number,
  voted: boolean,
): Paginated<Idea> {
  return {
    ...page,
    results: page.results.map((idea) => {
      if (idea.id !== ideaId || idea.has_voted === voted) return idea
      const delta = voted ? 1 : -1
      return {
        ...idea,
        has_voted: voted,
        vote_count: Math.max(0, idea.vote_count + delta),
      }
    }),
  }
}
