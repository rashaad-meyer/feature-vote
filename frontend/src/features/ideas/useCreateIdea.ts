import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateIdeaInput, Idea } from '../../lib/types'
import { createIdea } from './ideas.api'

export function useCreateIdea() {
  const queryClient = useQueryClient()

  return useMutation<Idea, Error, CreateIdeaInput>({
    mutationFn: createIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] })
    },
  })
}
