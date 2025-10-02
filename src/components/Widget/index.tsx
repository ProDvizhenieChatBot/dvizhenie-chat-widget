import React, { useState, useEffect } from 'react'

import { getPlatformConfig, getTelegramWebApp, isTelegramWebApp } from '../../utils/platform'
import WidgetButton from '../WidgetButton'
import WidgetWindow from '../WidgetWindow'

import styles from './styles.module.css'

export interface ChatWidgetProps {
  className?: string
}

const Widget: React.FC<ChatWidgetProps> = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [platformConfig, setPlatformConfig] = useState(getPlatformConfig())

  useEffect(() => {
    const tgWebApp = getTelegramWebApp()

    if (tgWebApp) {
      // Инициализируем Telegram WebApp
      tgWebApp.ready()
      tgWebApp.expand()

      // В Telegram WebApp виджет всегда открыт
      setIsOpen(true)

      // Настраиваем кнопку "Назад" в Telegram
      tgWebApp.BackButton.onClick(() => {
        tgWebApp.close()
      })
    }

    // Обновляем конфигурацию при изменении размеров окна
    const handleResize = () => {
      setPlatformConfig(getPlatformConfig())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleClose = () => {
    if (isTelegramWebApp()) {
      const tgWebApp = getTelegramWebApp()
      tgWebApp?.close()
    } else {
      setIsOpen(false)
    }
  }

  // В Telegram WebApp показываем полноэкранный режим
  if (platformConfig.isFullscreen) {
    return (
      <div className={styles.fullscreenWidget}>
        <WidgetWindow onClose={handleClose} isFullscreen={true} />
      </div>
    )
  }

  // На обычном сайте показываем виджет с кнопкой
  return (
    <div className={styles.widget}>
      {isOpen && <WidgetWindow onClose={handleClose} />}
      <WidgetButton onClick={() => setIsOpen((v) => !v)} isOpen={isOpen} />
    </div>
  )
}

export default Widget
