import { useState, useCallback } from 'react'

import { apiService } from '../services/api'
import type { ApplicationData, FormField, FormStep, FormSchema } from '../types/form'
import { isTelegramWebApp, getTelegramUserId } from '../utils/platform'

// Реэкспортируем типы для удобства
export type { ApplicationData, FormField, FormStep, FormSchema }

export interface DynamicFormState {
  schema: FormSchema | null
  currentStep: FormStep | null
  currentStepId: string | null
  formData: ApplicationData
  applicationUuid: string | null
  isLoading: boolean
  error: string | null
}

export interface DynamicFormActions {
  initializeForm: () => Promise<void>
  goToNextStep: (fieldValues: Record<string, any>) => Promise<void>
  goToStep: (stepId: string) => void
  updateFormData: (data: Record<string, any>) => void
  saveProgress: () => Promise<void>
  submitApplication: () => Promise<void>
  restartForm: () => void
}

export function useDynamicForm(): [DynamicFormState, DynamicFormActions] {
  const [state, setState] = useState<DynamicFormState>({
    schema: null,
    currentStep: null,
    currentStepId: null,
    formData: {},
    applicationUuid: null,
    isLoading: false,
    error: null,
  })

  // Инициализация формы - получение схемы и создание сессии
  const initializeForm = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      console.log('Инициализация динамической формы...')

      // Получаем схему формы
      const schema = await apiService.getActiveFormSchema()
      console.log('Полученная схема:', schema)
      console.log('start_step_id:', schema.start_step_id)
      console.log(
        'Доступные шаги:',
        schema.steps?.map((s) => s.step_id),
      )

      // Проверяем, есть ли в URL параметр application_uuid для продолжения заполнения
      const urlParams = new URLSearchParams(window.location.search)
      const existingApplicationUuid = urlParams.get('application_uuid')

      let applicationUuid: string
      let existingFormData: ApplicationData = {}

      if (existingApplicationUuid) {
        // Продолжаем заполнение существующей заявки
        console.log('Продолжаем заполнение заявки:', existingApplicationUuid)
        applicationUuid = existingApplicationUuid

        // Загружаем сохраненные данные
        try {
          const applicationData = await apiService.getApplicationData(existingApplicationUuid)
          existingFormData = applicationData.data || {}
          console.log('Загружены данные заявки:', existingFormData)
        } catch (error) {
          console.warn('Не удалось загрузить данные заявки:', error)
        }
      } else {
        // Создаем новую сессию
        const session = isTelegramWebApp()
          ? await apiService.createTelegramSession(getTelegramUserId() || 0)
          : await apiService.createWebSession()
        applicationUuid = session.application_uuid
      }

      // Определяем текущий шаг на основе заполненных данных
      let currentStepId = schema.start_step_id
      let currentStep = schema.steps?.find((step) => step.step_id === currentStepId)

      if (!currentStep) {
        throw new Error(
          `Начальный шаг "${schema.start_step_id}" не найден в схеме. Доступные шаги: ${schema.steps?.map((s) => s.step_id).join(', ')}`,
        )
      }

      // Если продолжаем заполнение, находим первый незаполненный шаг
      if (existingApplicationUuid && Object.keys(existingFormData).length > 0) {
        console.log('Ищем первый незаполненный шаг...')
        let tempStepId = schema.start_step_id

        // Проходим по шагам, пока не найдем незаполненный
        for (let i = 0; i < schema.steps.length && tempStepId; i++) {
          const step = schema.steps.find((s) => s.step_id === tempStepId)
          if (!step) break

          // Проверяем, заполнены ли все обязательные поля этого шага
          const requiredFields = step.fields?.filter((field) => field.required) || []
          const allFilled = requiredFields.every((field) => {
            const value = existingFormData[field.field_id]
            return value !== undefined && value !== null && value !== ''
          })

          if (!allFilled) {
            // Нашли первый незаполненный шаг
            currentStepId = tempStepId
            currentStep = step
            console.log('Продолжаем с шага:', currentStepId)
            break
          }

          // Переходим к следующему шагу
          const nextStepId = calculateNextStep(step, existingFormData)
          if (!nextStepId) {
            // Достигли конца формы
            currentStepId = tempStepId
            currentStep = step
            break
          }
          tempStepId = nextStepId
        }
      }

      setState((prev) => ({
        ...prev,
        schema,
        currentStep,
        currentStepId,
        applicationUuid,
        formData: existingFormData,
        isLoading: false,
      }))

      console.log('Форма инициализирована:', {
        schemaName: schema.name,
        currentStep: currentStepId,
        applicationUuid,
        resuming: !!existingApplicationUuid,
      })
    } catch (error) {
      console.error('Ошибка инициализации формы:', error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      }))
    }
  }, [])

  // Переход к следующему шагу
  const goToNextStep = useCallback(
    async (fieldValues: Record<string, any>) => {
      if (!state.schema || !state.currentStep) {
        console.error('Схема или текущий шаг не определены')
        return
      }

      console.log('Переход к следующему шагу с данными:', fieldValues)

      // Обновляем данные формы
      const newFormData = { ...state.formData, ...fieldValues }

      // Определяем следующий шаг
      const nextStepId = calculateNextStep(state.currentStep, newFormData)

      if (!nextStepId) {
        console.log('Достигнут конец формы')
        return
      }

      const nextStep = state.schema.steps.find((step) => step.step_id === nextStepId)

      if (!nextStep) {
        console.error(`Шаг "${nextStepId}" не найден в схеме`)
        return
      }

      setState((prev) => ({
        ...prev,
        currentStep: nextStep,
        currentStepId: nextStepId,
        formData: newFormData,
      }))

      // Сохраняем прогресс
      if (state.applicationUuid) {
        try {
          await apiService.saveApplicationProgress(state.applicationUuid, newFormData)
        } catch (error) {
          console.error('Ошибка сохранения прогресса:', error)
        }
      }
    },
    [state.schema, state.currentStep, state.formData, state.applicationUuid],
  )

  // Переход к конкретному шагу
  const goToStep = useCallback(
    (stepId: string) => {
      if (!state.schema) return

      const step = state.schema.steps.find((s) => s.step_id === stepId)
      if (!step) {
        console.error(`Шаг "${stepId}" не найден`)
        return
      }

      setState((prev) => ({
        ...prev,
        currentStep: step,
        currentStepId: stepId,
      }))
    },
    [state.schema],
  )

  // Обновление данных формы
  const updateFormData = useCallback((data: Record<string, any>) => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, ...data },
    }))
  }, [])

  // Сохранение прогресса
  const saveProgress = useCallback(async () => {
    if (!state.applicationUuid) return

    try {
      await apiService.saveApplicationProgress(state.applicationUuid, state.formData)
      console.log('Прогресс сохранен')
    } catch (error) {
      console.error('Ошибка сохранения прогресса:', error)
      throw error
    }
  }, [state.applicationUuid, state.formData])

  // Отправка заявки
  const submitApplication = useCallback(async () => {
    if (!state.applicationUuid) return

    try {
      await apiService.submitApplication(state.applicationUuid)
      console.log('Заявка отправлена')
    } catch (error) {
      console.error('Ошибка отправки заявки:', error)
      throw error
    }
  }, [state.applicationUuid])

  // Перезапуск формы
  const restartForm = useCallback(() => {
    setState({
      schema: null,
      currentStep: null,
      currentStepId: null,
      formData: {},
      applicationUuid: null,
      isLoading: false,
      error: null,
    })
    initializeForm()
  }, [initializeForm])

  return [
    state,
    {
      initializeForm,
      goToNextStep,
      goToStep,
      updateFormData,
      saveProgress,
      submitApplication,
      restartForm,
    },
  ]
}

