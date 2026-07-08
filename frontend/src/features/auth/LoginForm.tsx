import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/Field'
import { ApiError } from '../../lib/apiClient'
import { useAuth } from './useAuth'

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginValues = z.infer<typeof schema>

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { signIn } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async ({ username, password }) => {
    setFormError(null)
    try {
      await signIn(username, password)
      onSuccess()
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Something went wrong. Please try again.',
      )
    }
  })

  return (
    <form className="login-form" onSubmit={onSubmit} noValidate>
      <InputField
        label="Username"
        autoComplete="username"
        autoFocus
        error={errors.username?.message}
        {...register('username')}
      />
      <InputField
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      {formError && (
        <p className="login-form__error" role="alert">
          {formError}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
