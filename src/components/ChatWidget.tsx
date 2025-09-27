import React, { useState, useRef, useEffect, useCallback } from 'react'

import clsx from 'clsx'
import { MessageCircle, X, Send, Paperclip, ArrowLeft } from 'lucide-react'

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    chatState,
    getCurrentStep,
    handleButtonClick,
    handleInputSubmit,
    handleFileUpload: handleChatFileUpload,
    goToPreviousStep,
    saveProgress,
    loadProgress,
  } = useChatFlow()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const showCurrentStep = useCallback(() => {
    const currentStep = getCurrentStep()
    if (!currentStep) return

    setIsTyping(true)
    setTimeout(() => {
      const newMessage: Message = {
        id: `step-${currentStep.id}-${Date.now()}`,
        text: currentStep.text,
        isBot: true,
        timestamp: new Date(),
        buttons: currentStep.buttons,
        inputType: currentStep.inputType,
        placeholder: currentStep.placeholder,
        validation: currentStep.validation,
      }
      setMessages((prev) => [...prev, newMessage])
      setIsTyping(false)
    }, 800)
  }, [getCurrentStep])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Проверяем, есть ли сохраненный прогресс
      const urlParams = new URLSearchParams(window.location.search)
      const resumeToken = urlParams.get('resume')

      if (resumeToken && loadProgress(resumeToken)) {
        // Прогресс загружен, показываем текущий шаг
        showCurrentStep()
      } else if (loadProgress()) {
        // Есть сохраненный прогресс без токена
        showCurrentStep()
      } else {
        // Начинаем с первого шага
        showCurrentStep()
      }
    }
  }, [isOpen, messages.length, loadProgress, showCurrentStep])

  // Отслеживаем изменения текущего шага
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      showCurrentStep()
    }
  }, [chatState.currentStepId, isOpen, messages.length, showCurrentStep])

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
    onMessageSend?.(text)
  }

  const handleButtonClickLocal = (button: {
    action: string
    text: string
    value?: string | boolean
  }) => {
    addUserMessage(button.text)
    setValidationError('')

    setTimeout(() => {
      handleButtonClick(button.action, button.value)
    }, 300)
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const currentStep = getCurrentStep()

    // Валидация, если есть
    if (currentStep.validation) {
      const validationResult = currentStep.validation(inputValue)
      if (validationResult !== true) {
        setValidationError(validationResult as string)
        return
      }
    }

    addUserMessage(inputValue)
    setValidationError('')

    setTimeout(() => {
      const result = handleInputSubmit(inputValue)
      if (result !== true && typeof result === 'string') {
        setValidationError(result)
      }
    }, 300)

    setInputValue('')
  }

  const handleFileUploadLocal = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      files.forEach((file) => {
        addUserMessage(`📎 Файл загружен: ${file.name}`)
        onFileUpload?.(file)
      })

      setTimeout(() => {
        handleChatFileUpload(files)
      }, 300)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

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
            {messages.map((message) => (
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
                      {message.buttons.map((button) => (
                        <button
                          key={button.id}
                          onClick={() => handleButtonClickLocal(button)}
                          className="chat-message-button"
                          style={{ borderColor: primaryColor, color: primaryColor }}
                        >
                          {button.text}
                        </button>
                      ))}
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
            ))}

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
