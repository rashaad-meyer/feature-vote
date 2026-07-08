import { Link } from 'react-router-dom'
import { useListUrlState } from '../../hooks/useUrlState'
import type { Idea } from '../../lib/types'
import { useAuth } from '../auth/useAuth'
import { CreateIdeaForm } from './CreateIdeaForm'
import { IdeaList } from './IdeaList'
import { Pagination } from './Pagination'
import { SortControls } from './SortControls'
import { useIdeas } from './useIdeas'
import { useVote } from './useVote'
import './ideas.css'

export function IdeasPage() {
  const { isAuthenticated } = useAuth()
  const { sort, page, setSort, setPage } = useListUrlState()
  const { data, isPending, isError, error, isPlaceholderData } = useIdeas(
    sort,
    page,
  )
  const vote = useVote()

  const handleToggleVote = (idea: Idea) => vote.mutate({ idea })

  return (
    <main className="ideas container">
      <header className="ideas__header">
        <div>
          <h1 className="ideas__title">Ideas</h1>
          <p className="ideas__subtitle">
            Vote on what we build next — or add your own.
          </p>
        </div>
        <SortControls sort={sort} onChange={setSort} />
      </header>

      {isAuthenticated ? (
        <CreateIdeaForm />
      ) : (
        <p className="ideas__signin-hint">
          <Link to="/login">Sign in</Link> to vote and post ideas.
        </p>
      )}

      <section
        aria-busy={isPending || isPlaceholderData}
        aria-labelledby="ideas-region"
      >
        <h2 id="ideas-region" className="visually-hidden">
          Ideas list
        </h2>

        {isPending && <p className="ideas__status">Loading ideas…</p>}

        {isError && (
          <p className="ideas__status ideas__status--error" role="alert">
            {error instanceof Error
              ? error.message
              : 'Could not load ideas.'}
          </p>
        )}

        {data && (
          <>
            <IdeaList
              ideas={data.results}
              canVote={isAuthenticated}
              onToggleVote={handleToggleVote}
            />
            <Pagination
              page={page}
              totalCount={data.count}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </main>
  )
}
