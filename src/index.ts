export { default as ChatWidget } from './components/Widget'
export type { ChatWidgetProps } from './components/Widget'

export type { FormData, ChatStep, ChatState } from './types/chat'
export type { ScenarioStep, ScenarioData, UserAnswers } from './hooks/useScenario'

export { DvizhenieWidget, initDvizhenieWidget } from './init'
export type { DvizhenieWidgetConfig } from './init'

export {
  isTelegramWebApp,
  getTelegramWebApp,
  isMobile,
  getViewportSize,
  getPlatformConfig,
} from './utils/platform'
export type { TelegramWebApp, PlatformConfig } from './utils/platform'

export { useScenario } from './hooks/useScenario'

export {
  validateEmail,
  validatePhone,
  validateDate,
  validateUrl,
  validateText,
  validateFullName,
  getValidatorByType,
} from './utils/validation'
export type { ValidationResult } from './utils/validation'

export {
  safeAsync,
  safeSync,
  createRetryFunction,
  defaultErrorHandler,
  telegramErrorHandler,
  handleNetworkError,
  handleValidationError,
  handleSubmissionError,
} from './utils/errorHandling'
export type { ErrorInfo, ErrorHandler } from './utils/errorHandling'
