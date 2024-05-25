import type { ErroryType } from 'errory'
import { createErroryThings } from 'errory'
import { useFormik } from 'formik'
import { withZodSchema } from 'formik-validator-zod'
import { useEffect, useMemo, useRef, useState } from 'react'
import { type z } from 'zod'

type ValuesInputTypeByZodSchema<TZodSchema extends z.ZodTypeAny> = z.input<TZodSchema>
type ValuesOutputTypeByZodSchema<TZodSchema extends z.ZodTypeAny> = z.output<TZodSchema>
type ValuesInputType<T extends z.ZodTypeAny | Record<string, any>> = T extends z.ZodTypeAny
  ? ValuesInputTypeByZodSchema<T>
  : T extends Record<string, any>
    ? T
    : {}
type ValuesOutputType<T extends z.ZodTypeAny | Record<string, any>> = T extends z.ZodTypeAny
  ? ValuesOutputTypeByZodSchema<T>
  : T extends Record<string, any>
    ? T
    : {}

type InformerProps = {
  hidden?: boolean
  type: 'positive' | 'negative'
  message: React.ReactNode
}
type ToastProps = {
  type: 'positive' | 'negative'
  duration?: number | false
  message: React.ReactNode
}
type ButtonProps = {
  loading?: boolean
  disabled?: boolean
}

export type UseFormyGeneralProps = {
  informerDuration?: number | false
  successInformerDuration?: number | false
  failureInformerDuration?: number | false
  toastDuration?: number | false
  successToastDuration?: number | false
  failureToastDuration?: number | false
  messagePolicy?: 'informer' | 'toast'
  successMessagePolicy?: 'informer' | 'toast'
  submitErrorMessagePolicy?: 'informer' | 'toast'
  validationErrorMessagePolicy?: 'informer' | 'toast'
  hideSuccessToastOnSubmit?: boolean
  hideFailureToastOnSubmit?: boolean
  resetOnSuccess?: boolean
  showSuccessMessage?: boolean
  showSubmittingErrorMessage?: boolean
  showValidationErrorMessage?: boolean
  submitOnMount?: boolean
  validateOnMount?: boolean
  enableReinitialize?: boolean
  preventPristineSubmit?: boolean
  preventInvalidSubmit?: boolean
  trackError?: (error: any, meta?: any) => any
  Errory?: ErroryType
  toast?: {
    (props: ToastProps): string
    dismiss: (id: string) => void
  }
}
type UseFormySpecificProps<T extends z.ZodTypeAny | Record<string, any>, TSubmitResult> = {
  validationSchema?: T extends z.ZodTypeAny ? T : never
  initialValues?: ValuesInputType<T>
  onSubmit?: (props: { valuesInput: ValuesInputType<T>; valuesOutput: ValuesOutputType<T> }) => TSubmitResult
  successMessage?:
    | React.ReactNode
    | false
    | ((props: {
        valuesInput: ValuesInputType<T>
        valuesOutput: ValuesOutputType<T>
        submitResult: Awaited<TSubmitResult>
      }) => React.ReactNode | false)
}
type UseFormyProps<T extends z.ZodTypeAny | Record<string, any>, TSubmitResult> = UseFormyGeneralProps &
  UseFormySpecificProps<T, TSubmitResult>

