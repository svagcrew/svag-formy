import type { UseFormyGeneralProps } from '@/useFormy'
import { createUseFormy } from '@/useFormy'
import { useFormyField } from '@/useFormyField'

export const createFormyThings = ({
  useFormyProps = {},
}: {
  useFormyProps?: UseFormyGeneralProps
} = {}): {
  useFormy: ReturnType<typeof createUseFormy>
  useFormyField: typeof useFormyField
} => {
  const useFormy = createUseFormy(useFormyProps)

  return {
    useFormy,
    useFormyField,
  }
}

export type { Formy } from '@/useFormy'
export { useFormy } from '@/useFormy'
export { useFormyField } from '@/useFormyField'
