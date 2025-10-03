import { useState, useRef, useCallback } from 'react'

export interface VoiceRecordingState {
  isRecording: boolean
  isProcessing: boolean
  duration: number
  error: string | null
}

export interface UseVoiceRecordingOptions {
  maxDuration?: number // в миллисекундах, по умолчанию 60 секунд
  onRecordingComplete?: (audioBlob: Blob) => void
  onError?: (error: string) => void
}

export interface UseVoiceRecordingReturn {
  state: VoiceRecordingState
  startRecording: () => Promise<void>
  stopRecording: () => void
  cancelRecording: () => void
}

export const useVoiceRecording = (
  options: UseVoiceRecordingOptions = {},
): UseVoiceRecordingReturn => {
  const {
    maxDuration = 60000, // 1 минута по умолчанию
    onRecordingComplete,
    onError,
  } = options

  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    isProcessing: false,
    duration: 0,
    error: null,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  // Остановка записи
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      setState((prev) => ({ ...prev, isProcessing: true }))
      mediaRecorderRef.current.stop()
    }
  }, [])

  // Очистка ресурсов
  const cleanup = useCallback(() => {
    // Останавливаем таймер
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    // Останавливаем поток
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    // Сбрасываем состояние
    setState((prev) => ({
      ...prev,
      isRecording: false,
      isProcessing: false,
      duration: 0,
    }))

    startTimeRef.current = 0
    mediaRecorderRef.current = null
  }, [])

  // Обновление длительности записи
  const updateDuration = useCallback(() => {
    if (startTimeRef.current > 0) {
      const duration = Date.now() - startTimeRef.current
      setState((prev) => ({ ...prev, duration }))

      // Автоматическая остановка при достижении максимальной длительности
      if (duration >= maxDuration) {
        stopRecording()
        return
      }
    }

    timerRef.current = window.setTimeout(updateDuration, 100)
  }, [maxDuration, stopRecording])

  // Начало записи
  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null, isProcessing: true }))

      // Проверяем поддержку браузером
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Ваш браузер не поддерживает запись аудио')
      }

      // Запрашиваем доступ к микрофону
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      streamRef.current = stream

      // Создаем MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // Обработчики событий MediaRecorder
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' })

        if (onRecordingComplete && audioChunksRef.current.length > 0) {
          onRecordingComplete(audioBlob)
        }

        // Очищаем ресурсы
        cleanup()
      }

      mediaRecorder.onerror = () => {
        const error = 'Ошибка при записи аудио'
        setState((prev) => ({ ...prev, error, isRecording: false, isProcessing: false }))
        onError?.(error)
        cleanup()
      }

      // Начинаем запись
      mediaRecorder.start(100) // Собираем данные каждые 100ms
      startTimeRef.current = Date.now()

      setState((prev) => ({
        ...prev,
        isRecording: true,
        isProcessing: false,
        duration: 0,
        error: null,
      }))

      // Запускаем таймер обновления длительности
      updateDuration()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось начать запись'
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isRecording: false,
        isProcessing: false,
      }))
      onError?.(errorMessage)
      cleanup()
    }
  }, [maxDuration, onRecordingComplete, onError, updateDuration, cleanup])

  // Отмена записи
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      audioChunksRef.current = [] // Очищаем записанные данные
    }
    cleanup()
  }, [cleanup])

  return {
    state,
    startRecording,
    stopRecording,
    cancelRecording,
  }
}
