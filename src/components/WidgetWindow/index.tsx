import React, { useState, useEffect, useMemo, useCallback } from 'react'

import { useScenario, type ScenarioStep } from '../../hooks/useScenario'
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
import WidgetInput from '../WidgetInput'

import styles from './styles.module.css'

export interface WidgetWindowProps {
  onClose: () => void
  isFullscreen?: boolean
}

interface ChatMessage {
  id: string
  text: string
  isBot: boolean
  buttons?: MessageButton[]
}

export const WidgetWindow: React.FC<WidgetWindowProps> = ({ onClose, isFullscreen = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isProcessingButton, setIsProcessingButton] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { currentStep, handleUserAnswer, isComplete, restart, answers } = useScenario()

  // Определяем обработчик ошибок в зависимости от платформы
  const errorHandler: ErrorHandler = useMemo(() => {
    return typeof window !== 'undefined' && window.Telegram?.WebApp
      ? telegramErrorHandler
      : defaultErrorHandler
  }, [])

  // Получение плейсхолдера для поля ввода
  const getPlaceholderForStep = useCallback((step: ScenarioStep): string => {
    switch (step.type) {
      case 'email':
        return 'Введите email адрес'
      case 'phone':
        return 'Введите номер телефона'
      case 'date':
        return 'Введите дату (ДД.ММ.ГГГГ)'
      case 'link':
        return 'Введите ссылку'
      default:
        return 'Введите ответ и нажмите Enter'
    }
  }, [])

  const handleFormSubmit = useCallback(
    async (data: Record<string, string>) => {
      console.log('📋 Данные формы отправлены:', data)

      const submitData = async () => {
        // Определяем платформу и отправляем данные соответствующим образом
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const tgWebApp = window.Telegram.WebApp

          // В Telegram WebApp отправляем данные обратно в бота
          if (tgWebApp.sendData) {
            tgWebApp.sendData(
              JSON.stringify({
                type: 'form_submission',
                data: data,
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
          // В обычном браузере можно отправить на сервер
          // Пока что просто показываем уведомление
          alert('Данные формы сохранены! Проверьте консоль для деталей.')
        }
      }

      const result = await safeAsync(submitData, (error) => {
        const submissionError = handleSubmissionError(error)
        errorHandler(submissionError)
        setError(submissionError.message)
      })

      if (!result) {
        // Ошибка уже обработана в errorHandler
        return
      }
    },
    [errorHandler],
  )

  // Обработка завершения сценария
  useEffect(() => {
    if (isComplete) {
      handleFormSubmit(answers)
    }
  }, [isComplete, answers, handleFormSubmit])

  // Добавляем сообщение бота при изменении шага
  useEffect(() => {
    if (currentStep) {
      const botMessage: ChatMessage = {
        id: `bot-${currentStep.id}-${Date.now()}`,
        text: currentStep.text,
        isBot: true,
      }

      // Добавляем кнопки если это шаг с вариантами
      if (currentStep.type === 'buttons' && currentStep.options) {
        botMessage.buttons = currentStep.options.map((option, index) => ({
          id: `${currentStep.id}-option-${index}`,
          text: option,
          action: 'select_option',
          value: option,
        }))
      }

      setMessages((prev) => [...prev, botMessage])
    }
  }, [currentStep])

  // Обработка нажатия кнопки
  const handleButtonClick = useCallback(
    (button: MessageButton) => {
      if (isProcessingButton) return

      setIsProcessingButton(true)

      // Добавляем сообщение пользователя
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        text: button.text,
        isBot: false,
      }
      setMessages((prev) => [...prev, userMessage])

      // Обрабатываем ответ через хук сценария
      setTimeout(() => {
        if (typeof button.value === 'string') {
          handleUserAnswer(button.value)
        }
        setIsProcessingButton(false)
      }, 500)
    },
    [isProcessingButton, handleUserAnswer],
  )

  const onSend = useCallback(
    (message: string) => {
      if (!message.trim() || !currentStep) return

      // Проверяем, что текущий шаг ожидает ввод
      const inputTypes = ['input', 'date', 'phone', 'email']
      if (!inputTypes.includes(currentStep.type)) return

      // Добавляем сообщение пользователя
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        text: message,
        isBot: false,
      }
      setMessages((prev) => [...prev, userMessage])

      // Обрабатываем ответ
      handleUserAnswer(message)
    },
    [currentStep, handleUserAnswer],
  )

  const onFileUpload = useCallback(
    (files: FileList) => {
      const fileNames = Array.from(files)
        .map((file) => file.name)
        .join(', ')
      onSend(`📎 Файлы: ${fileNames}`)
    },
    [onSend],
  )

  const onVoiceRecord = useCallback(() => {
    console.log('Voice recording not implemented yet')
  }, [])

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
    return messages.map((message, index) => ({
      ...message,
      isProcessingButton,
      onButtonClick:
        message.isBot && message.buttons && index === lastBotMessageIndex
          ? handleButtonClick
          : undefined,
    }))
  }, [messages, isProcessingButton, lastBotMessageIndex, handleButtonClick])

  if (isComplete) {
    return (
      <div className={`${styles.widgetWindow} ${isFullscreen ? styles.fullscreen : ''}`}>
        <WidgetHeader onClose={onClose} hideCloseButton={isFullscreen} />
        <div className={styles.complete}>
          <h3>Спасибо за заполнение анкеты! 🎉</h3>
          <p>Ваши ответы сохранены и переданы в фонд.</p>
          <button onClick={restart} className={styles.restartButton}>
            Начать заново
          </button>
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
      {/* Показываем поле ввода только для шагов с вводом текста */}
      {currentStep && ['input', 'date', 'phone', 'email', 'link'].includes(currentStep.type) && (
        <WidgetInput
          isFullscreen={isFullscreen}
          stepType={currentStep.type}
          placeholder={getPlaceholderForStep(currentStep)}
          onSend={onSend}
          onFileUpload={onFileUpload}
          onVoiceRecord={onVoiceRecord}
        />
      )}
    </div>
  )
}

export default WidgetWindow
