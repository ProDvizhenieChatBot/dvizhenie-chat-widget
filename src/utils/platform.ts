export interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
    }
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
    hint_color?: string
    bg_color?: string
    text_color?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  isClosingConfirmationEnabled: boolean
  isVerticalSwipesEnabled: boolean
  ready: () => void
  expand: () => void
  close: () => void
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
    setParams: (params: {
      text?: string
      color?: string
      text_color?: string
      is_active?: boolean
      is_visible?: boolean
    }) => void
  }
  BackButton: {
    isVisible: boolean
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  showPopup: (
    params: {
      title?: string
      message: string
      buttons?: Array<{
        id?: string
        type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
        text: string
      }>
    },
    callback?: (buttonId: string) => void,
  ) => void
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
  showScanQrPopup: (
    params: {
      text?: string
    },
    callback?: (text: string) => void,
  ) => void
  closeScanQrPopup: () => void
  readTextFromClipboard: (callback?: (text: string) => void) => void
  requestWriteAccess: (callback?: (granted: boolean) => void) => void
  requestContact: (
    callback?: (
      granted: boolean,
      contact?: {
        contact: {
          phone_number: string
          first_name: string
          last_name?: string
          user_id?: number
        }
      },
    ) => void,
  ) => void
  invokeCustomMethod: (
    method: string,
    params: unknown,
    callback?: (error: string, result: unknown) => void,
  ) => void
  sendData: (data: string) => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

/**
 * Проверяет, запущено ли приложение в Telegram WebApp
 */
export const isTelegramWebApp = (): boolean => {
  if (typeof window === 'undefined') return false

  // В режиме разработки проверяем URL параметр
  const params = new URLSearchParams(window.location.search)
  if (params.get('mode') === 'telegram') return true

  // В продакшене проверяем наличие Telegram WebApp API
  return window.Telegram?.WebApp !== undefined && window.Telegram.WebApp.initData !== ''
}

/**
 * Получает объект Telegram WebApp, если доступен
 */
export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window === 'undefined') return null

  // В режиме разработки (эмуляция Telegram)
  const params = new URLSearchParams(window.location.search)
  if (params.get('mode') === 'telegram') {
    // Создаем мок объект для эмуляции
    return {
      initData: '',
      initDataUnsafe: {},
      version: '6.0',
      platform: 'web',
      colorScheme: 'light',
      themeParams: {},
      isExpanded: true,
      viewportHeight: window.innerHeight,
      viewportStableHeight: window.innerHeight,
      headerColor: '#ffffff',
      backgroundColor: '#ffffff',
      isClosingConfirmationEnabled: false,
      isVerticalSwipesEnabled: true,
      ready: () => console.log('Telegram WebApp ready (mock)'),
      expand: () => console.log('Telegram WebApp expand (mock)'),
      close: () => console.log('Telegram WebApp close (mock)'),
      MainButton: {
        text: '',
        color: '#2481cc',
        textColor: '#ffffff',
        isVisible: false,
        isActive: true,
        isProgressVisible: false,
        setText: () => {},
        onClick: () => {},
        offClick: () => {},
        show: () => {},
        hide: () => {},
        enable: () => {},
        disable: () => {},
        showProgress: () => {},
        hideProgress: () => {},
        setParams: () => {},
      },
      BackButton: {
        isVisible: false,
        onClick: () => {},
        offClick: () => {},
        show: () => console.log('Telegram BackButton show (mock)'),
        hide: () => console.log('Telegram BackButton hide (mock)'),
      },
      HapticFeedback: {
        impactOccurred: () => {},
        notificationOccurred: () => {},
        selectionChanged: () => {},
      },
      showPopup: () => {},
      showAlert: (message: string, callback?: () => void) => {
        alert(message)
        callback?.()
      },
      showConfirm: (message: string, callback?: (confirmed: boolean) => void) => {
        const confirmed = confirm(message)
        callback?.(confirmed)
      },
      showScanQrPopup: () => {},
      closeScanQrPopup: () => {},
      readTextFromClipboard: () => {},
      requestWriteAccess: () => {},
      requestContact: () => {},
      invokeCustomMethod: () => {},
      sendData: (data: string) => {
        console.log('Telegram sendData (mock):', data)
        alert('Данные отправлены в Telegram (эмуляция)')
      },
    } as TelegramWebApp
  }

  // В продакшене возвращаем реальный объект
  if (window.Telegram?.WebApp) {
    return window.Telegram.WebApp
  }

  return null
}

/**
 * Проверяет, является ли устройство мобильным
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false

  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768
  )
}

/**
 * Получает размеры viewport с учетом платформы
 */
export const getViewportSize = () => {
  const tgWebApp = getTelegramWebApp()

  if (tgWebApp) {
    return {
      width: window.innerWidth,
      height: tgWebApp.viewportStableHeight || tgWebApp.viewportHeight,
      isTelegram: true,
    }
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    isTelegram: false,
  }
}

/**
 * Тип конфигурации виджета в зависимости от платформы
 */
export type PlatformConfig = {
  showButton: boolean
  isFullscreen: boolean
  maxWidth: number
  maxHeight: number
  position: 'fixed' | 'relative'
}

/**
 * Получает конфигурацию виджета в зависимости от платформы
 */
export const getPlatformConfig = (): PlatformConfig => {
  const isTg = isTelegramWebApp()
  const mobile = isMobile()

  if (isTg) {
    // В Telegram WebApp показываем только окно чата без кнопки
    return {
      showButton: false,
      isFullscreen: true,
      maxWidth: window.innerWidth,
      maxHeight: getTelegramWebApp()?.viewportStableHeight || window.innerHeight,
      position: 'relative',
    }
  }

  if (mobile) {
    // На мобильных устройствах делаем виджет адаптивным
    return {
      showButton: true,
      isFullscreen: false,
      maxWidth: Math.min(360, window.innerWidth - 32),
      maxHeight: Math.min(600, window.innerHeight - 100),
      position: 'fixed',
    }
  }

  // На десктопе используем стандартные размеры
  return {
    showButton: true,
    isFullscreen: false,
    maxWidth: 400,
    maxHeight: 600,
    position: 'fixed',
  }
}
