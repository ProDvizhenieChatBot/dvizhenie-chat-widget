import React, { useEffect, useRef, useState, useCallback } from 'react'

import Message, { type MessageProps } from '../Message'

import styles from './styles.module.css'

type MessagesListProps = {
  messages: MessageProps[]
}

const MessagesList: React.FC<MessagesListProps> = React.memo(({ messages }) => {
  const containerRef = useRef<HTMLUListElement | null>(null)
  const prevLengthRef = useRef<number>(messages.length)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const c = containerRef.current
    if (!c) return
    c.scrollTo({ top: c.scrollHeight, behavior })
  }, [])

  useEffect(() => {
    scrollToBottom('auto')
  }, [scrollToBottom])

  useEffect(() => {
    const c = containerRef.current
    if (!c) return

    const onScroll = () => {
      const tolerance = 60
      const atBottom = c.scrollHeight - c.scrollTop - c.clientHeight <= tolerance
      setIsAtBottom(atBottom)
    }

    c.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => c.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const prev = prevLengthRef.current
    const now = messages.length

    if (now > prev && isAtBottom) {
      scrollToBottom('smooth')
    }

    prevLengthRef.current = now
  }, [messages.length, isAtBottom, scrollToBottom])

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
          onButtonClick={message.onButtonClick}
          onFileDownload={message.onFileDownload}
        />
      ))}
    </ul>
  )
})

export default MessagesList
