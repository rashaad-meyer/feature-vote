import type { Idea } from '../../lib/types'

interface VoteButtonProps {
  idea: Idea
  canVote: boolean
  onToggle: (idea: Idea) => void
}

export function VoteButton({ idea, canVote, onToggle }: VoteButtonProps) {
  const label = idea.has_voted
    ? `Remove your vote for ${idea.title}`
    : `Vote for ${idea.title}`

  return (
    <button
      type="button"
      className="vote-pill"
      aria-pressed={idea.has_voted}
      aria-label={label}
      disabled={!canVote}
      onClick={() => onToggle(idea)}
    >
      <span className="vote-pill__count">{idea.vote_count}</span>
      <svg
        className="vote-pill__arrow"
        viewBox="0 0 16 16"
        width="16"
        height="16"
        aria-hidden="true"
      >
        <path
          d="M8 3.5 3 9.5h10L8 3.5Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