// Вспомогательная функция для определения следующего шага
function calculateNextStep(currentStep: FormStep, formData: ApplicationData): string | null {
  const { navigation } = currentStep

  if (navigation.type === 'direct') {
    return navigation.next_step_id || null
  }

  if (navigation.type === 'conditional' && navigation.source_field_id) {
    const sourceValue = formData[navigation.source_field_id]

    // Ищем подходящее правило
    if (navigation.rules) {
      for (const rule of navigation.rules) {
        if (rule.value === sourceValue) {
          return rule.next_step_id
        }
      }
    }

    // Возвращаем шаг по умолчанию
    return navigation.default_next_step_id || null
  }

  if (navigation.type === 'submit') {
    // Для submit навигации возвращаем null - это означает конец формы
    return null
  }

  return null
}

// Вспомогательная функция для проверки условий отображения поля
export function shouldShowField(field: FormField, formData: ApplicationData): boolean {
  if (!field.condition) return true

  const { field_id, operator, value } = field.condition
  const fieldValue = formData[field_id]

  switch (operator) {
    case 'equals':
      return fieldValue === value
    case 'not_equals':
      return fieldValue !== value
    case 'in':
      return Array.isArray(value) && value.includes(fieldValue)
    case 'not_in':
      return Array.isArray(value) && !value.includes(fieldValue)
    default:
      return true
  }
}
