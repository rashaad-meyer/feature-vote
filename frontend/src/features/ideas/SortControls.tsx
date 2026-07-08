import type { SortKey } from '../../lib/types'

interface SortControlsProps {
  sort: SortKey
  onChange: (sort: SortKey) => void
}

const OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'votes', label: 'Most votes' },
  { key: 'newest', label: 'Newest' },
]

export function SortControls({ sort, onChange }: SortControlsProps) {
  return (
    <div className="sort-controls" role="group" aria-label="Sort ideas">
      {OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          className="sort-controls__option"
          aria-pressed={sort === option.key}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
