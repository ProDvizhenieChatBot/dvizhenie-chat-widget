import clsx from 'clsx'
import React, { useCallback } from 'react'

import Button from '../Button'

import styles from './styles.module.css'

export interface MessageButton {
  id: string
  text: string
  action: string
  value?: string | boolean
}

export interface MessageProps {
  id: string
  text: string
  isBot: boolean
  buttons?: MessageButton[]
  isProcessingButton?: boolean
  onButtonClick?: (button: MessageButton) => void
}

const Message: React.FC<MessageProps> = React.memo(
  ({ text, isBot, buttons, isProcessingButton = false, onButtonClick }) => {
    const handleButtonClick = useCallback(
      (button: MessageButton) => {
        if (!isProcessingButton && onButtonClick) {
          onButtonClick(button)
        }
      },
      [isProcessingButton, onButtonClick],
    )

    return (
      <div className={clsx(styles.message, !isBot && styles.userMessage)}>
        {isBot && (
          <div className={styles.avatar}>
            <img src="/bot_icon.svg" alt="Bot" width={40} height={40} />
          </div>
        )}

        <div className={styles.content}>
          <div className={clsx(styles.bubble, isBot ? styles.botBubble : styles.userBubble)}>
            {text}
          </div>

          {buttons && buttons.length > 0 && (
            <div className={styles.buttons}>
              {buttons.map((button) => (
                <Button
                  key={button.id}
                  variant="default"
                  onClick={() => handleButtonClick(button)}
                  disabled={isProcessingButton}
                >
                  {isProcessingButton ? '⏳ Обрабатываем...' : button.text}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  },
)

export default Message
