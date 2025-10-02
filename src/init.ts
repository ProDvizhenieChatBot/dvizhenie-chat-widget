import React from 'react'
import { createRoot } from 'react-dom/client'

import ChatWidget from './components/Widget'
import { isTelegramWebApp } from './utils/platform'

import './index.css'

export interface DvizhenieWidgetConfig {
  containerId?: string
  className?: string
}

export class DvizhenieWidget {
  private root: ReturnType<typeof createRoot> | null = null
  private container: HTMLElement | null = null
  private config: DvizhenieWidgetConfig

  constructor(config: DvizhenieWidgetConfig = {}) {
    this.config = config
  }
  init() {
    if (this.config.containerId) {
      this.container = document.getElementById(this.config.containerId)
      if (!this.container) {
        console.error(`Element with id "${this.config.containerId}" not found`)
        return
      }
    } else {
      this.container = document.createElement('div')
      this.container.id = 'dvizhenie-chat-widget'
      if (this.config.className) {
        this.container.className = this.config.className
      }
      document.body.appendChild(this.container)
    }

    this.root = createRoot(this.container)

    const isTelegram = isTelegramWebApp()

    this.root.render(React.createElement(ChatWidget))

    if (isTelegram && window.Telegram?.WebApp) {
      window.Telegram.WebApp.BackButton.show()
    }

    return this
  }

  destroy() {
    if (this.root) {
      this.root.unmount()
      this.root = null
    }

    if (this.container && !this.config.containerId) {
      document.body.removeChild(this.container)
    }

    this.container = null

    if (isTelegramWebApp() && window.Telegram?.WebApp) {
      window.Telegram.WebApp.BackButton.hide()
    }
  }

  updateConfig(newConfig: Partial<DvizhenieWidgetConfig>) {
    this.config = { ...this.config, ...newConfig }

    if (this.root && this.container) {
      this.root.render(React.createElement(ChatWidget))
    }
  }
}

export const initDvizhenieWidget = (config: DvizhenieWidgetConfig = {}) => {
  const widget = new DvizhenieWidget(config)
  return widget.init()
}

if (typeof window !== 'undefined') {
  ;(
    window as typeof window & {
      DvizhenieWidget: typeof DvizhenieWidget
      initDvizhenieWidget: typeof initDvizhenieWidget
    }
  ).DvizhenieWidget = DvizhenieWidget
  ;(
    window as typeof window & {
      DvizhenieWidget: typeof DvizhenieWidget
      initDvizhenieWidget: typeof initDvizhenieWidget
    }
  ).initDvizhenieWidget = initDvizhenieWidget
}

export default DvizhenieWidget
