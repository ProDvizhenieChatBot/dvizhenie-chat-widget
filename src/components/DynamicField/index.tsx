import React, { useCallback } from 'react'

import type { FormField } from '../../types/form'
import Button from '../Button'
import FileDropdown from '../FileDropdown'
import WidgetInput from '../WidgetInput'

import styles from './styles.module.css'

export interface DynamicFieldProps {
  field: FormField
  value?: any
  onChange: (fieldId: string, value: any) => void
  onNext?: () => void
  disabled?: boolean
}

const DynamicField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChange,
  onNext,
  disabled = false,
}) => {
  const handleChange = useCallback(
    (newValue: any) => {
      onChange(field.field_id, newValue)
    },
    [field.field_id, onChange],
  )

  const handleInputSend = useCallback(
    (inputValue: string) => {
      handleChange(inputValue)
      onNext?.()
    },
    [handleChange, onNext],
  )

  const handleButtonClick = useCallback(
    (buttonValue: string) => {
      handleChange(buttonValue)
      onNext?.()
    },
    [handleChange, onNext],
  )

  const handleFileUpload = useCallback(
    (files: FileList) => {
      if (field.allow_multiple) {
        const fileArray = Array.from(files)
        handleChange(fileArray)
      } else {
        handleChange(files[0])
      }
      onNext?.()
    },
    [field.allow_multiple, handleChange, onNext],
  )

  // Информационное поле
  if (field.type === 'info') {
    return (
      <div className={styles.infoField}>
        <p>{field.text || field.label}</p>
      </div>
    )
  }

  // Кнопки выбора
  if (field.type === 'single_choice_buttons' && field.options) {
    return (
      <div className={styles.buttonField}>
        <div className={styles.buttons}>
          {field.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleButtonClick(option)}
              disabled={disabled}
              variant="default"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  // Чекбоксы для множественного выбора
  if (field.type === 'multiple_choice_checkbox' && field.options) {
    const selectedValues = Array.isArray(value) ? value : []

    const handleCheckboxChange = (option: string, checked: boolean) => {
      let newValues
      if (checked) {
        newValues = [...selectedValues, option]
      } else {
        newValues = selectedValues.filter((v: string) => v !== option)
      }
      handleChange(newValues)
    }

    return (
      <div className={styles.checkboxField}>
        {field.options.map((option, index) => (
          <label key={index} className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={selectedValues.includes(option)}
              onChange={(e) => handleCheckboxChange(option, e.target.checked)}
              disabled={disabled}
            />
            <span>{option}</span>
          </label>
        ))}
        {selectedValues.length > 0 && (
          <Button onClick={onNext} disabled={disabled} variant="filled">
            Продолжить
          </Button>
        )}
      </div>
    )
  }

  // Загрузка файлов
  if (field.type === 'file') {
    return (
      <div className={styles.fileField}>
        <FileDropdown isOpen={true} onClose={() => {}} onFileSelect={handleFileUpload} />
      </div>
    )
  }

  // Текстовые поля и поля ввода
  const inputTypes = ['text', 'textarea', 'date', 'phone', 'email']
  if (inputTypes.includes(field.type)) {
    const getPlaceholder = () => {
      switch (field.type) {
        case 'email':
          return 'Введите email адрес'
        case 'phone':
          return 'Введите номер телефона'
        case 'date':
          return 'Введите дату (ДД.ММ.ГГГГ)'
        default:
          return field.label
      }
    }

    const getStepType = () => {
      switch (field.type) {
        case 'email':
          return 'email'
        case 'phone':
          return 'phone'
        case 'date':
          return 'date'
        default:
          return 'input'
      }
    }

    return (
      <div className={styles.inputField}>
        <WidgetInput
          stepType={getStepType() as any}
          placeholder={getPlaceholder()}
          onSend={handleInputSend}
          isFullscreen={false}
          // Отключаем дополнительные функции для простых полей
          onFileUpload={() => {}}
          onVoiceRecord={() => {}}
          onCameraClick={() => {}}
          onGalleryClick={() => {}}
        />
      </div>
    )
  }

  return (
    <div className={styles.unknownField}>
      <p>Неизвестный тип поля: {field.type}</p>
    </div>
  )
}

export default DynamicField
