import { ChevronDown } from 'lucide-react'
import React from 'react'

import styles from './styles.module.css'

export interface WidgetHeaderProps {
  onClose: () => void
  hideCloseButton?: boolean
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({ onClose, hideCloseButton = false }) => {
  return (
    <div className={styles.widgetHeader}>
      <img src="/prodvizhenie_icon.svg" alt="icon" className={styles.widgetHeaderIcon} />
      <p className={styles.widgetHeaderTitle}>Чат-бот фонда</p>
      {!hideCloseButton && (
        <button className={styles.widgetHeaderButton} onClick={onClose}>
          <ChevronDown size={20} />
        </button>
      )}
    </div>
  )
}

export default WidgetHeader
