import React, { useState, useEffect, useMemo, useCallback } from 'react'

import { useScenario, type ScenarioStep } from '../../hooks/useScenario'
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
  files?: ChatFile[]
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

  const convertFilesToChatFiles = useCallback((files: FileList): ChatFile[] => {
    const maxFileSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]

    return Array.from(files)
      .filter((file) => {
        if (file.size > maxFileSize) {
          console.warn(`Файл ${file.name} слишком большой (${file.size} байт)`)
          return false
        }
        if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
          console.warn(`Тип файла ${file.type} не поддерживается`)
          return false
        }
        return true
      })
      .map((file) => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      }))
  }, [])

  // Очистка URL объектов при размонтировании компонента
  useEffect(() => {
    return () => {
      messages.forEach((message) => {
        if (message.files) {
          message.files.forEach((file) => {
            if (file.url) {
              URL.revokeObjectURL(file.url)
            }
          })
        }
      })
    }
  }, [messages])

  const onFileUpload = useCallback(
    (files: FileList) => {
      const chatFiles = convertFilesToChatFiles(files)

      // Создаем сообщение с файлами
      const fileMessage: ChatMessage = {
        id: `user-files-${Date.now()}`,
        text: '',
        isBot: false,
        files: chatFiles,
      }

      setMessages((prev) => [...prev, fileMessage])

      // Отправляем текстовое сообщение для обработки в сценарии
      const fileNames = chatFiles.map((f) => f.name).join(', ')
      handleUserAnswer(`Файлы: ${fileNames}`)
    },
    [convertFilesToChatFiles, handleUserAnswer],
  )

  const onVoiceRecord = useCallback(() => {
    console.log('Voice recording not implemented yet')
  }, [])

  const onCameraClick = useCallback(() => {
    // Создаем input для камеры
    const cameraInput = document.createElement('input')
    cameraInput.type = 'file'
    cameraInput.accept = 'image/*'
    cameraInput.capture = 'environment' // Задняя камера по умолчанию
    cameraInput.style.display = 'none'

    cameraInput.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        onFileUpload(target.files)
      }
      document.body.removeChild(cameraInput)
    }

    document.body.appendChild(cameraInput)
    cameraInput.click()
  }, [onFileUpload])

  const onGalleryClick = useCallback(() => {
    // Создаем input для галереи
    const galleryInput = document.createElement('input')
    galleryInput.type = 'file'
    galleryInput.accept = 'image/*'
    galleryInput.multiple = true
    galleryInput.style.display = 'none'

    galleryInput.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        onFileUpload(target.files)
      }
      document.body.removeChild(galleryInput)
    }

    document.body.appendChild(galleryInput)
    galleryInput.click()
  }, [onFileUpload])

  const onFileDownload = useCallback((file: ChatFile) => {
    if (file.url) {
      const link = document.createElement('a')
      link.href = file.url
      link.download = file.name
      link.click()
    }
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
    return messages.map((message, index) => {
      const isLastBotMessage = message.isBot && message.buttons && index === lastBotMessageIndex

      return {
        ...message,
        // isProcessingButton только для последнего сообщения бота с кнопками
        isProcessingButton: isLastBotMessage ? isProcessingButton : false,
        // onButtonClick только для последнего сообщения бота с кнопками
        onButtonClick: isLastBotMessage ? handleButtonClick : undefined,
        // Для предыдущих сообщений кнопки должны быть заблокированы
        buttonsDisabled: !isLastBotMessage,
        onFileDownload,
      }
    })
  }, [messages, isProcessingButton, lastBotMessageIndex, handleButtonClick, onFileDownload])

  if (isComplete) {
    return (
      <div className={`${styles.widgetWindow} ${isFullscreen ? styles.fullscreen : ''}`}>
        <WidgetHeader onClose={onClose} hideCloseButton={isFullscreen} />
        <div className={styles.complete}>
          <h3>Спасибо за заполнение анкеты!</h3>
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
          onCameraClick={onCameraClick}
          onGalleryClick={onGalleryClick}
        />
      )}
    </div>
  )
}

export default WidgetWindow
