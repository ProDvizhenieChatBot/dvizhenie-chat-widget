import clsx from 'clsx'
import React from 'react'

import styles from './styles.module.css'

export type ButtonVariant = 'default' | 'outlined' | 'filled'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  children,
  className,
  ...props
}) => {
  return (
    <button className={clsx(styles.button, styles[variant], className)} {...props}>
      {children}
    </button>
  )
}

export default Button
