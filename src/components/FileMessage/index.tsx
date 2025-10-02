import {
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  AlertCircle,
  X,
} from 'lucide-react'
import React, { useState } from 'react'

import type { ChatFile } from '../../types/chat'

import styles from './styles.module.css'

export interface FileMessageProps {
  files: ChatFile[]
  onFileRemove?: (fileId: string) => void
  onFileDownload?: (file: ChatFile) => void
  showRemoveButton?: boolean
  className?: string
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return ImageIcon
  if (fileType.startsWith('video/')) return Video
  if (fileType.startsWith('audio/')) return Music
  if (fileType.includes('pdf') || fileType.includes('document')) return FileText
  return File
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Б'
  const k = 1024
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toUpperCase() || ''
}

export const FileMessage: React.FC<FileMessageProps> = ({
  files,
  onFileRemove,
  onFileDownload,
  showRemoveButton = false,
  className,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleFileClick = (file: ChatFile) => {
    if (file.type.startsWith('image/') && file.url) {
      setImagePreview(file.url)
    } else if (onFileDownload) {
      onFileDownload(file)
    }
  }

  const closeImagePreview = () => {
    setImagePreview(null)
  }

  if (files.length === 0) return null

  return (
    <>
      <div className={`${styles.fileMessage} ${className || ''}`}>
        {files.map((file) => {
          const IconComponent = getFileIcon(file.type)
          const isImage = file.type.startsWith('image/')

          return (
            <div key={file.id} className={styles.fileItem}>
              {file.error && (
                <div className={styles.errorBadge}>
                  <AlertCircle size={16} />
                </div>
              )}

              {showRemoveButton && onFileRemove && (
                <button
                  className={styles.removeButton}
                  onClick={() => onFileRemove(file.id)}
                  aria-label="Удалить файл"
                >
                  <X size={16} />
                </button>
              )}

              <div
                className={`${styles.fileContent} ${isImage ? styles.imageFile : ''}`}
                onClick={() => handleFileClick(file)}
              >
                {isImage && file.url ? (
                  <div className={styles.imagePreview}>
                    <img src={file.url} alt={file.name} className={styles.thumbnail} />
                    <div className={styles.imageOverlay}>
                      <div className={styles.fileName}>{file.name}</div>
                      <div className={styles.fileSize}>{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.fileIcon}>
                    <div className={styles.iconWrapper}>
                      <IconComponent size={24} />
                    </div>
                    <div className={styles.fileDetails}>
                      <div className={styles.fileName}>{file.name}</div>
                      <div className={styles.fileInfo}>
                        <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                        <span className={styles.fileExtension}>{getFileExtension(file.name)}</span>
                      </div>
                    </div>
                    {onFileDownload && (
                      <button className={styles.downloadButton} aria-label="Скачать файл">
                        <Download size={16} />
                      </button>
                    )}
                  </div>
                )}

                {file.uploadProgress !== undefined && file.uploadProgress < 100 && (
                  <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${file.uploadProgress}%` }}
                      />
                    </div>
                    <span className={styles.progressText}>{file.uploadProgress}%</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Полноэкранный просмотр изображения */}
      {imagePreview && (
        <div className={styles.imageModal} onClick={closeImagePreview}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={closeImagePreview}>
              <X size={24} />
            </button>
            <img src={imagePreview} alt="Предварительный просмотр" className={styles.modalImage} />
          </div>
        </div>
      )}
    </>
  )
}

export default FileMessage
