import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { InputField, TextareaField } from '../../components/ui/Field'
import { useToast } from '../../components/ui/useToast'
import { ApiError } from '../../lib/apiClient'
import { useCreateIdea } from './useCreateIdea'

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Give your idea a title (at least 3 characters).')
    .max(200, 'Titles are limited to 200 characters.'),
  description: z
    .string()
    .trim()
    .max(2000, 'Descriptions are limited to 2000 characters.'),
})

type CreateIdeaValues = z.infer<typeof schema>

export function CreateIdeaForm() {
  const [open, setOpen] = useState(false)
  const { showToast } = useToast()
  const createIdea = useCreateIdea()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateIdeaValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createIdea.mutateAsync(values)
      showToast('Idea posted.', 'success')
      reset()
      setOpen(false)
    } catch (error) {
      showToast(
        error instanceof ApiError
          ? error.message
          : 'Could not post your idea. Please try again.',
      )
    }
  })

  if (!open) {
    return (
      <div className="create-idea create-idea--collapsed">
        <Button onClick={() => setOpen(true)}>+ New idea</Button>
      </div>
    )
  }

  return (
    <form className="create-idea" onSubmit={onSubmit} noValidate>
      <InputField
        label="Title"
        placeholder="Short, specific summary"
        autoFocus
        error={errors.title?.message}
        {...register('title')}
      />
      <TextareaField
        label="Description"
        placeholder="What problem does this solve? (optional)"
        error={errors.description?.message}
        {...register('description')}
      />
      <div className="create-idea__actions">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Posting…' : 'Post idea'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            reset()
            setOpen(false)
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
