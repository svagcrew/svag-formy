import { createTextInputy, type TextInputFormyComponent, type TextInputUIComponent } from '@/components/TextInput'
import type { UseFormyGeneralProps } from '@/useFormy'
export type { Formy } from '@/useFormy'
import { createUseFormy } from '@/useFormy'

export const createFormyThings = <TTextInputUIComponent extends TextInputUIComponent>({
  useFormyProps = {},
  components = {},
}: {
  useFormyProps?: UseFormyGeneralProps
  components?: {
    TextInput?: TTextInputUIComponent
  }
} = {}): {
  useFormy: ReturnType<typeof createUseFormy>
  components: {
    TextInputy: TTextInputUIComponent extends TextInputUIComponent
      ? TextInputFormyComponent<TTextInputUIComponent>
      : never
  }
} => {
  const useFormy = createUseFormy(useFormyProps)
  const formyComponents = {
    ...(components.TextInput ? { TextInputy: createTextInputy(components.TextInput) } : {}),
  }

  return {
    useFormy,
    components: formyComponents as any,
  }
}
