export const AUTOMATION_FLAG_STORAGE_KEY = 'gifteez_automation_mode'
export const AUTOMATION_GLOBAL_FLAG = '__GIFTEEZ_AUTOMATION__'

const PLAYWRIGHT_UA_PATTERN = /playwright|pwrunner|headlesschrome|headlessfirefox|headlesssafari/i

const getNavigator = () => {
  if (typeof navigator === 'undefined') {
    return null
  }
  return navigator
}

const getWindow = () => {
  if (typeof window === 'undefined') {
    return null
  }
  return window
}

const hasAutomationMarkerInStorage = (): boolean => {
  const win = getWindow()
  if (!win) {
    return false
  }

  try {
    if (win.localStorage.getItem(AUTOMATION_FLAG_STORAGE_KEY) === 'true') {
      return true
    }
  } catch {
    // Access to localStorage might be blocked. Ignore.
  }

  try {
    if (win.sessionStorage.getItem(AUTOMATION_FLAG_STORAGE_KEY) === 'true') {
      return true
    }
  } catch {
    // Ignore sessionStorage access issues as well.
  }

  return false
}

const hasAutomationMarkerInGlobals = (): boolean => {
  const win = getWindow()
  if (win && (win as unknown as Record<string, unknown>)[AUTOMATION_GLOBAL_FLAG]) {
    return true
  }

  if (typeof globalThis !== 'undefined' && globalThis) {
    if ((globalThis as unknown as Record<string, unknown>)[AUTOMATION_GLOBAL_FLAG]) {
      return true
    }
  }

  return false
}

const hasAutomationNavigatorHints = (): boolean => {
  const nav = getNavigator()
  if (!nav) {
    return false
  }

  if (typeof nav.webdriver === 'boolean' && nav.webdriver) {
    return true
  }

  if (nav.userAgent && PLAYWRIGHT_UA_PATTERN.test(nav.userAgent)) {
    return true
  }

  return false
}

const hasAutomationEnvVars = (): boolean => {
  if (typeof process === 'undefined' || typeof process.env === 'undefined') {
    return false
  }

  return process.env.PLAYWRIGHT === 'true' || process.env.GIFTEEZ_AUTOMATION === 'true'
}

export const isAutomationEnvironment = (): boolean => {
  return (
    hasAutomationNavigatorHints() ||
    hasAutomationMarkerInGlobals() ||
    hasAutomationMarkerInStorage() ||
    hasAutomationEnvVars()
  )
}

export const markAutomationEnvironment = () => {
  const win = getWindow()
  if (win) {
    ;(win as unknown as Record<string, unknown>)[AUTOMATION_GLOBAL_FLAG] = true
    try {
      win.localStorage.setItem(AUTOMATION_FLAG_STORAGE_KEY, 'true')
    } catch {
      // Ignore localStorage failures
    }
    try {
      win.sessionStorage.setItem(AUTOMATION_FLAG_STORAGE_KEY, 'true')
    } catch {
      // Ignore sessionStorage failures
    }
  }

  if (typeof globalThis !== 'undefined') {
    ;(globalThis as unknown as Record<string, unknown>)[AUTOMATION_GLOBAL_FLAG] = true
  }
}
