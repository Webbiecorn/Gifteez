import type React from 'react'
import { useEffect } from 'react'

interface JsonLdProps {
  data: unknown
  id?: string
}

// Injects (and updates) a JSON-LD script with optional stable id
export const JsonLd: React.FC<JsonLdProps> = ({ data, id }) => {
  useEffect(() => {
    const scriptId = id || undefined
    let script: HTMLScriptElement | null = null
    if (scriptId) {
      script = document.head.querySelector(`#${scriptId}`) as HTMLScriptElement | null
    }
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      if (scriptId) script.id = scriptId
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(data)
    return () => {
      // Optional cleanup if navigating away
      // Keep script for SPA persistence; comment out removal if you prefer retention
      // if (script && script.parentNode) script.parentNode.removeChild(script);
    }
  }, [data, id])
  return null
}

export default JsonLd