export const useFormy = <T extends z.ZodTypeAny | Record<string, any>, TSubmitResult>({
  successMessage = false,
  informerDuration = 6_000,
  successInformerDuration,
  failureInformerDuration,
  toastDuration = 6_000,
  successToastDuration,
  failureToastDuration,
  messagePolicy = 'toast',
  successMessagePolicy,
  submitErrorMessagePolicy,
  validationErrorMessagePolicy,
  hideSuccessToastOnSubmit = false,
  hideFailureToastOnSubmit = true,
  resetOnSuccess = false,
  showSuccessMessage = true,
  showSubmittingErrorMessage = true,
  showValidationErrorMessage = false,
  initialValues,
  validationSchema,
  onSubmit,
  enableReinitialize = false,
  submitOnMount = false,
  validateOnMount = false,
  preventPristineSubmit = false,
  preventInvalidSubmit = false,
  toast,
  trackError,
  Errory,
}: UseFormyProps<T, TSubmitResult>) => {
  Errory = Errory || createErroryThings().Errory
  successMessagePolicy = successMessagePolicy ?? messagePolicy
  submitErrorMessagePolicy = submitErrorMessagePolicy ?? messagePolicy
  validationErrorMessagePolicy = validationErrorMessagePolicy ?? messagePolicy
  successInformerDuration = successInformerDuration ?? informerDuration
  failureInformerDuration = failureInformerDuration ?? informerDuration
  successToastDuration = successToastDuration ?? toastDuration
  failureToastDuration = failureToastDuration ?? toastDuration

  const [successMessageNormalized, setSuccessMessageNormalized] = useState<React.ReactNode | false>(null)
  const [successInformerVisible, setSuccessInformerVisible] = useState(false)
  const [failureInformerVisible, setFailureInformerVisible] = useState(false)
  const [submittingError, setSubmittingError] = useState<Error | null>(null)
  const hideSuccessInformerTimeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null)
  const hideFailureInformerTimeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null)
  const successToastIdRef = useRef<null | undefined | string>(null)
  const failureToastIdRef = useRef<null | undefined | string>(null)

  const reset = () => {
    formik.resetForm()
  }

  const formik = useFormik<ValuesInputType<T>>({
    enableReinitialize,
    initialValues: initialValues || ({} as any),
    validateOnMount,
    // ...(validationSchema && { validationSchema: toFormikValidationSchema(validationSchema) }),
    ...(validationSchema && { validate: withZodSchema(validationSchema) }),
    onSubmit: async (values) => {
      if (!onSubmit) {
        return
      }
      try {
        if (hideSuccessInformerTimeoutRef.current) {
          clearTimeout(hideSuccessInformerTimeoutRef.current)
        }
        if (hideFailureInformerTimeoutRef.current) {
          clearTimeout(hideFailureInformerTimeoutRef.current)
        }
        if (successToastIdRef.current && hideSuccessToastOnSubmit) {
          toast?.dismiss(successToastIdRef.current)
        }
        if (failureToastIdRef.current && hideFailureToastOnSubmit) {
          toast?.dismiss(failureToastIdRef.current)
        }
        setSubmittingError(null)
        const valuesInput = values
        const valuesOutput = validationSchema ? validationSchema.parse(values) : values
        // eslint-disable-next-line @typescript-eslint/await-thenable
        const submitResult = await onSubmit({
          valuesInput,
          valuesOutput,
        })
        const successMessageNormalizedHere =
          typeof successMessage === 'function'
            ? successMessage({ valuesInput, valuesOutput, submitResult })
            : successMessage
        setSuccessMessageNormalized(successMessageNormalizedHere)
        if (successMessagePolicy === 'toast' && showSuccessMessage && successMessageNormalizedHere) {
          // eslint-disable-next-line require-atomic-updates
          successToastIdRef.current = toast?.({
            message: successMessageNormalizedHere,
            type: 'positive',
            duration: successToastDuration,
          })
        }
        if (successMessagePolicy === 'informer' && showSuccessMessage && successMessageNormalizedHere) {
          setSuccessInformerVisible(true)
          if (successInformerDuration && successInformerDuration !== Infinity) {
            // eslint-disable-next-line require-atomic-updates
            hideSuccessInformerTimeoutRef.current = setTimeout(() => {
              setSuccessInformerVisible(false)
            }, successInformerDuration)
          }
        }
        if (resetOnSuccess) {
          reset()
        }
      } catch (error: any) {
        const errory = Errory.toErrory(error)
        setSubmittingError(error)
        if (submitErrorMessagePolicy === 'toast' && showSubmittingErrorMessage) {
          // eslint-disable-next-line require-atomic-updates
          failureToastIdRef.current = toast?.({
            message: errory.message,
            type: 'negative',
            duration: failureToastDuration,
          })
        }
        if (successMessagePolicy === 'informer' && showSubmittingErrorMessage) {
          setFailureInformerVisible(true)
          if (failureInformerDuration && failureInformerDuration !== Infinity) {
            // eslint-disable-next-line require-atomic-updates
            hideFailureInformerTimeoutRef.current = setTimeout(() => {
              setFailureInformerVisible(false)
            }, failureInformerDuration)
          }
        }
        if (!errory.expected) {
          trackError?.(error, errory.meta)
        }
      }
    },
  })

  const informerProps = useMemo<InformerProps>((): InformerProps => {
    if (
      submittingError &&
      submitErrorMessagePolicy === 'informer' &&
      showSubmittingErrorMessage &&
      failureInformerVisible
    ) {
      return {
        hidden: false,
        message: submittingError.message,
        type: 'negative',
      }
    }
    if (
      showValidationErrorMessage &&
      !formik.isValid &&
      !!formik.submitCount &&
      validationErrorMessagePolicy === 'informer' &&
      failureInformerVisible
    ) {
      return {
        hidden: false,
        message: 'Some fields are invalid',
        type: 'negative',
      }
    }
    if (successInformerVisible && successMessageNormalized && successMessagePolicy === 'informer') {
      return {
        hidden: false,
        message: successMessageNormalized,
        type: 'positive',
      }
    }
    return {
      type: 'negative',
      hidden: true,
      message: null,
    }
  }, [
    submittingError,
    formik.isValid,
    formik.submitCount,
    successInformerVisible,
    successMessage,
    showValidationErrorMessage,
    successMessagePolicy,
    submitErrorMessagePolicy,
    validationErrorMessagePolicy,
  ])

  const validationErrorToastProps = useMemo<(ToastProps & { submitCount: number }) | null>(():
    | (ToastProps & { submitCount: number })
    | null => {
    if (
      showValidationErrorMessage &&
      !formik.isValid &&
      !!formik.submitCount &&
      validationErrorMessagePolicy === 'toast'
    ) {
      return {
        message: 'Some fields are invalid',
        type: 'negative',
        submitCount: formik.submitCount,
      }
    }
    return null
  }, [
    submittingError,
    formik.isValid,
    formik.submitCount,
    showValidationErrorMessage,
    submitErrorMessagePolicy,
    validationErrorMessagePolicy,
  ])
  useEffect(() => {
    if (validationErrorToastProps !== null) {
      toast?.({ ...validationErrorToastProps, duration: failureToastDuration })
    }
  }, [JSON.stringify(validationErrorToastProps)])

  const buttonProps = useMemo<ButtonProps>((): ButtonProps => {
    const disabledBecausePristine = preventPristineSubmit && !formik.dirty
    const disabledBecauseInvalid = preventInvalidSubmit && !formik.isValid && !!formik.submitCount
    return {
      loading: formik.isSubmitting,
      disabled: disabledBecausePristine || disabledBecauseInvalid,
    }
  }, [
    preventPristineSubmit,
    formik.dirty,
    formik.isValid,
    formik.submitCount,
    formik.isSubmitting,
    preventInvalidSubmit,
  ])

  useEffect(() => {
    if (submitOnMount && !formik.submitCount) {
      void formik.submitForm()
    }
  }, [formik.submitCount, submitOnMount])

  const formProps = {
    onSubmit: formik.handleSubmit,
  }
  const getFieldyProps = (name: string) => {
    return {
      name,
      formy,
    }
  }
  Object.assign(formik, {
    informerProps,
    buttonProps,
    formProps,
    getFieldyProps,
  })
  const formy = formik as typeof formik & {
    informerProps: InformerProps
    buttonProps: ButtonProps
    formProps: typeof formProps
    getFieldyProps: typeof getFieldyProps
  }

  return formy
}

export type UseFormy = typeof useFormy
export type Formy<T extends z.ZodTypeAny | Record<string, any> = Record<string, any>, TSubmitResult = any> = ReturnType<
  typeof useFormy<T, TSubmitResult>
>

export const createUseFormy = (defaultProps: Partial<UseFormyGeneralProps>): UseFormy => {
  return (props) =>
    useFormy({
      ...defaultProps,
      ...props,
    })
}
