import type { Formy } from '@/useFormy.js'
import get from 'lodash/get.js'

const normalizeError = (e: any): string | null => {
  if (!e) return null
  if (Array.isArray(e)) return normalizeError(e.find((ee) => normalizeError(ee) || false))
  if (typeof e === 'object') return normalizeError(Object.values(e).find((ee) => normalizeError(ee) || false))
  if (typeof e === 'string') return e
  return JSON.stringify(e)
}

const normalizeTouched = (t: any): boolean => {
  if (typeof t === 'boolean') return t
  if (Array.isArray(t)) return t.some(normalizeTouched)
  if (typeof t === 'object') return Object.values(t).some(normalizeTouched)
  return false
}

export const useFormyField = ({ formy, name }: { formy: Formy; name: string }) => {
  const value = get(formy.values, name)
  const validationError = normalizeError(get(formy.errors, name))
  const touched = normalizeTouched(get(formy.touched, name))
  const invalid = touched && !!validationError
  const error = invalid ? validationError : undefined
  return {
    value,
    validationError,
    error,
    touched,
    invalid,
  }
}
