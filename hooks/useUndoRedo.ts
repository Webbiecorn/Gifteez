import { useState, useCallback, useRef } from 'react'

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

interface UseUndoRedoReturn<T> {
  state: T
  setState: (newState: T | ((prev: T) => T), recordHistory?: boolean) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  clearHistory: () => void
  historySize: number
}

/**
 * Custom hook for undo/redo functionality
 * @param initialState - The initial state
 * @param maxHistory - Maximum number of history states to keep (default: 50)
 */
export function useUndoRedo<T>(initialState: T, maxHistory: number = 50): UseUndoRedoReturn<T> {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  })

  const isUpdatingRef = useRef(false)

  const setState = useCallback(
    (newState: T | ((prev: T) => T), recordHistory: boolean = true) => {
      setHistory((currentHistory) => {
        const resolvedNewState =
          typeof newState === 'function'
            ? (newState as (prev: T) => T)(currentHistory.present)
            : newState

        // Don't record in history if explicitly disabled or if state hasn't changed
        if (
          !recordHistory ||
          JSON.stringify(resolvedNewState) === JSON.stringify(currentHistory.present)
        ) {
          return {
            ...currentHistory,
            present: resolvedNewState,
          }
        }

        // Add current state to past and set new state
        const newPast = [...currentHistory.past, currentHistory.present]

        // Limit history size
        if (newPast.length > maxHistory) {
          newPast.shift()
        }

        return {
          past: newPast,
          present: resolvedNewState,
          future: [], // Clear future when new state is set
        }
      })
    },
    [maxHistory]
  )

  const undo = useCallback(() => {
    setHistory((currentHistory) => {
      if (currentHistory.past.length === 0) {
        return currentHistory
      }

      const previous = currentHistory.past[currentHistory.past.length - 1]
      const newPast = currentHistory.past.slice(0, -1)

      return {
        past: newPast,
        present: previous,
        future: [currentHistory.present, ...currentHistory.future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory((currentHistory) => {
      if (currentHistory.future.length === 0) {
        return currentHistory
      }

      const next = currentHistory.future[0]
      const newFuture = currentHistory.future.slice(1)

      return {
        past: [...currentHistory.past, currentHistory.present],
        present: next,
        future: newFuture,
      }
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory((currentHistory) => ({
      past: [],
      present: currentHistory.present,
      future: [],
    }))
  }, [])

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    clearHistory,
    historySize: history.past.length + history.future.length + 1,
  }
}

export default useUndoRedo
