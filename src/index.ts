import type { UseFormyGeneralProps } from '@/useFormy.js'
import { createUseFormy } from '@/useFormy.js'
import { useFormyField } from '@/useFormyField.js'

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

export type { Formy } from '@/useFormy.js'
export { useFormy } from '@/useFormy.js'
export { useFormyField } from '@/useFormyField.js'
