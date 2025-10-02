import { Camera, FileText, Image, Upload } from 'lucide-react'
import React, { useRef } from 'react'

import { isTelegramWebApp } from '../../utils/platform'

import styles from './styles.module.css'

export interface FileDropdownProps {
  isOpen: boolean
  onClose: () => void
  onFileSelect: (files: FileList) => void
  onCameraClick?: () => void
  onGalleryClick?: () => void
}

export const FileDropdown: React.FC<FileDropdownProps> = ({
  isOpen,
  onClose,
  onFileSelect,
  onCameraClick,
  onGalleryClick,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFileSelect(files)
      onClose()
    }
  }

  const handleOptionClick = (inputRef: React.RefObject<HTMLInputElement | null>) => {
    inputRef.current?.click()
  }

  const handleCameraClick = () => {
    if (onCameraClick) {
      onCameraClick()
    }
    onClose()
  }

  const handleGalleryClick = () => {
    if (onGalleryClick) {
      onGalleryClick()
    } else {
      // Fallback к обычному выбору изображений
      handleOptionClick(imageInputRef)
    }
  }

  // Определяем доступные опции в зависимости от платформы
  const isTelegram = isTelegramWebApp()
  const showCamera = isTelegram || (typeof navigator !== 'undefined' && 'mediaDevices' in navigator)

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      <div className={styles.backdrop} onClick={handleBackdropClick} />
      <div className={styles.dropdown}>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          accept="*/*"
          multiple
          onChange={handleFileInputChange}
        />
        <input
          ref={imageInputRef}
          type="file"
          style={{ display: 'none' }}
          accept="image/*"
          multiple
          onChange={handleFileInputChange}
        />
        <input
          ref={documentInputRef}
          type="file"
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
          multiple
          onChange={handleFileInputChange}
        />

        <button
          className={styles.option}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleOptionClick(fileInputRef)
          }}
          type="button"
        >
          <div className={styles.iconWrapper}>
            <Upload size={18} />
          </div>
          <span className={styles.text}>Отправить файл</span>
        </button>

        <button
          className={styles.option}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleGalleryClick()
          }}
          type="button"
        >
          <div className={styles.iconWrapper}>
            <Image size={18} />
          </div>
          <span className={styles.text}>Выбрать из галереи</span>
        </button>

        {showCamera && (
          <button
            className={styles.option}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleCameraClick()
            }}
            type="button"
          >
            <div className={styles.iconWrapper}>
              <Camera size={18} />
            </div>
            <span className={styles.text}>Сделать фото</span>
          </button>
        )}

        <button
          className={styles.option}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleOptionClick(documentInputRef)
          }}
          type="button"
        >
          <div className={styles.iconWrapper}>
            <FileText size={18} />
          </div>
          <span className={styles.text}>Документ</span>
        </button>
      </div>
    </>
  )
}

export default FileDropdown
