import React, { useEffect, useState } from 'react'
import type { ToastVariant } from '../types'

interface ToastProps {
  message: string
  variant?: ToastVariant
}

const variantClasses: Record<ToastVariant, string> = {
  default:
    'bg-primary text-white shadow-[0_18px_45px_-25px_rgba(127,29,29,0.65)] border border-primary/40',
  success:
    'bg-success text-white shadow-[0_18px_45px_-25px_rgba(16,185,129,0.55)] border border-success/40',
  info: 'bg-info text-white shadow-[0_18px_45px_-25px_rgba(59,130,246,0.55)] border border-info/40',
  warning:
    'bg-warning text-primary shadow-[0_18px_45px_-25px_rgba(245,158,11,0.55)] border border-warning/40',
  error:
    'bg-error text-white shadow-[0_18px_45px_-25px_rgba(239,68,68,0.55)] border border-error/40',
}

const Toast: React.FC<ToastProps> = ({ message, variant = 'default' }) => {
  const [visible, setVisible] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')
  const [currentVariant, setCurrentVariant] = useState<ToastVariant>('default')

  useEffect(() => {
    if (message) {
      setCurrentMessage(message)
      setCurrentVariant(variant)
      setVisible(true)
      const timer = window.setTimeout(() => {
        setVisible(false)
      }, 2800)
      return () => window.clearTimeout(timer)
    }

    setVisible(false)
    return undefined
  }, [message, variant])

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 rounded-xl px-6 py-3 transition-all duration-300 ease-in-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
      } ${variantClasses[currentVariant]}`}
      role="alert"
      aria-live="assertive"
    >
      {currentMessage}
    </div>
  )
}

export default Toast
