import React, { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Paperclip, ArrowLeft } from 'lucide-react'
import clsx from 'clsx'

import { useChatFlow } from '../hooks/useChatFlow'

import './ChatWidget.css'

export interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
  buttons?: Array<{
    id: string
    text: string
    action: string
    value?: string | boolean
  }>
  inputType?: 'text' | 'email' | 'phone' | 'date' | 'textarea' | 'file-upload'
  placeholder?: string
  required?: boolean
  validation?: (value: string) => boolean | string
}

export interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left'
  primaryColor?: string
  title?: string
  subtitle?: string
  onMessageSend?: (message: string) => void
  onFileUpload?: (file: File) => void
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  position = 'bottom-right',
  primaryColor = '#4F46E5',
  title = 'Фонд "Движение"',
  subtitle = 'Мы здесь, чтобы помочь',
  onMessageSend,
  onFileUpload,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [validationError, setValidationError] = useState<string>('')
  const [isProcessingButton, setIsProcessingButton] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    chatState,
    getCurrentStep,
    handleButtonClick,
    handleInputSubmit,
    handleFileUpload: handleChatFileUpload,
    goToPreviousStep,
    restartAfterDecline,
    saveProgress,
  } = useChatFlow()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Добавляем сообщение от бота
  const addBotMessage = useCallback(
    (
      text: string,
      buttons?: Array<{ id: string; text: string; action: string; value: string | boolean }>,
      inputType?: string,
      placeholder?: string,
      validation?: (value: string) => boolean | string,
    ) => {
      setIsTyping(true)
      setTimeout(() => {
        const newMessage: Message = {
          id: `bot-${Date.now()}`,
          text,
          isBot: true,
          timestamp: new Date(),
          buttons,
          inputType: inputType as
            | 'text'
            | 'email'
            | 'phone'
            | 'date'
            | 'textarea'
            | 'file-upload'
            | undefined,
          placeholder,
          validation,
        }
        setMessages((prev) => [...prev, newMessage])
        setIsTyping(false)
      }, 800)
    },
    [],
  )

  // Добавляем сообщение от пользователя
  const addUserMessage = useCallback(
    (text: string) => {
      const newMessage: Message = {
        id: `user-${Date.now()}`,
        text,
        isBot: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, newMessage])
      onMessageSend?.(text)
    },
    [onMessageSend],
  )

  // Показываем текущий шаг
  const showCurrentStep = useCallback(() => {
    const currentStep = getCurrentStep()
    if (!currentStep) {
      console.log('❌ NO CURRENT STEP TO SHOW')
      return
    }

    console.log('📺 SHOWING STEP:', currentStep.id, currentStep.text.substring(0, 50) + '...')
    console.log(
      '🔘 STEP TYPE:',
      currentStep.type,
      'BUTTONS:',
      currentStep.type === 'buttons' ? currentStep.buttons : 'NONE',
    )
    addBotMessage(
      currentStep.text,
      currentStep.type === 'buttons'
        ? (currentStep.buttons as Array<{
            id: string
            text: string
            action: string
            value: string | boolean
          }>)
        : undefined,
      currentStep.inputType,
      currentStep.placeholder,
      currentStep.validation,
    )
  }, [getCurrentStep, addBotMessage])

  // Инициализация чата при открытии
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      console.log('🎬 INITIALIZING CHAT')
      showCurrentStep()
    }
  }, [isOpen, messages.length, showCurrentStep])

  // Показываем новый шаг при изменении currentStepId
  useEffect(() => {
    if (isOpen && chatState.completedSteps.length > 0) {
      console.log(
        '🔄 STEP CHANGED:',
        chatState.currentStepId,
        'completed:',
        chatState.completedSteps.length,
      )
      // Очищаем состояние кнопок при переходе к новому шагу
      setIsProcessingButton(false)
      showCurrentStep()
    }
  }, [chatState.currentStepId, isOpen, showCurrentStep])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Обработка нажатия кнопки
  const handleButtonClickLocal = useCallback(
    (button: { id: string; action: string; text: string; value?: string | boolean }) => {
      // Предотвращаем повторные нажатия
      if (isProcessingButton) {
        return
      }

      // Специальная обработка для перезапуска
      if (button.action === 'restart') {
        addUserMessage(button.text)
        setMessages([]) // Очищаем все сообщения
        setIsProcessingButton(false)
        setValidationError('')

        setTimeout(() => {
          restartAfterDecline()
        }, 500)
        return
      }

      // Блокируем кнопки на время обработки
      setIsProcessingButton(true)
      addUserMessage(button.text)
      setValidationError('')

      // Обрабатываем нажатие кнопки
      setTimeout(() => {
        handleButtonClick(button.action, button.value || false)
        setIsProcessingButton(false)
      }, 300)
    },
    [isProcessingButton, addUserMessage, handleButtonClick, restartAfterDecline],
  )

  // Обработка отправки сообщения
  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return

    const currentStep = getCurrentStep()

    // Валидация
    if (currentStep.validation) {
      const validationResult = currentStep.validation(inputValue)
      if (validationResult !== true) {
        setValidationError(validationResult as string)
        return
      }
    }

    addUserMessage(inputValue)
    setValidationError('')

    const result = handleInputSubmit(inputValue)
    if (result !== true && typeof result === 'string') {
      setValidationError(result)
    }

    setInputValue('')
  }, [inputValue, getCurrentStep, addUserMessage, handleInputSubmit])

  // Обработка загрузки файлов
  const handleFileUploadLocal = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || [])
      if (files.length > 0) {
        files.forEach((file) => {
          addUserMessage(`📎 Файл загружен: ${file.name}`)
          onFileUpload?.(file)
        })
        handleChatFileUpload(files)
      }
    },
    [addUserMessage, onFileUpload, handleChatFileUpload],
  )

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage],
  )

  return (
    <>
      {/* Кнопка открытия чата */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={clsx(
            'chat-widget-button',
            position === 'bottom-right' ? 'bottom-right' : 'bottom-left',
          )}
          style={{ backgroundColor: primaryColor }}
          aria-label="Открыть чат"
        >
          <MessageCircle size={24} />
          <div className="chat-widget-notification">1</div>
        </button>
      )}

      {/* Окно чата */}
      {isOpen && (
        <div
          className={clsx(
            'chat-widget-container',
            position === 'bottom-right' ? 'bottom-right' : 'bottom-left',
          )}
        >
          {/* Заголовок чата */}
          <div className="chat-widget-header" style={{ backgroundColor: primaryColor }}>
            <div className="chat-widget-header-content">
              <div className="chat-widget-avatar">
                <MessageCircle size={20} />
              </div>
              <div className="chat-widget-header-text">
                <div className="chat-widget-title">{title}</div>
                <div className="chat-widget-subtitle">{subtitle}</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="chat-widget-close"
              aria-label="Закрыть чат"
            >
              <X size={20} />
            </button>
          </div>

          {/* Область сообщений */}
          <div className="chat-widget-messages">
            {(() => {
              // Находим индекс последнего сообщения бота ОДИН РАЗ
              const lastBotMessageIndex =
                messages
                  .map((msg, idx) => (msg.isBot ? idx : -1))
                  .filter((idx) => idx !== -1)
                  .pop() ?? -1

              console.log(
                '🔍 LAST BOT MESSAGE INDEX:',
                lastBotMessageIndex,
                'TOTAL MESSAGES:',
                messages.length,
              )

              return messages.map((message, index) => {
                // Кнопки активны только если это последнее сообщение бота И у него есть кнопки
                const areButtonsActive =
                  message.isBot &&
                  message.buttons &&
                  message.buttons.length > 0 &&
                  index === lastBotMessageIndex

                console.log(`💬 MESSAGE ${index}:`, {
                  isBot: message.isBot,
                  hasButtons: !!message.buttons,
                  buttonsCount: message.buttons?.length || 0,
                  isLastBot: index === lastBotMessageIndex,
                  areButtonsActive,
                })

                return (
                  <div
                    key={message.id}
                    className={clsx('chat-message', message.isBot ? 'bot-message' : 'user-message')}
                  >
                    {message.isBot && (
                      <div className="chat-message-avatar">
                        <MessageCircle size={16} />
                      </div>
                    )}
                    <div className="chat-message-content">
                      <div className="chat-message-text">{message.text}</div>
                      {message.buttons && (
                        <div className="chat-message-buttons">
                          {message.buttons.map((button) => {
                            const isDisabled = !areButtonsActive || isProcessingButton

                            return (
                              <button
                                key={button.id}
                                onClick={() =>
                                  areButtonsActive &&
                                  !isProcessingButton &&
                                  handleButtonClickLocal(button)
                                }
                                disabled={isDisabled}
                                className={clsx(
                                  'chat-message-button',
                                  isProcessingButton &&
                                    areButtonsActive &&
                                    'chat-message-button-loading',
                                  !areButtonsActive && 'chat-message-button-disabled',
                                )}
                                style={
                                  !areButtonsActive
                                    ? {
                                        borderColor: '#d1d5db',
                                        color: '#9ca3af',
                                        backgroundColor: '#f9fafb',
                                      }
                                    : {
                                        borderColor: primaryColor,
                                        color: primaryColor,
                                      }
                                }
                              >
                                {isProcessingButton && areButtonsActive
                                  ? '⏳ Обрабатываем...'
                                  : button.text}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    <div className="chat-message-time">
                      {message.timestamp.toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                )
              })
            })()}

            {/* Индикатор печати */}
            {isTyping && (
              <div className="chat-message bot-message">
                <div className="chat-message-avatar">
                  <MessageCircle size={16} />
                </div>
                <div className="chat-message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Поле ввода */}
          <div className="chat-widget-input">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUploadLocal}
              accept=".jpg,.jpeg,.png,.pdf"
              multiple
              style={{ display: 'none' }}
            />

            {validationError && <div className="chat-validation-error">{validationError}</div>}

            <div className="chat-input-container">
              {chatState.canGoBack && (
                <button onClick={goToPreviousStep} className="chat-input-back" aria-label="Назад">
                  <ArrowLeft size={20} />
                </button>
              )}

              {getCurrentStep()?.type === 'file-upload' ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="chat-input-file-upload"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Paperclip size={20} />
                  Загрузить файлы
                </button>
              ) : getCurrentStep()?.inputType ? (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="chat-input-attachment"
                    aria-label="Прикрепить файл"
                  >
                    <Paperclip size={20} />
                  </button>

                  {getCurrentStep()?.inputType === 'textarea' ? (
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={getCurrentStep()?.placeholder || 'Введите сообщение...'}
                      className="chat-input-textarea"
                      rows={3}
                    />
                  ) : (
                    <input
                      type={
                        getCurrentStep()?.inputType === 'phone'
                          ? 'tel'
                          : getCurrentStep()?.inputType
                      }
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={getCurrentStep()?.placeholder || 'Введите сообщение...'}
                      className="chat-input-field"
                    />
                  )}

                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="chat-input-send"
                    style={{ backgroundColor: inputValue.trim() ? primaryColor : '#e5e7eb' }}
                    aria-label="Отправить сообщение"
                  >
                    <Send size={20} />
                  </button>
                </>
              ) : (
                <div className="chat-input-placeholder">Выберите один из вариантов выше</div>
              )}

              <button
                onClick={() => {
                  const link = saveProgress()
                  navigator.clipboard.writeText(link)
                  alert('Ссылка для продолжения скопирована в буфер обмена!')
                }}
                className="chat-input-save"
                aria-label="Сохранить прогресс"
                title="Сохранить прогресс"
              >
                💾
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatWidget
