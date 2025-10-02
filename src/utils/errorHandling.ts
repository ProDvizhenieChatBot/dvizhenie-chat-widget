/**
 * Утилиты для обработки ошибок
 */

export interface ErrorInfo {
  message: string
  code?: string
  details?: unknown
}

export type ErrorHandler = (error: ErrorInfo) => void

/**
 * Базовый обработчик ошибок
 */
export const defaultErrorHandler: ErrorHandler = (error) => {
  console.error('Widget Error:', error)

  // В продакшене можно отправлять ошибки в систему мониторинга
  if (
    typeof window !== 'undefined' &&
    (window as typeof window & { __PRODUCTION__?: boolean }).__PRODUCTION__
  ) {
    // Здесь можно добавить отправку в Sentry, LogRocket и т.д.
  }
}

/**
 * Обработчик ошибок для Telegram WebApp
 */
export const telegramErrorHandler: ErrorHandler = (error) => {
  console.error('Telegram Widget Error:', error)

  // Показываем пользователю уведомление в Telegram
  if (window.Telegram?.WebApp) {
    const tgWebApp = window.Telegram.WebApp
    tgWebApp.showAlert(`Произошла ошибка: ${error.message}`)
  }
}

/**
 * Обработчик ошибок сети
 */
export const handleNetworkError = (error: unknown): ErrorInfo => {
  if (!navigator.onLine) {
    return {
      message: 'Отсутствует подключение к интернету',
      code: 'NETWORK_OFFLINE',
    }
  }

  if (error instanceof Error && error.name === 'TimeoutError') {
    return {
      message: 'Превышено время ожидания ответа',
      code: 'NETWORK_TIMEOUT',
    }
  }

  return {
    message: 'Ошибка сети. Попробуйте позже',
    code: 'NETWORK_ERROR',
    details: error,
  }
}

/**
 * Обработчик ошибок валидации
 */
export const handleValidationError = (field: string, error: string): ErrorInfo => {
  return {
    message: `Ошибка в поле "${field}": ${error}`,
    code: 'VALIDATION_ERROR',
    details: { field, error },
  }
}

/**
 * Обработчик ошибок отправки данных
 */
export const handleSubmissionError = (error: unknown): ErrorInfo => {
  const errorObj = error as { status?: number }

  if (errorObj.status === 400) {
    return {
      message: 'Некорректные данные. Проверьте заполнение формы',
      code: 'BAD_REQUEST',
    }
  }

  if (errorObj.status === 500) {
    return {
      message: 'Ошибка сервера. Попробуйте позже',
      code: 'SERVER_ERROR',
    }
  }

  return {
    message: 'Не удалось отправить данные. Попробуйте позже',
    code: 'SUBMISSION_ERROR',
    details: error,
  }
}

/**
 * Wrapper для безопасного выполнения асинхронных операций
 */
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  errorHandler: ErrorHandler = defaultErrorHandler,
): Promise<T | null> => {
  try {
    return await operation()
  } catch (error) {
    const errorInfo: ErrorInfo = {
      message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      details: error,
    }

    errorHandler(errorInfo)
    return null
  }
}

/**
 * Wrapper для безопасного выполнения синхронных операций
 */
export const safeSync = <T>(
  operation: () => T,
  errorHandler: ErrorHandler = defaultErrorHandler,
): T | null => {
  try {
    return operation()
  } catch (error) {
    const errorInfo: ErrorInfo = {
      message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      details: error,
    }

    errorHandler(errorInfo)
    return null
  }
}

/**
 * Создает retry-функцию для повторных попыток
 */
export const createRetryFunction = <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
) => {
  return async (): Promise<T | null> => {
    let lastError: unknown

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay * attempt))
        }
      }
    }

    // Все попытки исчерпаны
    const errorInfo = handleNetworkError(lastError)
    defaultErrorHandler(errorInfo)
    return null
  }
}
