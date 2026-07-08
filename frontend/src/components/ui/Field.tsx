import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import './field.css'

interface BaseProps {
  label: string
  error?: string
  hint?: string
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>

export const InputField = forwardRef<HTMLInputElement, InputProps>(
  function InputField({ label, error, hint, id, ...props }, ref) {
    const generatedId = useId()
    const fieldId = id ?? generatedId
    const describedBy = error
      ? `${fieldId}-error`
      : hint
        ? `${fieldId}-hint`
        : undefined
    return (
      <div className="field">
        <label className="field__label" htmlFor={fieldId}>
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          className="field__control"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {hint && !error && (
          <p id={`${fieldId}-hint`} className="field__hint">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${fieldId}-error`} className="field__error" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)

type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function TextareaField({ label, error, hint, id, ...props }, ref) {
    const generatedId = useId()
    const fieldId = id ?? generatedId
    const describedBy = error
      ? `${fieldId}-error`
      : hint
        ? `${fieldId}-hint`
        : undefined
    return (
      <div className="field">
        <label className="field__label" htmlFor={fieldId}>
          {label}
        </label>
        <textarea
          ref={ref}
          id={fieldId}
          className="field__control field__control--textarea"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {hint && !error && (
          <p id={`${fieldId}-hint`} className="field__hint">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${fieldId}-error`} className="field__error" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)
