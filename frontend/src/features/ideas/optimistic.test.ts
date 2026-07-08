import { describe, expect, it } from 'vitest'
import type { Idea, Paginated } from '../../lib/types'
import { applyVoteToggle } from './optimistic'

function makeIdea(overrides: Partial<Idea> = {}): Idea {
  return {
    id: 1,
    title: 'Dark mode',
    description: '',
    vote_count: 10,
    created_at: '2026-07-01T00:00:00Z',
    created_by: 'demo',
    has_voted: false,
    ...overrides,
  }
}

function makePage(ideas: Idea[]): Paginated<Idea> {
  return { count: ideas.length, next: null, previous: null, results: ideas }
}

describe('applyVoteToggle', () => {
  it('increments and marks voted when toggling on', () => {
    const page = makePage([makeIdea()])
    const next = applyVoteToggle(page, 1, true)
    expect(next.results[0].vote_count).toBe(11)
    expect(next.results[0].has_voted).toBe(true)
  })

  it('decrements and clears voted when toggling off', () => {
    const page = makePage([makeIdea({ has_voted: true, vote_count: 10 })])
    const next = applyVoteToggle(page, 1, false)
    expect(next.results[0].vote_count).toBe(9)
    expect(next.results[0].has_voted).toBe(false)
  })

  it('is a no-op when the state already matches', () => {
    const page = makePage([makeIdea({ has_voted: true, vote_count: 10 })])
    const next = applyVoteToggle(page, 1, true)
    expect(next.results[0].vote_count).toBe(10)
  })

  it('never drops below zero', () => {
    const page = makePage([makeIdea({ has_voted: true, vote_count: 0 })])
    const next = applyVoteToggle(page, 1, false)
    expect(next.results[0].vote_count).toBe(0)
  })

  it('does not mutate the original page', () => {
    const page = makePage([makeIdea()])
    applyVoteToggle(page, 1, true)
    expect(page.results[0].vote_count).toBe(10)
    expect(page.results[0].has_voted).toBe(false)
  })

  it('only touches the targeted idea', () => {
    const page = makePage([makeIdea({ id: 1 }), makeIdea({ id: 2 })])
    const next = applyVoteToggle(page, 1, true)
    expect(next.results[1].vote_count).toBe(10)
    expect(next.results[1].has_voted).toBe(false)
  })
})
