import React, { useState, useEffect, useMemo, useCallback } from 'react'

import { useDynamicForm, shouldShowField } from '../../hooks/useDynamicForm'
import type { ChatFile } from '../../types/chat'
import {
  safeAsync,
  handleSubmissionError,
  telegramErrorHandler,
  defaultErrorHandler,
  type ErrorHandler,
} from '../../utils/errorHandling'
import Button from '../Button'
import { type MessageButton } from '../Message'
import MessagesList from '../MessagesList'
import WidgetHeader from '../WidgetHeader'
import WidgetInput from '../WidgetInput'
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
    { initializeForm, goToNextStep, submitApplication, restartForm },
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

  // Добавляем сообщения бота при изменении шага
  useEffect(() => {
    if (currentStep && currentStepId) {
      console.log('Показываем шаг:', currentStepId, currentStep)

      const newMessages: ChatMessage[] = []

      // Для terminate и summary шагов показываем text вместо title
      const messageText =
        currentStep.type === 'terminate' || currentStep.type === 'summary'
          ? currentStep.text || currentStep.title
          : currentStep.title

      // Добавляем основное сообщение с заголовком
      newMessages.push({
        id: `bot-${currentStepId}-title-${Date.now()}`,
        text: messageText,
        isBot: true,
      })

      // Показываем все видимые поля текущего шага
      if (currentStep.fields) {
        currentStep.fields.forEach((field, index) => {
          if (shouldShowField(field, formData)) {
            if (field.type === 'info') {
              // Информационные поля как отдельные сообщения
              newMessages.push({
                id: `bot-${currentStepId}-info-${index}-${Date.now()}`,
                text: field.text || field.label,
                isBot: true,
              })
            } else if (field.type === 'single_choice_buttons' && field.options) {
              // Поля с кнопками как сообщения с кнопками
              newMessages.push({
                id: `bot-${currentStepId}-buttons-${index}-${Date.now()}`,
                text: field.label,
                isBot: true,
                buttons: field.options.map((option, optIndex) => ({
                  id: `${field.field_id}-${optIndex}`,
                  text: option,
                  action: 'field_answer',
                  value: option,
                })),
              })
            }
          }
        })
      }

      setMessages((prev) => [...prev, ...newMessages])
      setCurrentStepData({}) // Сбрасываем данные текущего шага
    }
  }, [currentStep, currentStepId, formData])

  // Обработка нажатия кнопки
  const handleButtonClick = useCallback(
    (button: MessageButton) => {
      if (isProcessing) return

      setIsProcessing(true)

      // Добавляем сообщение пользователя
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        text: button.text,
        isBot: false,
      }
      setMessages((prev) => [...prev, userMessage])

      // Находим поле по ID кнопки
      const fieldId = button.id.split('-')[0]
      const fieldValue = button.value

      // Обновляем данные формы
      const newStepData = { ...currentStepData, [fieldId]: fieldValue }
      setCurrentStepData(newStepData)

      // Проверяем, все ли обязательные поля заполнены
      const requiredFields =
        currentStep?.fields?.filter(
          (field) => field.required && shouldShowField(field, formData),
        ) || []

      const allRequiredFilled = requiredFields.every(
        (field) => newStepData[field.field_id] || formData[field.field_id],
      )

      setTimeout(async () => {
        try {
          if (allRequiredFilled) {
            // Все обязательные поля заполнены, переходим к следующему шагу
            await goToNextStep(newStepData)
            setIsProcessing(false)
          } else {
            // Еще не все поля заполнены, остаемся на текущем шаге
            setIsProcessing(false)
          }
        } catch (error) {
          console.error('Ошибка обработки поля:', error)
          setError(error instanceof Error ? error.message : 'Ошибка обработки поля')
          setIsProcessing(false)
        }
      }, 500)
    },
    [isProcessing, currentStep, formData, currentStepData, goToNextStep],
  )

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

  // Определяем индекс последнего сообщения бота с кнопками
  const lastBotMessageIndex = useMemo(() => {
    return (
      messages
        .map((msg, idx) => (msg.isBot && msg.buttons ? idx : -1))
        .filter((idx) => idx !== -1)
        .pop() ?? -1
    )
  }, [messages])

  // Обогащаем сообщения для передачи в MessagesList
  const enrichedMessages = useMemo(() => {
    return messages.map((message, index) => {
      const isLastBotMessage = message.isBot && message.buttons && index === lastBotMessageIndex

      return {
        ...message,
        // isProcessingButton только для последнего сообщения бота с кнопками
        isProcessingButton: isLastBotMessage ? isProcessing : false,
        // onButtonClick только для последнего сообщения бота с кнопками
        onButtonClick: isLastBotMessage ? handleButtonClick : undefined,
        // Для предыдущих сообщений кнопки должны быть заблокированы
        buttonsDisabled: !isLastBotMessage,
      }
    })
  }, [messages, isProcessing, lastBotMessageIndex, handleButtonClick])

  // Обработка terminate шага
  if (currentStep?.type === 'terminate') {
    return (
      <div className={`${styles.widgetWindow} ${isFullscreen ? styles.fullscreen : ''}`}>
        <WidgetHeader onClose={onClose} hideCloseButton={isFullscreen} />
        <div className={styles.content}>
          <MessagesList messages={messages} />
          <div className={styles.stepFields}>
            <div className={styles.navigationButtons}>
              <Button onClick={restartForm} variant="filled">
                Начать заново
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Обработка summary шага
  if (currentStep?.type === 'summary') {
    return (
      <div className={`${styles.widgetWindow} ${isFullscreen ? styles.fullscreen : ''}`}>
        <WidgetHeader onClose={onClose} hideCloseButton={isFullscreen} />
        <div className={styles.content}>
          <MessagesList messages={messages} />
          <div className={styles.stepFields}>
            <div className={styles.navigationButtons}>
              <Button onClick={handleFormSubmit} disabled={isProcessing} variant="filled">
                {isProcessing ? 'Отправляем...' : 'Отправить анкету'}
              </Button>
              <Button onClick={restartForm} variant="outlined">
                Вернуться и исправить
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

      <MessagesList messages={enrichedMessages} />

      {/* Показываем поле ввода для текстовых полей */}
      {currentStep?.fields &&
        (() => {
          // Находим первое видимое текстовое поле, которое еще не заполнено
          const textField = currentStep.fields.find(
            (field) =>
              ['text', 'textarea', 'email', 'phone', 'date'].includes(field.type) &&
              shouldShowField(field, formData) &&
              !currentStepData[field.field_id],
          )

          if (textField) {
            const getPlaceholder = () => {
              switch (textField.type) {
                case 'email':
                  return 'Введите email адрес'
                case 'phone':
                  return 'Введите номер телефона'
                case 'date':
                  return 'Введите дату (ДД.ММ.ГГГГ)'
                default:
                  return textField.label
              }
            }

            const handleTextInput = (value: string) => {
              // Добавляем сообщение пользователя
              const userMessage: ChatMessage = {
                id: `user-${Date.now()}`,
                text: `${textField.label}: ${value}`,
                isBot: false,
              }
              setMessages((prev) => [...prev, userMessage])

              // Обновляем данные и переходим к следующему полю/шагу
              const newStepData = { ...currentStepData, [textField.field_id]: value }
              setCurrentStepData(newStepData)

              // Проверяем, есть ли еще незаполненные поля
              const remainingFields =
                currentStep.fields?.filter(
                  (field) =>
                    ['text', 'textarea', 'email', 'phone', 'date'].includes(field.type) &&
                    shouldShowField(field, { ...formData, ...newStepData }) &&
                    !newStepData[field.field_id],
                ) || []

              if (remainingFields.length === 0) {
                // Все поля заполнены, переходим к следующему шагу
                setTimeout(async () => {
                  try {
                    await goToNextStep(newStepData)
                  } catch (error) {
                    console.error('Ошибка перехода к следующему шагу:', error)
                    setError(
                      error instanceof Error ? error.message : 'Ошибка перехода к следующему шагу',
                    )
                  }
                }, 500)
              }
            }

            return (
              <WidgetInput
                stepType={textField.type as any}
                placeholder={getPlaceholder()}
                onSend={handleTextInput}
                isFullscreen={isFullscreen}
                onFileUpload={() => {}}
                onVoiceRecord={() => {}}
                onCameraClick={() => {}}
                onGalleryClick={() => {}}
              />
            )
          }
          return null
        })()}
    </div>
  )
}

export default DynamicWidgetWindow
