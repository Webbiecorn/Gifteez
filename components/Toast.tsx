import React, { useEffect, useState } from 'react'

interface ToastProps {
  message: string
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  const [visible, setVisible] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')

  useEffect(() => {
    if (message) {
      setCurrentMessage(message)
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
      }, 2800)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [message])

  return (
    <div
      className={`fixed bottom-5 right-5 bg-primary text-white py-3 px-6 rounded-lg shadow-xl transition-all duration-300 ease-in-out z-50
                  ${visible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-5 opacity-0'}`}
      role="alert"
      aria-live="assertive"
    >
      {currentMessage}
    </div>
  )
}

export default Toast
