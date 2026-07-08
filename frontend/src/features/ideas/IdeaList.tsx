import type { Idea } from '../../lib/types'
import { IdeaCard } from './IdeaCard'

interface IdeaListProps {
  ideas: Idea[]
  canVote: boolean
  onToggleVote: (idea: Idea) => void
}

export function IdeaList({ ideas, canVote, onToggleVote }: IdeaListProps) {
  if (ideas.length === 0) {
    return (
      <p className="idea-list__empty">
        No ideas yet. Be the first to post one.
      </p>
    )
  }

  return (
    <ul className="idea-list" role="list">
      {ideas.map((idea) => (
        <li key={idea.id}>
          <IdeaCard idea={idea} canVote={canVote} onToggleVote={onToggleVote} />
        </li>
      ))}
    </ul>
  )
}
