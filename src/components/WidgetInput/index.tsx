import { Paperclip, Mic } from 'lucide-react'
import React, { useState, useRef, useEffect } from 'react'

import { getValidatorByType, type ValidationResult } from '../../utils/validation'

import styles from './styles.module.css'

export interface WidgetInputProps {
  isFullscreen: boolean
  onSend: (message: string) => void
  onFileUpload?: (files: FileList) => void
  onVoiceRecord?: () => void
  stepType?: string
  placeholder?: string
}

export const WidgetInput: React.FC<WidgetInputProps> = ({
  isFullscreen,
  onSend,
  onFileUpload,
  onVoiceRecord,
  stepType,
  placeholder = 'Введите сообщение и нажмите Enter',
}) => {
  const [value, setValue] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Очищаем ошибку при изменении значения
  const handleValueChange = (newValue: string) => {
    setValue(newValue)
    if (validationError) {
      setValidationError(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && onFileUpload) {
      onFileUpload(files)
    }
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const handleVoiceClick = () => {
    if (onVoiceRecord) {
      onVoiceRecord()
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

      {validationError && <div className={styles.errorMessage}>{validationError}</div>}

      <div
        className={`${styles.inputContainer} ${isFullscreen ? styles.fullscreenInputContainer : ''}`}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${styles.textarea} ${validationError ? styles.textareaError : ''}`}
          rows={1}
        />

        <div className={styles.actions}>
          <button
            onClick={handleAttachClick}
            className={styles.actionButton}
            aria-label="Прикрепить файл"
          >
            <Paperclip size={20} />
          </button>

          <button
            onClick={handleVoiceClick}
            className={styles.actionButton}
            aria-label="Голосовое сообщение"
          >
            <Mic size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default WidgetInput
