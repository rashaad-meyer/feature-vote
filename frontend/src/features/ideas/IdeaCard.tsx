import { formatRelativeTime } from '../../lib/formatDate'
import type { Idea } from '../../lib/types'
import { VoteButton } from './VoteButton'

interface IdeaCardProps {
  idea: Idea
  canVote: boolean
  onToggleVote: (idea: Idea) => void
}

export function IdeaCard({ idea, canVote, onToggleVote }: IdeaCardProps) {
  return (
    <article className="idea-card">
      <VoteButton idea={idea} canVote={canVote} onToggle={onToggleVote} />
      <div className="idea-card__body">
        <h2 className="idea-card__title">{idea.title}</h2>
        {idea.description && (
          <p className="idea-card__description">{idea.description}</p>
        )}
        <p className="idea-card__meta">
          <span className="idea-card__author">{idea.created_by}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={idea.created_at}>
            {formatRelativeTime(idea.created_at)}
          </time>
        </p>
      </div>
    </article>
  )
}
