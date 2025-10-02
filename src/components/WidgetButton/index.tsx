import { X } from 'lucide-react'
import React from 'react'

import styles from './styles.module.css'

export interface WidgetButtonProps {
  onClick: () => void
  isOpen?: boolean
}

export const WidgetButton: React.FC<WidgetButtonProps> = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.button} ${isOpen ? styles.open : styles.closed}`}
      aria-label="Открыть чат"
    >
      {!isOpen && (
        <span className={styles.dots} aria-hidden>
          <span className={styles.dot} />
          <span className={styles.dot} />
        </span>
      )}
      {isOpen && <X className={`${styles.icon} ${styles.iconOpen}`} />}
    </button>
  )
}

export default WidgetButton
