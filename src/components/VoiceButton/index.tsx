import { Mic, MicOff, Square } from 'lucide-react'
import React from 'react'

import styles from './styles.module.css'

export interface VoiceButtonProps {
  isRecording: boolean
  isProcessing: boolean
  duration: number
  error: string | null
  onStartRecording: () => void
  onStopRecording: () => void
  onCancelRecording: () => void
  disabled?: boolean
  className?: string
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isRecording,
  isProcessing,
  duration,
  error,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  disabled = false,
  className = '',
}) => {
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleClick = () => {
    if (disabled || isProcessing) return

    if (isRecording) {
      onStopRecording()
    } else {
      onStartRecording()
    }
  }

  const handleLongPress = () => {
    if (isRecording) {
      onCancelRecording()
    }
  }

  const getButtonIcon = () => {
    if (isProcessing) {
      return <div className={styles.spinner} />
    }

    if (isRecording) {
      return <Square size={16} />
    }

    if (error) {
      return <MicOff size={20} />
    }

    return <Mic size={20} />
  }

  const getButtonClass = () => {
    const classes = [styles.voiceButton]

    if (className) {
      classes.push(className)
    }

    if (isRecording) {
      classes.push(styles.recording)
    }

    if (isProcessing) {
      classes.push(styles.processing)
    }

    if (error) {
      classes.push(styles.error)
    }

    if (disabled) {
      classes.push(styles.disabled)
    }

    return classes.join(' ')
  }

  return (
    <div className={styles.container}>
      {isRecording && (
        <div className={styles.recordingIndicator}>
          <div className={styles.recordingDot} />
          <span className={styles.duration}>{formatDuration(duration)}</span>
        </div>
      )}

      <button
        onClick={handleClick}
        onContextMenu={(e) => {
          e.preventDefault()
          handleLongPress()
        }}
        className={getButtonClass()}
        disabled={disabled || isProcessing}
        aria-label={
          isRecording
            ? 'Остановить запись'
            : isProcessing
              ? 'Обработка...'
              : error
                ? 'Ошибка записи'
                : 'Начать запись голоса'
        }
        title={
          isRecording
            ? 'Нажмите для остановки записи или удерживайте для отмены'
            : 'Нажмите для начала записи голоса'
        }
      >
        {getButtonIcon()}
      </button>

      {error && <div className={styles.errorTooltip}>{error}</div>}
    </div>
  )
}

export default VoiceButton
