import { useCallback, useState, useMemo } from 'react'

import { createSaluteSpeechService } from '../services/saluteSpeech'

import { useVoiceRecording } from './useVoiceRecording'

export interface VoiceInputState {
  isRecording: boolean
  isProcessing: boolean
  duration: number
  error: string | null
  recognizedText: string
}

export interface UseVoiceInputOptions {
  maxDuration?: number
  onTextRecognized?: (text: string) => void
  onError?: (error: string) => void
  saluteSpeechToken?: string
}

export interface UseVoiceInputReturn {
  state: VoiceInputState
  startRecording: () => Promise<void>
  stopRecording: () => void
  cancelRecording: () => void
  clearError: () => void
  clearText: () => void
}

export const useVoiceInput = (options: UseVoiceInputOptions = {}): UseVoiceInputReturn => {
  const {
    maxDuration = 60000, // 1 минута
    onTextRecognized,
    onError,
    saluteSpeechToken,
  } = options

  const [recognizedText, setRecognizedText] = useState('')
  const [processingError, setProcessingError] = useState<string | null>(null)

  // Создаем сервис с токеном
  const speechService = useMemo(() => {
    if (!saluteSpeechToken) {
      return null
    }
    return createSaluteSpeechService(saluteSpeechToken)
  }, [saluteSpeechToken])

  // Обработка завершения записи
  const handleRecordingComplete = useCallback(
    async (audioBlob: Blob) => {
      try {
        setProcessingError(null)

        // Проверяем, что у нас есть сервис
        if (!speechService) {
          throw new Error('Не настроен токен для SaluteSpeech API')
        }

        // Отправляем аудио на распознавание
        const result = await speechService.recognizeSpeech(audioBlob)

        if (result.text) {
          setRecognizedText(result.text)
          onTextRecognized?.(result.text)
        } else {
          throw new Error('Не удалось распознать речь. Попробуйте говорить четче.')
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Ошибка при распознавании речи'
        setProcessingError(errorMessage)
        onError?.(errorMessage)
      }
    },
    [onTextRecognized, onError, speechService],
  )

  // Обработка ошибок записи
  const handleRecordingError = useCallback(
    (error: string) => {
      setProcessingError(error)
      onError?.(error)
    },
    [onError],
  )

  // Используем хук записи
  const voiceRecording = useVoiceRecording({
    maxDuration,
    onRecordingComplete: handleRecordingComplete,
    onError: handleRecordingError,
  })

  // Очистка ошибки
  const clearError = useCallback(() => {
    setProcessingError(null)
  }, [])

  // Очистка распознанного текста
  const clearText = useCallback(() => {
    setRecognizedText('')
  }, [])

  // Объединяем состояния
  const combinedState: VoiceInputState = {
    isRecording: voiceRecording.state.isRecording,
    isProcessing: voiceRecording.state.isProcessing,
    duration: voiceRecording.state.duration,
    error: processingError || voiceRecording.state.error,
    recognizedText,
  }

  return {
    state: combinedState,
    startRecording: voiceRecording.startRecording,
    stopRecording: voiceRecording.stopRecording,
    cancelRecording: voiceRecording.cancelRecording,
    clearError,
    clearText,
  }
}
