import { useFormyField } from '@/useFormyField'
import type { FormyInputPropsGeneral } from '@/utils'
import type { ComponentProps } from 'react'
import React from 'react'

export type TextInputUIComponent = React.FC<{
  value: string
  error?: string
  invalid?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => any
  onBlur?: () => any
}>

type TextInputFormyComponentProps<TTextInputUIComponent extends TextInputUIComponent> = FormyInputPropsGeneral &
  ComponentProps<TTextInputUIComponent> & {
    onChange?: (e: React.ChangeEvent<HTMLInputElement>, value: string) => any
  }
export type TextInputFormyComponent<TTextInputUIComponent extends TextInputUIComponent> = React.FC<
  TextInputFormyComponentProps<TTextInputUIComponent>
>

export const createTextInputy = <TTextInputUIComponent extends TextInputUIComponent>(
  TextInput: TTextInputUIComponent
): TextInputFormyComponent<TTextInputUIComponent> => {
  const TextInput1 = TextInput as TextInputUIComponent
  return ({ formy, name, ...restProps }: TextInputFormyComponentProps<TTextInputUIComponent>) => {
    const { error, value } = useFormyField({ formy, name })
    return (
      <TextInput1
        {...restProps}
        value={value}
        invalid={!!error}
        error={error}
        onChange={(e) => {
          const newValue = e.target.value
          void formy.setFieldValue(name, newValue)
          restProps?.onChange?.(e, newValue)
        }}
        onBlur={() => {
          void formy.setFieldTouched(name, true)
          restProps?.onBlur?.()
        }}
      />
    )
  }
}
