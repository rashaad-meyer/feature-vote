import { PAGE_SIZE } from '../../lib/config'
import { Button } from '../../components/ui/Button'

interface PaginationProps {
  page: number
  totalCount: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalCount, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  if (totalPages <= 1) return null

  return (
    <nav className="pagination" aria-label="Pagination">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Previous
      </Button>
      <span className="pagination__status" aria-live="polite">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </Button>
    </nav>
  )
}
