import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useDynamicForm, shouldShowField, FormField } from '../../hooks/useDynamicForm'
import type { ChatFile } from '../../types/chat'
import {
  safeAsync,
  handleSubmissionError,
  telegramErrorHandler,
  defaultErrorHandler,
  type ErrorHandler,
} from '../../utils/errorHandling'
import { type MessageButton } from '../Message'
import MessagesList from '../MessagesList'
import WidgetHeader from '../WidgetHeader'
import DynamicField from '../DynamicField'
import Button from '../Button'
import styles from '../WidgetWindow/styles.module.css'

export interface DynamicWidgetWindowProps {
  onClose: () => void
  isFullscreen?: boolean
}

interface ChatMessage {
  id: string
  text: string
  isBot: boolean
  buttons?: MessageButton[]
  files?: ChatFile[]
}

export const DynamicWidgetWindow: React.FC<DynamicWidgetWindowProps> = ({
  onClose,
  isFullscreen = false,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentStepData, setCurrentStepData] = useState<Record<string, any>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [
    { schema, currentStep, currentStepId, formData, applicationUuid, isLoading, error: formError },
    { initializeForm, goToNextStep, updateFormData, saveProgress, submitApplication, restartForm },
  ] = useDynamicForm()

  // Определяем обработчик ошибок в зависимости от платформы
  const errorHandler: ErrorHandler = useMemo(() => {
    return typeof window !== 'undefined' && window.Telegram?.WebApp
      ? telegramErrorHandler
      : defaultErrorHandler
  }, [])

  // Инициализация формы при монтировании
  useEffect(() => {
    initializeForm()
  }, [initializeForm])

  // Обработка ошибок формы
  useEffect(() => {
    if (formError) {
      setError(formError)
    }
  }, [formError])

  // Добавляем сообщение бота при изменении шага
  useEffect(() => {
    if (currentStep && currentStepId) {
      console.log('Показываем шаг:', currentStepId, currentStep)

      const botMessage: ChatMessage = {
        id: `bot-${currentStepId}-${Date.now()}`,
        text: currentStep.title,
        isBot: true,
      }

      setMessages((prev) => [...prev, botMessage])
      setCurrentStepData({}) // Сбрасываем данные текущего шага
    }
  }, [currentStep, currentStepId])

  // Обработка изменения поля
  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    console.log('Изменение поля:', fieldId, value)
    setCurrentStepData((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }, [])

  // Переход к следующему шагу
  const handleNextStep = useCallback(async () => {
    if (!currentStep || isProcessing) return

    setIsProcessing(true)

    try {
      console.log('Переход к следующему шагу с данными:', currentStepData)

      // Проверяем обязательные поля
      const visibleFields = currentStep.fields.filter((field) =>
        shouldShowField(field, { ...formData, ...currentStepData }),
      )

      const requiredFields = visibleFields.filter((field) => field.required)
      const missingFields = requiredFields.filter(
        (field) => !currentStepData[field.field_id] || currentStepData[field.field_id] === '',
      )

      if (missingFields.length > 0) {
        const fieldNames = missingFields.map((f) => f.label).join(', ')
        setError(`Заполните обязательные поля: ${fieldNames}`)
        setIsProcessing(false)
        return
      }

      // Добавляем сообщение пользователя с ответами
      const userAnswers = Object.entries(currentStepData)
        .map(([fieldId, value]) => {
          const field = currentStep.fields.find((f) => f.field_id === fieldId)
          if (!field) return null

          if (Array.isArray(value)) {
            return `${field.label}: ${value.join(', ')}`
          }
          return `${field.label}: ${value}`
        })
        .filter(Boolean)
        .join('\n')

      if (userAnswers) {
        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          text: userAnswers,
          isBot: false,
        }
        setMessages((prev) => [...prev, userMessage])
      }

      // Переходим к следующему шагу
      await goToNextStep(currentStepData)
    } catch (error) {
      console.error('Ошибка перехода к следующему шагу:', error)
      setError(error instanceof Error ? error.message : 'Ошибка перехода к следующему шагу')
    } finally {
      setIsProcessing(false)
    }
  }, [currentStep, currentStepData, formData, goToNextStep, isProcessing])

  // Обработка отправки формы
  const handleFormSubmit = useCallback(async () => {
    if (!applicationUuid) return

    setIsProcessing(true)

    const submitData = async () => {
      await submitApplication()

      // Определяем платформу и отправляем данные соответствующим образом
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tgWebApp = window.Telegram.WebApp

        // В Telegram WebApp отправляем данные обратно в бота
        if (tgWebApp.sendData) {
          tgWebApp.sendData(
            JSON.stringify({
              type: 'form_submission',
              application_uuid: applicationUuid,
              data: formData,
              timestamp: new Date().toISOString(),
            }),
          )

          // Показываем уведомление пользователю
          tgWebApp.showAlert('Спасибо! Ваша заявка отправлена.', () => {
            tgWebApp.close()
          })
        } else {
          throw new Error('Telegram WebApp sendData недоступен')
        }
      } else {
        // В обычном браузере показываем уведомление
        alert('Заявка успешно отправлена! Проверьте консоль для деталей.')
      }
    }

    const result = await safeAsync(submitData, (error) => {
      const submissionError = handleSubmissionError(error)
      errorHandler(submissionError)
      setError(submissionError.message)
    })

    setIsProcessing(false)

    if (!result) {
      // Ошибка уже обработана в errorHandler
      return
    }
  }, [applicationUuid, submitApplication, formData, errorHandler])

  // Получаем видимые поля для текущего шага
  const visibleFields = useMemo(() => {
    if (!currentStep) return []

    return currentStep.fields.filter((field) =>
      shouldShowField(field, { ...formData, ...currentStepData }),
    )
  }, [currentStep, formData, currentStepData])

  // Проверяем, можно ли перейти к следующему шагу
  const canProceed = useMemo(() => {
    const requiredFields = visibleFields.filter((field) => field.required)
    return requiredFields.every(
      (field) => currentStepData[field.field_id] && currentStepData[field.field_id] !== '',
    )
  }, [visibleFields, currentStepData])

  // Определяем, является ли текущий шаг последним
  const isLastStep = useMemo(() => {
    if (!currentStep || !schema) return false

    // Проверяем, есть ли следующий шаг в навигации
    if (currentStep.navigation.type === 'direct') {
      return !currentStep.navigation.next_step_id
    }

    if (currentStep.navigation.type === 'conditional') {
      // Для условной навигации сложнее определить, но можно попробовать
      return (
        !currentStep.navigation.default_next_step_id &&
        (!currentStep.navigation.rules || currentStep.navigation.rules.length === 0)
      )
    }

    return false
  }, [currentStep, schema])

  if (isLoading) {
    return (
      <div className={`${styles.widgetWindow} ${isFullscreen ? styles.fullscreen : ''}`}>
        <WidgetHeader onClose={onClose} hideCloseButton={isFullscreen} />
        <div className={styles.loading}>
          <p>Загружаем форму...</p>
        </div>
      </div>
    )
  }

  if (!schema || !currentStep) {
    return (
      <div className={`${styles.widgetWindow} ${isFullscreen ? styles.fullscreen : ''}`}>
        <WidgetHeader onClose={onClose} hideCloseButton={isFullscreen} />
        <div className={styles.error}>
          <h3>Ошибка загрузки формы</h3>
          <p>{formError || 'Не удалось загрузить схему формы'}</p>
          <Button onClick={restartForm}>Попробовать снова</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.widgetWindow} ${isFullscreen ? styles.fullscreen : ''}`}>
      <WidgetHeader onClose={onClose} hideCloseButton={isFullscreen} />

      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className={styles.errorClose}
            aria-label="Закрыть ошибку"
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.content}>
        <MessagesList messages={messages} />

        {/* Поля текущего шага */}
        <div className={styles.stepFields}>
          {visibleFields.map((field) => (
            <DynamicField
              key={field.field_id}
              field={field}
              value={currentStepData[field.field_id]}
              onChange={handleFieldChange}
              onNext={field.type === 'single_choice_buttons' ? handleNextStep : undefined}
              disabled={isProcessing}
            />
          ))}

          {/* Кнопка продолжения для полей, которые не переходят автоматически */}
          {visibleFields.length > 0 &&
            !visibleFields.some((f) => f.type === 'single_choice_buttons') && (
              <div className={styles.navigationButtons}>
                {isLastStep ? (
                  <Button
                    onClick={handleFormSubmit}
                    disabled={!canProceed || isProcessing}
                    variant="primary"
                  >
                    {isProcessing ? 'Отправляем...' : 'Отправить заявку'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextStep}
                    disabled={!canProceed || isProcessing}
                    variant="primary"
                  >
                    {isProcessing ? 'Обрабатываем...' : 'Продолжить'}
                  </Button>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default DynamicWidgetWindow
