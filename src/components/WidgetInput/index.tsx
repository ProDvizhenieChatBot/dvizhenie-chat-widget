import { Paperclip } from 'lucide-react'
import React, { useState, useRef, useEffect } from 'react'

import { useVoiceInput } from '../../hooks/useVoiceInput'
import type { DvizhenieWidgetConfig } from '../../init'
import { getValidatorByType, type ValidationResult } from '../../utils/validation'
import FileDropdown from '../FileDropdown'
import VoiceButton from '../VoiceButton'

import styles from './styles.module.css'

export interface WidgetInputProps {
  isFullscreen: boolean
  onSend: (message: string) => void
  onFileUpload?: (files: FileList) => void
  onCameraClick?: () => void
  onGalleryClick?: () => void
  stepType?: string
  placeholder?: string
  config?: DvizhenieWidgetConfig
}

export const WidgetInput: React.FC<WidgetInputProps> = ({
  isFullscreen,
  onSend,
  onFileUpload,
  onCameraClick,
  onGalleryClick,
  stepType,
  placeholder = 'Введите сообщение и нажмите Enter',
  config,
}) => {
  const [value, setValue] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isFileDropdownOpen, setIsFileDropdownOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Голосовой ввод
  const voiceInput = useVoiceInput({
    onTextRecognized: (text) => {
      setValue(text)
      // Автоматически отправляем распознанный текст
      setTimeout(() => {
        validateAndSend(text)
      }, 100)
    },
    onError: (error) => {
      setValidationError(error)
    },
    saluteSpeechToken: config?.saluteSpeechToken,
  })

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      const maxHeight = parseInt(getComputedStyle(textarea).lineHeight) * 5
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`
    }
  }, [value])

  const validateAndSend = (inputValue: string) => {
    const trimmedValue = inputValue.trim()
    if (!trimmedValue) return

    // Валидируем по типу шага
    let validation: ValidationResult
    if (stepType) {
      const typeValidator = getValidatorByType(stepType)
      validation = typeValidator(trimmedValue)
    } else {
      validation = { isValid: true }
    }

    if (!validation.isValid) {
      setValidationError(validation.error || 'Некорректное значение')
      return
    }

    // Если валидация прошла успешно
    setValidationError(null)
    onSend(trimmedValue)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      validateAndSend(value)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && onFileUpload) {
      onFileUpload(files)
    }
  }

  const handleAttachClick = () => {
    setIsFileDropdownOpen((prev) => !prev)
  }

  const handleFileDropdownClose = () => {
    setIsFileDropdownOpen(false)
  }

  const handleFileSelect = (files: FileList) => {
    if (onFileUpload) {
      onFileUpload(files)
    }
  }

  // Очищаем ошибки голосового ввода при изменении текста
  const handleValueChange = (newValue: string) => {
    setValue(newValue)
    if (validationError) {
      setValidationError(null)
    }
    if (voiceInput.state.error) {
      voiceInput.clearError()
    }
  }

  return (
    <div className={isFullscreen ? '' : styles.container}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*,.pdf,.doc,.docx"
        multiple
      />

      {(validationError || voiceInput.state.error) && (
        <div className={styles.errorMessage}>{validationError || voiceInput.state.error}</div>
      )}

      <div
        className={`${styles.inputContainer} ${isFullscreen ? styles.fullscreenInputContainer : ''}`}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${styles.textarea} ${validationError || voiceInput.state.error ? styles.textareaError : ''}`}
          rows={1}
        />

        <div className={styles.actions}>
          <div className={styles.attachButtonContainer}>
            <button
              onClick={handleAttachClick}
              className={`${styles.actionButton} ${isFileDropdownOpen ? styles.active : ''}`}
              aria-label="Прикрепить файл"
            >
              <Paperclip size={20} />
            </button>

            <FileDropdown
              isOpen={isFileDropdownOpen}
              onClose={handleFileDropdownClose}
              onFileSelect={handleFileSelect}
              onCameraClick={onCameraClick}
              onGalleryClick={onGalleryClick}
            />
          </div>

          {/* Кнопка голосового ввода доступна только при наличии токена */}
          {config?.saluteSpeechToken && (
            <VoiceButton
              isRecording={voiceInput.state.isRecording}
              isProcessing={voiceInput.state.isProcessing}
              duration={voiceInput.state.duration}
              error={voiceInput.state.error}
              onStartRecording={voiceInput.startRecording}
              onStopRecording={voiceInput.stopRecording}
              onCancelRecording={voiceInput.cancelRecording}
              className={styles.actionButton}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default WidgetInput
