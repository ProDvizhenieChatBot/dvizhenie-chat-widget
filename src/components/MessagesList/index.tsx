import React, { useEffect, useRef, useCallback } from 'react'

import Message, { type MessageProps } from '../Message'

import styles from './styles.module.css'

type MessagesListProps = {
  messages: MessageProps[]
}

const MessagesList: React.FC<MessagesListProps> = React.memo(({ messages }) => {
  const containerRef = useRef<HTMLUListElement | null>(null)
  const prevLengthRef = useRef<number>(messages.length)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const c = containerRef.current
    if (!c) return
    c.scrollTo({ top: c.scrollHeight, behavior })
  }, [])

  useEffect(() => {
    const prev = prevLengthRef.current
    const now = messages.length

    if (now > prev) {
      // Всегда скроллим вниз при добавлении новых сообщений
      scrollToBottom('smooth')
    }

    prevLengthRef.current = now
  }, [messages.length, scrollToBottom])

  return (
    <ul className={styles.messagesList} ref={containerRef}>
      {messages.map((message) => (
        <Message
          key={message.id}
          id={message.id}
          text={message.text}
          isBot={message.isBot}
          buttons={message.buttons}
          files={message.files}
          isProcessingButton={message.isProcessingButton}
          buttonsDisabled={message.buttonsDisabled}
          onButtonClick={message.onButtonClick}
          onFileDownload={message.onFileDownload}
        />
      ))}
    </ul>
  )
})

export default MessagesList
