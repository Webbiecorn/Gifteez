import React, { useEffect, useRef, useState } from 'react'

interface LazyViewportProps {
  children: (visible: boolean) => React.ReactNode
  rootMargin?: string
  once?: boolean
}

const LazyViewport: React.FC<LazyViewportProps> = ({
  children,
  rootMargin = '200px',
  once = true,
}) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true)
            if (once) obs.disconnect()
          }
        })
      },
      { root: null, rootMargin }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [rootMargin, once])

  return <div ref={ref}>{children(visible)}</div>
}

export default LazyViewport
